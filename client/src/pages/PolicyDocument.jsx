// The full privacy policy, rendered in-app as a scrollable screen reached from
// the Privacy tab's "Read the whole policy" row. The text mirrors
// PRIVACY_POLICY.md — keep the two in sync, and keep every claim backed by the
// behaviour verified in PRIVACY_REVIEW.md.
//
// The values in POLICY_META are the only things that need a human decision
// before this is shown to real users. They're best-guess defaults; confirm them
// (see NABIL_TODOS.md). Nothing else here is a placeholder.
const POLICY_META = {
  effectiveDate: 'August 24, 2026',
  owner: 'Nabil Arnaoot',              // owner / legal name shown in the policy
  contactEmail: 'privacy@n4bil.com',   // public privacy-contact (needs forwarding set up)
  minAge: 16,                          // minimum age to use Nametag
  appUrl: 'https://nametag.n4bil.com',
};

// --- little presentational helpers, styled to the app's tokens -------------
function H({ children }) {
  return (
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19,
          color: 'var(--text)', letterSpacing: '-.3px', margin: '26px 0 10px' }}>
      {children}
    </div>
  );
}
function P({ children }) {
  return <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--muted)', margin: '0 0 10px' }}>{children}</p>;
}
function Sub({ children }) {
  return <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)', margin: '12px 0 6px' }}>{children}</div>;
}
function Bullets({ items }) {
  return (
    <ul style={{ margin: '0 0 10px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--orchid-dk)', fontWeight: 800, flexShrink: 0 }}>·</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
function B({ children }) {
  return <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{children}</strong>;
}

export default function PolicyDocument({ onBack }) {
  const { effectiveDate, owner, contactEmail, minAge, appUrl } = POLICY_META;
  return (
    <div className="no-sb na-screen" style={{ padding: '0 0 96px' }}>
      {/* back + title */}
      <div style={{ padding: '22px 22px 0' }}>
        <button onClick={onBack} className="nt-tappable" style={{ display: 'inline-flex', alignItems: 'center',
              gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              color: 'var(--muted)', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>←</span> Privacy
        </button>
        <div className="t-display" style={{ fontSize: 34, letterSpacing: '-1px', marginTop: 12, lineHeight: 1.1 }}>
          Privacy <em>policy</em>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
          Last updated {effectiveDate}
        </div>
      </div>

      {/* prototype note */}
      <div style={{ margin: '16px 22px 0', background: 'var(--blush-lt)', border: '1.5px solid var(--blush)',
            borderRadius: 'var(--r)', padding: '12px 15px', fontSize: 12.5, lineHeight: 1.55, color: 'var(--text)' }}>
        Nametag is an early prototype. Please don’t share anything you’d consider sensitive — use a photo and
        details you’re happy showing to strangers in the same room.
      </div>

      <div style={{ padding: '4px 22px 0' }}>
        <H>The short version</H>
        <Bullets items={[
          <><B>Your tag lives on our server only while you’re visible.</B> Go invisible and it’s deleted right away; leave the app for a day and it’s deleted for you.</>,
          <><B>There’s no feed, no history, and no messages.</B> We don’t record where you’ve been, who you saw, or who saw you.</>,
          <><B>Names you save stay on your phone</B> and are never sent to us.</>,
          <><B>Your account is just an email and a password,</B> and you can delete everything at any time.</>,
          <><B>We don’t sell your data, show ads, or use third-party tracking or analytics.</B></>,
        ]} />

        <H>Who we are</H>
        <P>Nametag (“we,” “us”) is an independent prototype operated by {owner}. The app is available at {appUrl}. Questions: {contactEmail}.</P>

        <H>What we collect</H>
        <Sub>Information you give us</Sub>
        <Bullets items={[
          <><B>Account:</B> your email address and a password (stored only as a secure hash).</>,
          <><B>Your tag:</B> your display name, pronouns, a one-line status, up to three stickers, a tag colour, and a profile photo — whatever you choose to add.</>,
        ]} />
        <Sub>Information collected as you use the app</Sub>
        <Bullets items={[
          <><B>Location:</B> your device’s current latitude/longitude, so we can show you people nearby and show your tag to them. We keep only your single most recent location — there is no location history. You control this through your device’s location permission and the app’s visibility control.</>,
          <><B>Basic technical data:</B> like any website, our hosting providers automatically process standard request information (e.g. IP address, browser type) to serve the app and keep it secure.</>,
        ]} />
        <Sub>Stored only on your device (never sent to us)</Sub>
        <Bullets items={[
          <>The names you choose to <B>remember</B>, the people you <B>hide</B>, your login token, and a local copy of your own tag and photo.</>,
        ]} />
        <P>We do <B>not</B> use analytics or advertising SDKs, and we do not track you across other apps or websites.</P>

        <H>How we use your information</H>
        <Bullets items={[
          'To show you people nearby and to show your tag to co-present users.',
          'To create and secure your account and let you sign back in.',
          'To send you a password-reset link if you request one.',
          'To keep the service working and protect it from abuse.',
        ]} />
        <P>We do <B>not</B> sell or rent your personal information, and we do not use it for advertising.</P>

        <H>Who can see your information</H>
        <Bullets items={[
          <><B>Other people using Nametag near you</B> can see your tag — your name, pronouns, one line, stickers, colour, and photo — while you are visible and within a short distance. They see an approximate sense of closeness, <B>not</B> your exact coordinates. If you use a <B>party code</B>, only people who enter the same code can see you.</>,
          <><B>Our service providers</B> process data on our behalf to run the app (see “Service providers” below).</>,
          <>We may disclose information if required by law, or to protect the rights, safety, or security of our users or the service.</>,
        ]} />

        <H>How long we keep it</H>
        <Bullets items={[
          <><B>Your tag and location</B> are kept only while you’re visible. They’re deleted immediately when you switch to invisible, and automatically after about 24 hours without opening the app.</>,
          <><B>Your account</B> (email and password hash) is kept until you delete your account.</>,
          <><B>Password-reset links</B> expire after one hour and can be used once.</>,
          <><B>Names you remember and people you hide</B> stay on your device until you clear them or uninstall the app.</>,
        ]} />

        <H>Deleting your data</H>
        <P>You can delete your entire account from within the app (<B>My tag → Delete account</B>). This immediately and permanently removes your account, your tag, and your photo. Going <B>invisible</B> removes your tag and location from our server without deleting your account.</P>

        <H>Service providers</H>
        <P>We use a small number of third parties to run Nametag. They process data only to provide their service to us:</P>
        <Bullets items={[
          <><B>Neon</B> — database hosting (account and tag data).</>,
          <><B>Render</B> — application hosting and photo storage.</>,
          <><B>Vercel</B> — website hosting.</>,
          <><B>Resend</B> — email delivery, used to send password-reset emails.</>,
        ]} />
        <P>Our fonts are self-hosted, so no font provider (such as Google Fonts) receives your IP address.</P>

        <H>Security</H>
        <P>We take reasonable measures to protect your information: traffic is encrypted in transit (HTTPS), passwords are stored only as salted hashes, and we minimise what we store and how long we store it. No method of transmission or storage is 100% secure, and because this is an early prototype, please don’t share anything you would consider sensitive.</P>

        <H>Your choices and rights</H>
        <Bullets items={[
          <><B>Visibility:</B> you decide when you’re visible, invisible, or limited to a party code — change it any time from the wall, My tag, or Privacy.</>,
          <><B>Location:</B> you can revoke location permission in your device settings; the app can’t place you on the wall without it.</>,
          <><B>Access and deletion:</B> you can view your own tag in the app and delete your account at any time. To make any other privacy request, contact {contactEmail}.</>,
        ]} />
        <P>Depending on where you live (for example the EU/UK under GDPR, or California under the CCPA), you may have additional rights to access, correct, delete, or port your data, and to object to certain processing. Contact us to exercise them.</P>

        <H>Children</H>
        <P>Nametag is not intended for anyone under {minAge}. We do not knowingly collect information from children under that age.</P>

        <H>International users</H>
        <P>Your information may be processed in the countries where our service providers operate (including the United States). By using Nametag you understand your data may be transferred to and processed in those locations.</P>

        <H>Changes to this policy</H>
        <P>We may update this policy as the app develops. We’ll change the “Last updated” date above, and for significant changes we’ll provide a more prominent notice.</P>

        <H>Contact</H>
        <P>Questions or requests: <B>{contactEmail}</B>.</P>
      </div>
    </div>
  );
}
