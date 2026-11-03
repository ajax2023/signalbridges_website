import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';

/**
 * Terms aligned with current Signal Bridge positioning: event-driven Flows that
 * coordinate notifications, voice, paging, and devices via cloud orchestration
 * and on-premises agents. Optional integrations remain as described.
 */
export default function Terms() {
  return (
    <LegalPage
      title="Terms of service"
      summary="Straightforward terms for using Signal Bridge responsibly, with your organization in control of its content and configuration."
    >
      <section>
        <h2>Our agreement</h2>
        <p>
          Signal Bridge is provided by 15252334 Canada Limited in Ontario, Canada. These
          terms cover our website, applications, local agents and connected services. By
          using the service, you agree to these terms. If you use it for an organization,
          you must have authority for the activities you perform.
        </p>
        <p>
          A signed customer, dealer, beta or other service agreement takes priority if it
          conflicts with these terms.           Our <Link to="/privacy-policy">privacy policy</Link> explains
          how information is handled. Contact{' '}
          <a href="mailto:ajax@online101.ca">ajax@online101.ca</a> or{' '}
          <a href="mailto:admin@signalbridges.com">admin@signalbridges.com</a> with
          questions.
        </p>
      </section>
      <section>
        <h2>What the service does</h2>
        <p>
          Depending on enabled features, Signal Bridge connects events to Flows and actions,
          including device commands, SIP or multicast (RTP) paging, telephone calls, SMS,
          email, push notifications, reminders and timers. It also provides dashboards,
          layouts, contact lists, local agents, support tools and optional document lookup
          and AI assistance. Availability varies with your plan, permissions, devices and
          integrations. Public website experience pages demonstrate these concepts with
          simulated actions only.
        </p>
      </section>
      <section>
        <h2>Your account and configuration</h2>
        <p>
          Keep your account and integration credentials secure. Organization administrators
          manage users, roles, support/dealer access, recipient lists and connected sources.
          Tell us promptly if you suspect unauthorized access.
        </p>
        <p>
          You are responsible for having the right to use the information and systems you
          connect, obtaining required recipient consent, and following applicable
          communications, privacy and recording laws. Use the service for lawful purposes.
          Do not send spam, impersonate others, attempt unauthorized access or deliberately
          disrupt the service. Authorized testing coordinated with us is welcome.
        </p>
        <p>
          Review recipients, schedules, device assignments and actions before enabling them.
          A Flow can trigger real calls, messages or device activity. Test changes in a
          controlled way and keep your organization&apos;s operating procedures current.
        </p>
      </section>
      <section>
        <h2>Safety and delivery limits</h2>
        <p>
          Signal Bridge can support operational and emergency communications, but it is not
          a substitute for emergency services, required life-safety systems or your
          organization&apos;s emergency procedures. Do not rely on it as the only way to
          summon help or deliver a critical warning. Do not assume browser or SIP calling
          provides emergency-number service or accurate emergency location.
        </p>
        <p>
          Delivery depends on networks, power, devices, recipients and third-party
          providers. Messages can be delayed or fail, and a delivery status does not
          necessarily mean a person read or heard a message. Offline operation is limited to
          supported, configured local features such as prepared RTP paging on the LAN;
          cloud notifications, SIP calling and other cloud-coordinated actions may be
          unavailable without their online services. Test your deployment and maintain
          suitable fallback procedures.
        </p>
      </section>
      <section>
        <h2>Your content and connected services</h2>
        <p>
          You and your organization retain ownership of your content, configurations and
          documents. You give us only the permission needed to host, process, transmit and
          back up that information to provide and secure the service. You do not transfer
          ownership to us.
        </p>
        <p>
          Google, Microsoft, Twilio, email providers, AI providers and other integrations
          have their own terms and availability. You control which optional connections you
          authorize. Disconnecting a provider may stop related features. A folder selected
          through a shared connection should contain only material appropriate for the
          Signal Bridge users your administrator permits to use it.
        </p>
        <p>
          AI answers can be incomplete or incorrect. Check original sources and use
          qualified human judgment for safety, policy, legal, medical or other consequential
          decisions. An AI answer is not approval to take an action or override an
          organization&apos;s rules.
        </p>
      </section>
      <section>
        <h2>Trials, charges and changes</h2>
        <p>
          Trial and beta features may change and can have limits or defects. Evaluate them
          before relying on them operationally. Pricing, included usage, renewal and
          cancellation terms are those you expressly agree to in your order or subscription.
          These terms alone do not create a paid subscription or authorize a charge.
        </p>
        <p>
          Calls, messages, AI and other metered services may incur agreed usage charges. We
          will communicate material price or service changes with reasonable notice where
          practical. We do not promise a particular uptime or recovery time unless a
          separate agreement expressly does so.
        </p>
      </section>
      <section>
        <h2>Support, suspension and leaving</h2>
        <p>
          We aim to resolve problems cooperatively. We may restrict access where reasonably
          necessary to address a security risk, unlawful use, serious disruption or an
          unresolved payment obligation under an agreed order. Where practical, we will
          explain the issue and give a reasonable opportunity to fix it; urgent risks may
          require immediate action.
        </p>
        <p>
          You may stop using the service or request cancellation under your agreed
          subscription terms. Contact us before closing an organization account to arrange
          available data export or return. Deletion and backup expiry follow the privacy
          policy and any agreed retention requirements. We do not promise indefinite storage
          after termination.
        </p>
      </section>
      <section>
        <h2>Fair limits and resolving problems</h2>
        <p>
          We will provide the service with reasonable care. Software and third-party
          networks can fail, so we cannot guarantee error-free or uninterrupted operation.
          Each party remains responsible for its own conduct, subject to applicable law and
          any separately agreed liability terms. These terms do not impose a blanket customer
          indemnity, forced arbitration or a waiver of rights that cannot legally be waived.
        </p>
        <p>
          Please contact us first so we can try to resolve a concern in good faith. Ontario
          law and applicable Canadian federal law govern these terms, subject to mandatory
          rights and jurisdiction rules that apply to you. We may update these terms with
          notice appropriate to the change; a material change will not retroactively alter an
          agreed order.
        </p>
      </section>
    </LegalPage>
  );
}
