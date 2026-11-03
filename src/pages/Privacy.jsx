import LegalPage from './LegalPage';

/**
 * Privacy policy for the Signal Bridge platform and public website.
 * Reviewed against current marketing site messaging (Events → Flows → Actions,
 * agents, RTP/SIP paging, notifications, calls, devices) and known platform
 * integrations (Firebase Auth, Twilio, SendGrid, optional Drive/AI).
 * The public /experience demo is simulation-only and does not itself collect
 * operational content; this policy covers the product and services when used.
 */
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      summary="What Signal Bridge collects, why we use it, and the choices you and your organization have."
    >
      <section>
        <h2>Who we are</h2>
        <p>
          Signal Bridge is operated by 15252334 Canada Limited in Ontario, Canada. This
          policy covers our public website, web and desktop applications, local agents,
          and connected services. For privacy questions or requests, contact{' '}
          <a href="mailto:ajax@online101.ca">ajax@online101.ca</a>. General site contact
          is also available at{' '}
          <a href="mailto:admin@signalbridges.com">admin@signalbridges.com</a>.
        </p>
        <p>
          When your school, employer, dealer or other organization provides your account,
          it controls how its workspace is configured and what information it asks Signal
          Bridge to process. Contact your organization about its own privacy practices and
          access decisions. We can help with requests relating to our service.
        </p>
      </section>
      <section>
        <h2>Information we handle</h2>
        <ul>
          <li>
            <strong>Accounts and access:</strong> name, email address, sign-in provider
            identifiers, organization and role assignments, preferences, and agreement
            acceptance records. Google or Microsoft handles its own sign-in; we do not
            receive your Google or Microsoft password. Authenticated installer downloads on
            this website use Firebase Authentication.
          </li>
          <li>
            <strong>Operational content:</strong> contacts and recipient lists, messages,
            alert responses, reminders, schedules, actions, Flows, uploaded images, layouts
            and device configurations that authorized users provide. This includes content
            used to connect events (buttons, sensors, schedules, webhooks, SIP and other
            connected systems) to coordinated actions.
          </li>
          <li>
            <strong>Calls and delivery:</strong> telephone numbers, routing details,
            call/message identifiers, status, timestamps, duration and usage charges. Audio
            passes through the relevant device, relay or communications provider when you
            use voice or paging (including SIP and LAN RTP paging paths). This policy does
            not authorize call recording; any recording feature would require a separate
            notice and appropriate consent.
          </li>
          <li>
            <strong>Devices and diagnostics:</strong> agent and device identifiers, network
            addresses and subnet information, connection status, software versions, errors,
            security events and service activity.
          </li>
          <li>
            <strong>Support and billing:</strong> information you send us, support tickets,
            authorized troubleshooting details, subscription information and usage records.
            Do not send passwords or unnecessary sensitive information in support requests.
          </li>
          <li>
            <strong>Optional connections:</strong> authorization tokens, selected folders
            and file identifiers, document text needed for lookup, and AI prompts and
            responses when those features are enabled in a deployment.
          </li>
          <li>
            <strong>Public website:</strong> standard web logs and browser storage needed
            for the marketing site and sign-in. Interactive experience pages on this website
            are simulated demonstrations and do not send real emails, calls, paging, or
            device commands.
          </li>
        </ul>
      </section>
      <section>
        <h2>Why we use it</h2>
        <p>
          We use information to provide the features you request: sign-in and access
          control, notifications, calls and paging, reminders, automation (Flows), document
          lookup and AI assistance. We also use it to provide support, calculate usage,
          maintain backups, investigate failures, protect the service and meet legal
          obligations.
        </p>
        <p>
          We do not sell personal information or use private operational content for
          advertising. We do not use Google user data for advertising or to train
          general-purpose AI models.
        </p>
      </section>
      <section>
        <h2>Google Drive and optional AI</h2>
        <p>
          Connecting Google Drive is optional and applies when that product integration is
          enabled for a tenant. The current connection requests{' '}
          <code>drive.readonly</code>, which technically permits reading and downloading
          files accessible to the connected Google account. Signal Bridge applies an
          additional application restriction to the folder selected by the administrator and
          the saved subfolder setting. It reads file metadata and document contents for
          search, preview and answers; it does not create, edit or delete Drive files.
        </p>
        <p>
          Organization administrators decide which Signal Bridge users may use that
          connection. Those users may see selected-folder material through the connected
          account. Administrators should select a folder appropriate for that audience;
          this is not a promise that every user&apos;s individual Google Drive permissions
          are independently checked.
        </p>
        <p>
          Keyword document lookup does not call an AI model. When AI answering is enabled,
          your question and relevant document excerpts are sent to the configured AI
          provider, such as OpenAI, to generate the requested answer. The platform assistant
          may use Google&apos;s Vertex AI to answer product questions or perform permitted
          troubleshooting. Enable these features only for information your organization is
          authorized to share with that provider.
        </p>
        <p>
          Drive remains the source of connected documents. We process retrieved text to
          provide the requested result rather than using this connection to build a
          permanent document archive. Connection settings and tokens are retained while
          needed for the integration. AI providers may retain requests under their
          applicable service terms; do not assume zero retention.
        </p>
        <p>
          Signal Bridge&apos;s use and transfer of information received from Google APIs
          adheres to the{' '}
          <a href="https://developers.google.com/terms/api-services-user-data-policy">
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements, and the{' '}
          <a href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy">
            Google Workspace API user data policy
          </a>
          . Google Workspace data is not used to develop, improve or train generalized AI or
          machine-learning models. Human access to that data is limited to your explicit
          permission, necessary security investigations, legal obligations, or other uses
          expressly permitted by those policies.
        </p>
      </section>
      <section>
        <h2>Who receives information</h2>
        <p>
          Your organization and its authorized administrators, dealers or support personnel
          can access information according to their assigned permissions. Alert and call
          recipients receive the content and contact details needed for the communication
          you initiate.
        </p>
        <p>
          Service providers process the information needed to operate their part of the
          service. These include Google Cloud/Firebase for hosting and identity, Twilio for
          calls and messaging, SendGrid for email, and the configured AI provider when
          enabled. An external webhook or integration receives the data your organization
          configures it to receive. We limit disclosures to providing the requested service,
          protecting rights and safety, or complying with law.
        </p>
        <p>
          Providers may process data in Canada, the United States or other countries, where
          local laws may apply. Do not assume all information stays in Canada. Discuss any
          residency or sector-specific requirements with us before using the service for
          regulated data.
        </p>
      </section>
      <section>
        <h2>Retention, security and your choices</h2>
        <p>
          We retain account, operational, support and usage records while needed to provide
          the service, meet agreed retention settings, resolve disputes or comply with law.
          Temporary uploads can have shorter automatic expiry. Deleted information may
          remain in time-limited backups until those copies expire; deleting a source record
          does not immediately erase every backup.
        </p>
        <p>
          We use access controls, encrypted connections and other safeguards appropriate to
          the service. No internet service is risk-free, and we do not promise perfect
          security or uninterrupted recovery.
        </p>
        <p>
          You can ask to access, correct or delete your personal information, withdraw
          optional consent, or raise a concern by emailing us. We may need to verify your
          identity and coordinate with your organization. Legal requirements and other
          people&apos;s rights can limit a request; we will explain applicable limits.
          Withdrawing an optional connection can make its features unavailable.
        </p>
        <p>
          You can revoke Google access through your Google Account&apos;s third-party
          connections settings, and ask your administrator or us to remove stored connection
          credentials and associated settings. Revoking access stops future authorized
          retrieval; it does not retract messages already delivered or erase records held
          independently by recipients or providers.
        </p>
      </section>
      <section>
        <h2>Website storage and school use</h2>
        <p>
          The website and applications use browser storage and authentication mechanisms
          needed for sign-in, preferences and service operation. Your browser can clear or
          restrict storage, though some features may stop working.
        </p>
        <p>
          Signal Bridge is an organizational tool, not a consumer service directed at
          children. Schools and other organizations are responsible for authorizing users
          and ensuring that student or other sensitive information is appropriate for the
          features they enable.
        </p>
      </section>
      <section>
        <h2>Changes and questions</h2>
        <p>
          We update this policy as the service changes and show the effective date above. We
          will give appropriate notice of material changes and seek additional consent where
          required. Questions or complaints can be sent to{' '}
          <a href="mailto:ajax@online101.ca">ajax@online101.ca</a>; you may also contact the
          privacy regulator responsible for your jurisdiction.
        </p>
      </section>
    </LegalPage>
  );
}
