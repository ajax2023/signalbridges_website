"""
Signal Bridge — Downloads Blueprint
====================================
Drop this file into algo-bridge-backend and register the blueprint in app.py.

Registration (app.py):
    from downloads_blueprint import downloads_bp
    app.register_blueprint(downloads_bp)

Requirements (add to requirements.txt if not already present):
    google-cloud-storage>=2.10.0
    firebase-admin>=6.0.0

IAM requirement for Cloud Run service account:
    roles/storage.objectViewer   on bucket signalbridges-downloads
    roles/iam.serviceAccountTokenCreator  on itself (for signing URLs)
    OR: use a dedicated service account key via GOOGLE_APPLICATION_CREDENTIALS

GCS bucket: signalbridges-downloads (private, uniform bucket-level access)

Object structure:
    releases/windows/console/latest.json
    releases/windows/console/SignalBridge-Console-<version>-win-Setup.exe
    releases/windows/runtime/latest.json
    releases/windows/runtime/SignalBridge-Runtime-<version>-win-Setup.exe

latest.json schema:
    {
        "version": "1.0.0",
        "filename": "SignalBridge-Console-1.0.0-win-Setup.exe",
        "sha256": "<64-char hex>",
        "sizeBytes": 89234567,
        "releaseDate": "2026-05-16",
        "notes": "Initial evaluation release."
    }
"""

import datetime
import json
import logging

from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)

downloads_bp = Blueprint('downloads', __name__)

BUCKET_NAME = 'signalbridges-downloads'
SIGNED_URL_EXPIRY_MINUTES = 15

RELEASE_CONFIGS = [
    {
        'type': 'console',
        'platform': 'windows',
        'displayName': 'Signal Bridge Console',
        'description': (
            'Electron-based operator console for dispatch, paging, '
            'alert routing, and operational workflows.'
        ),
        'latestJsonPath': 'releases/windows/console/latest.json',
        'installerPrefix': 'releases/windows/console/',
    },
    {
        'type': 'runtime',
        'platform': 'windows',
        'displayName': 'Signal Bridge Edge Agent',
        'description': (
            'On-premise execution agent for RTP paging, local device '
            'operations, and offline-capable workflows.'
        ),
        'latestJsonPath': 'releases/windows/runtime/latest.json',
        'installerPrefix': 'releases/windows/runtime/',
    },
]

RELEASE_MAP = {
    (cfg['type'], cfg['platform']): cfg for cfg in RELEASE_CONFIGS
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _verify_firebase_token(req):
    """Verify Firebase ID token from Authorization header.

    Returns (decoded_token, None) on success or (None, (message, status_code)).
    """
    from firebase_admin import auth as firebase_auth

    auth_header = req.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None, ('Missing or invalid Authorization header', 401)

    token = auth_header[7:]
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded, None
    except firebase_auth.ExpiredIdTokenError:
        return None, ('Token expired', 401)
    except Exception:
        return None, ('Invalid token', 401)


def _check_download_authorization(uid, db):
    """Return (True, None) if user is allowed to download, else (False, reason).

    Access rules:
    - User record must exist in Firestore
    - User must be active
    - Superadmin or admin roles bypass tenant check
    - Otherwise, user's tenant must have downloadsEnabled = True
    """
    try:
        user_doc = db.collection('users').document(uid).get()
        if not user_doc.exists:
            return False, 'User record not found'

        user_data = user_doc.to_dict()

        if not user_data.get('active', False):
            return False, 'Account is not active'

        role = user_data.get('role', '')
        if role in ('superadmin', 'admin'):
            return True, None

        tenant_id = user_data.get('tenantId')
        if not tenant_id:
            return False, 'No tenant assignment'

        tenant_doc = db.collection('tenants').document(tenant_id).get()
        if not tenant_doc.exists:
            return False, 'Tenant not found'

        tenant_data = tenant_doc.to_dict()
        if not tenant_data.get('downloadsEnabled', False):
            return False, 'Downloads not enabled for this tenant'

        return True, None

    except Exception as exc:
        logger.error('Authorization check failed for uid=%s: %s', uid, exc)
        return False, 'Authorization check failed'


def _read_latest_json(bucket_name, json_path):
    """Read and parse latest.json from GCS. Returns (data_dict, None) or (None, error_str)."""
    from google.cloud import storage

    try:
        client = storage.Client()
        blob = client.bucket(bucket_name).blob(json_path)
        content = blob.download_as_text()
        return json.loads(content), None
    except Exception as exc:
        logger.error('Failed to read GCS object %s/%s: %s', bucket_name, json_path, exc)
        return None, str(exc)


def _generate_signed_url(bucket_name, object_name, expiry_minutes=15):
    """Generate a v4 signed URL using Workload Identity (Cloud Run) or ADC.

    The Cloud Run service account must have:
      - roles/storage.objectViewer on the bucket
      - roles/iam.serviceAccountTokenCreator on itself

    For local development with a service account key file, set
    GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json and this will work
    automatically via google.auth.default().
    """
    import google.auth
    from google.auth.transport.requests import Request as GoogleRequest
    from google.cloud import storage

    credentials, _ = google.auth.default(
        scopes=['https://www.googleapis.com/auth/cloud-platform']
    )
    credentials.refresh(GoogleRequest())

    client = storage.Client(credentials=credentials)
    blob = client.bucket(bucket_name).blob(object_name)

    url = blob.generate_signed_url(
        version='v4',
        expiration=datetime.timedelta(minutes=expiry_minutes),
        method='GET',
        service_account_email=credentials.service_account_email,
        access_token=credentials.token,
    )
    return url


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@downloads_bp.route('/api/downloads/releases', methods=['GET'])
def get_releases():
    """Return available release metadata for all apps the user is allowed to download.

    Does NOT return signed URLs. Signed URLs are issued per-app on download request.

    Response:
        200 { "releases": [ { type, platform, displayName, description,
                               version, sha256, sizeBytes, releaseDate, notes } ] }
        401 if token is missing/invalid
        403 if user is not authorized
    """
    # Import db from the app context (matches existing pattern in algo-bridge-backend)
    from flask import current_app
    db = current_app.config['FIRESTORE_DB']

    decoded_token, err = _verify_firebase_token(request)
    if err:
        return jsonify({'error': err[0]}), err[1]

    uid = decoded_token['uid']
    authorized, reason = _check_download_authorization(uid, db)
    if not authorized:
        logger.warning('download releases denied uid=%s reason=%s', uid, reason)
        return jsonify({'error': 'Not authorized'}), 403

    releases = []
    for cfg in RELEASE_CONFIGS:
        metadata, read_err = _read_latest_json(BUCKET_NAME, cfg['latestJsonPath'])
        if metadata:
            releases.append({
                'type': cfg['type'],
                'platform': cfg['platform'],
                'displayName': cfg['displayName'],
                'description': cfg['description'],
                'version': metadata.get('version'),
                'sha256': metadata.get('sha256'),
                'sizeBytes': metadata.get('sizeBytes'),
                'releaseDate': metadata.get('releaseDate'),
                'notes': metadata.get('notes'),
            })
        else:
            logger.warning(
                'latest.json unavailable for %s/%s: %s',
                cfg['type'], cfg['platform'], read_err,
            )

    return jsonify({'releases': releases}), 200


@downloads_bp.route('/api/downloads/<app_type>/<platform>', methods=['GET'])
def get_download_url(app_type, platform):
    """Generate a short-lived signed URL for a specific installer.

    Response:
        200 { "downloadUrl": "...", "version": "...", "sha256": "...",
               "sizeBytes": N, "expiresInSeconds": 900 }
        401 invalid/missing token
        403 not authorized
        404 unknown app type / platform, or no release available
        503 signed URL generation failed
    """
    from flask import current_app
    db = current_app.config['FIRESTORE_DB']

    decoded_token, err = _verify_firebase_token(request)
    if err:
        return jsonify({'error': err[0]}), err[1]

    uid = decoded_token['uid']
    authorized, reason = _check_download_authorization(uid, db)
    if not authorized:
        logger.warning(
            'download URL denied uid=%s app=%s/%s reason=%s',
            uid, app_type, platform, reason,
        )
        return jsonify({'error': 'Not authorized'}), 403

    cfg = RELEASE_MAP.get((app_type, platform))
    if not cfg:
        return jsonify({'error': 'Unknown release type or platform'}), 404

    metadata, read_err = _read_latest_json(BUCKET_NAME, cfg['latestJsonPath'])
    if not metadata:
        return jsonify({'error': 'No release available'}), 404

    filename = metadata.get('filename')
    if not filename:
        logger.error('latest.json for %s/%s is missing filename field', app_type, platform)
        return jsonify({'error': 'Release metadata incomplete'}), 500

    object_path = cfg['installerPrefix'] + filename

    try:
        signed_url = _generate_signed_url(
            BUCKET_NAME, object_path, SIGNED_URL_EXPIRY_MINUTES
        )
    except Exception as exc:
        logger.error(
            'Signed URL generation failed uid=%s app=%s/%s error=%s',
            uid, app_type, platform, exc,
        )
        return jsonify({'error': 'Download temporarily unavailable'}), 503

    # Log the event WITHOUT the signed URL
    logger.info(
        'download_event uid=%s app=%s/%s version=%s success=true',
        uid, app_type, platform, metadata.get('version'),
    )

    return jsonify({
        'downloadUrl': signed_url,
        'version': metadata.get('version'),
        'sha256': metadata.get('sha256'),
        'sizeBytes': metadata.get('sizeBytes'),
        'expiresInSeconds': SIGNED_URL_EXPIRY_MINUTES * 60,
    }), 200
