// The full privacy policy, rendered in-app as a scrollable screen reached from
// the Privacy tab's "Read the whole policy" row. The text mirrors
// PRIVACY_POLICY.md — keep the two in sync, and keep every claim backed by the
// behaviour verified in PRIVACY_REVIEW.md.
//
// The retention times quoted below are the constants in server/cleanup.js
// (STALE_MINUTES, PARTY_CODE_HOURS, UNVERIFIED_ACCOUNT_DAYS) — change one, change
// the other.
//
// The values in POLICY_META are the only things that need a human decision
// before this is shown to real users. They're best-guess defaults; confirm them
// (see NABIL_TODOS.md). Nothing else here is a placeholder.
const POLICY_META = {
  effectiveDate: 'November 12, 2026',
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
          Privacy policy
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
          <><B>Your tag lives on your device.</B> A copy is held on our server only while you’re on the wall. Go invisible and it’s deleted at once; close the app and it’s deleted straight away where we can, and otherwise within about half an hour.</>,
          <><B>Nobody is told where you are.</B> Other people see your tag — never your location, and never how far away you are.</>,
          <><B>There’s no feed, no history, and no messages.</B> We don’t record where you’ve been, who you saw, or who saw you.</>,
          <><B>Party codes run out after four hours.</B> You then go invisible and your tag is deleted from our server.</>,
          <><B>Names you save stay on your phone</B> and are never sent to us.</>,
          <><B>Your account is just an email and a password,</B> and you can delete everything at any time.</>,
          <><B>We don’t sell your data, show ads, or use third-party tracking or analytics.</B></>,
        ]} />

        <H>Who we are</H>
        <P>Nametag (“we,” “us”) is an independent prototype operated by {owner}. The app is available at {appUrl}. Questions: {contactEmail}.</P>

        <H>Why anything is on a server at all</H>
        <P>Nametag is built to keep your information on your own device. But for two phones in the same room to find each other over the internet, something in between has to know that both are there. So while you are visible — and only then — our server briefly holds a copy of your tag and a rounded location. Everything below describes that copy and how quickly it’s deleted.</P>

        <H>What we collect</H>
        <Sub>Information you give us</Sub>
        <Bullets items={[
          <><B>Account:</B> your email address and a password (stored only as a secure hash), plus a couple of settings: whether you last chose to be invisible, and the distance we search around you.</>,
          <><B>Your tag:</B> your display name, pronouns, a one-line status, up to three stickers, a tag colour, and a profile photo — whatever you choose to add. The photo is cropped to a small square on your device before it’s sent; we never receive the original.</>,
          <><B>A party code,</B> if you enter one, and the time you entered it.</>,
        ]} />
        <Sub>Information collected as you use the app</Sub>
        <Bullets items={[
          <><B>Location:</B> your device’s current position, so we can show you people nearby and show your tag to them. We round it to about ten metres before storing it, and keep only your single most recent position — there is no location history. While you’re invisible we don’t store a location at all. You control this through your device’s location permission and the app’s visibility control.</>,
          <><B>Basic technical data:</B> like any website, our hosting providers automatically process standard request information (e.g. IP address, browser type) to serve the app and keep it secure.</>,
        ]} />
        <Sub>Stored only on your device (never sent to us)</Sub>
        <Bullets items={[
          <>The names you choose to <B>remember</B> and the people you <B>hide</B>.</>,
          <>Your sign-in token, and the lasting copy of your own tag and photo — this is what puts your tag back on the wall when you return. (On the web, “your device” means this browser’s storage.)</>,
        ]} />
        <P>We do <B>not</B> use analytics or advertising SDKs, and we do not track you across other apps or websites.</P>

        <H>How we use your information</H>
        <Bullets items={[
          'To show you people nearby and to show your tag to co-present users.',
          'To create and secure your account and let you sign back in.',
          'To email you a link to confirm your address when you sign up, and a password-reset link if you ask for one.',
          'To keep the service working and protect it from abuse.',
        ]} />
        <P>We do <B>not</B> sell or rent your personal information, and we do not use it for advertising.</P>

        <H>Who can see your information</H>
        <Bullets items={[
          <><B>Other people using Nametag near you</B> can see your tag — your name, pronouns, one line, stickers, colour, and photo — while you are visible and within a short distance (about 100 metres). They are <B>not</B> shown your location or your distance from them; tags simply appear, roughly nearest first. If you use a <B>party code</B>, only people who enter the same code can see you, and you see only them.</>,
          <><B>Your photo</B> is shown to those people from a long, random web address. It isn’t listed anywhere, but anyone who is given that exact address could open the photo until it’s deleted.</>,
          <><B>Our service providers</B> process data on our behalf to run the app (see “Service providers” below).</>,
          <>We may disclose information if required by law, or to protect the rights, safety, or security of our users or the service.</>,
        ]} />

        <H>How long we keep it</H>
        <Bullets items={[
          <><B>Your tag, photo and location</B> are on our server only while you’re on the wall. They’re deleted <B>immediately</B> when you switch to invisible. When you close the app we delete them straight away where the app is able to tell us (closing the page in a browser); otherwise they’re deleted automatically once the app hasn’t checked in for <B>30 minutes</B> — and other people stop seeing you at that same point.</>,
          <><B>Party codes</B> last <B>4 hours</B> from when you enter them. After that you go invisible and your tag is deleted from our server.</>,
          <><B>Your account</B> (email, password hash and visibility setting) is kept until you delete your account. If you sign up but never confirm your email, the sign-up is deleted after 2 days.</>,
          <><B>Email links:</B> confirmation links last 24 hours and password-reset links one hour; each works once. Our record of a link is deleted once it’s used or expired.</>,
          <><B>Names you remember, people you hide, and your own tag</B> stay on your device until you delete your account, sign in as someone else on that device, or clear the app’s storage.</>,
        ]} />
        <P>Two honest caveats. The automatic clean-up runs every few minutes while our server is awake; if nobody at all has used Nametag for a while the server sleeps, and the clean-up finishes as soon as it next wakes — nobody can see your tag in the meantime. And once we delete something, traces may remain for a limited time in our providers’ routine backups and logs, which we don’t control directly.</P>

        <H>Deleting your data</H>
        <P>You can delete your entire account from within the app (<B>My tag → Delete account</B>). This immediately and permanently removes your account, your tag, and your photo from our server, and clears the copy on that device. Going <B>invisible</B> removes your tag, photo, location and party code from our server without deleting your account.</P>

        <H>Service providers</H>
        <P>We use a small number of third parties to run Nametag. They process data only to provide their service to us:</P>
        <Bullets items={[
          <><B>Neon</B> — database hosting (your account, and your tag and location while you’re visible).</>,
          <><B>Render</B> — application hosting and photo storage (your photo while you’re visible).</>,
          <><B>Vercel</B> — website hosting; requests to the app pass through it.</>,
          <><B>Resend</B> — email delivery, used to send account-confirmation and password-reset emails. It receives your email address and the message.</>,
        ]} />
        <P>Our fonts are self-hosted, so no font provider (such as Google Fonts) receives your IP address.</P>

        <H>Security</H>
        <P>We take reasonable measures to protect your information: traffic is encrypted in transit (HTTPS), passwords are stored only as salted hashes, and we minimise what we store and how long we store it. No method of transmission or storage is 100% secure, and because this is an early prototype, please don’t share anything you would consider sensitive.</P>

        <H>Your choices and rights</H>
        <Bullets items={[
          <><B>Visibility:</B> you decide when you’re visible, invisible, or limited to a party code — change it any time from the wall or My tag. Invisible stays on until you turn it off.</>,
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
