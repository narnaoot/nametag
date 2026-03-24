export default function PrivacyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-page">
      <header className="bg-white sticky top-0 z-10 border-b-2 border-line">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="font-caveat text-sm font-semibold text-dim"
            style={{ fontSize: 15 }}
          >
            ← Back
          </button>
          <span className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>Privacy Policy</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-slate-700">
        <p className="text-sm text-slate-400">Last updated: March 2026</p>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>What Nametag is</h2>
          <p className="text-sm leading-relaxed">
            Nametag is a location-based social discovery app. When you open it, people nearby can see your name, pronouns, and photo. That&apos;s the whole idea — a digital &ldquo;Hello, my name is&rdquo; badge.
          </p>
          <p className="text-sm leading-relaxed">
            Our guiding principle: <strong>the server is a relay, not a data store.</strong> We keep your data on our servers only for as long as strictly necessary, then delete it. This page explains exactly what that means.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>What we collect</h2>
          <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Email address</strong> — used only for account authentication and password resets. Never shared.</li>
            <li><strong>Display name and pronouns</strong> — shown to nearby people when you&apos;re visible.</li>
            <li><strong>Tagline</strong> — optional short text shown on your nametag.</li>
            <li><strong>Profile photo</strong> — optional. Stored on-device as the primary copy; a copy is uploaded to our server only while you are visible to others.</li>
            <li><strong>Location</strong> — your approximate location (latitude/longitude) is sent to the server when you open the nearby screen. We store only your single most recent location — there is no location history.</li>
            <li><strong>Nametag color, stickers, and radius</strong> — display preferences.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            We do not collect your contacts, browsing history, precise movement data, or any data beyond what is listed above.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>How long we keep it</h2>
          <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Location</strong> — cleared immediately when you go invisible, and automatically cleared if your location hasn&apos;t been refreshed in 24 hours.</li>
            <li><strong>Profile photo (server copy)</strong> — deleted immediately when you go invisible. Re-uploaded from your device the next time you go visible.</li>
            <li><strong>Profile data</strong> — kept as long as your account exists. Deleted immediately and permanently when you delete your account.</li>
            <li><strong>Email</strong> — deleted immediately and permanently when you delete your account.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>Who sees your data</h2>
          <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Other users</strong> — only when you are visible. They see your name, pronouns, tagline, photo, and color. They do not see your email or exact coordinates.</li>
            <li><strong>Third parties</strong> — we do not sell or share your data with any third party for advertising or analytics.</li>
            <li><strong>Infrastructure</strong> — we use Render (server hosting), Neon (PostgreSQL database), and Vercel (frontend hosting). These providers process data on our behalf under their own privacy policies.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>Your rights</h2>
          <ul className="text-sm space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Go invisible at any time</strong> — removes your photo and location from the server immediately.</li>
            <li><strong>Delete your account</strong> — available in your Profile tab. This permanently and immediately deletes your user account, profile, and server-side photo. There is no recovery.</li>
            <li><strong>Data portability</strong> — your profile photo primary copy lives on your device. Your profile text is stored locally on-device as well.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>Cookies and tracking</h2>
          <p className="text-sm leading-relaxed">
            We do not use cookies or third-party trackers. Your authentication token is stored locally on your device using secure preferences storage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-caveat font-bold text-ink" style={{ fontSize: 22 }}>Changes to this policy</h2>
          <p className="text-sm leading-relaxed">
            If we make meaningful changes to this policy, we will update the date at the top of this page. Continued use of Nametag after changes constitutes acceptance.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={onBack}
            className="font-caveat font-semibold text-brand"
            style={{ fontSize: 16 }}
          >
            ← Back to Nametag
          </button>
        </div>
      </main>
    </div>
  );
}
