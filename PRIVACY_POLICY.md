# Nametag — Privacy Policy

> **DRAFT — needs your review and a legal check before it's published or linked.**
> It describes how the app behaves **today** (verified against the code in
> `PRIVACY_REVIEW.md`). Fill in every `[BRACKETED]` placeholder, and make sure the
> High/Medium fixes in the review are done — or this text is adjusted — before you
> put it in front of real people. Nametag is an **early prototype**.

**Last updated:** [EFFECTIVE DATE]
**Contact:** [PRIVACY CONTACT EMAIL]

---

## The short version

Nametag shows you the people who are physically near you, as a wall of digital
name tags, so you can go say hello. To do that it needs to know your rough
whereabouts and what to put on your tag — but only while you choose to be visible.

- **Your tag lives on our server only while you're visible.** Go invisible and
  it's deleted right away; leave the app for a day and it's deleted for you.
- **There's no feed, no history, and no messages.** We don't record where you've
  been, who you saw, or who saw you.
- **Names you save stay on your phone** and are never sent to us.
- **Your account is just an email and a password**, and you can delete everything
  at any time.
- **We don't sell your data, show ads, or use third-party tracking or analytics.**

The rest of this document is the detail.

---

## Who we are

Nametag ("we," "us") is an independent prototype operated by [OWNER / LEGAL NAME].
The app is available at https://nametag.n4bil.com. Questions:
[PRIVACY CONTACT EMAIL].

## What we collect

**Information you give us**
- **Account:** your email address and a password (stored only as a secure hash).
- **Your tag:** your display name, pronouns, a one-line status, up to three
  stickers, a tag colour, and a profile photo — whatever you choose to add.

**Information collected as you use the app**
- **Location:** your device's current latitude/longitude, so we can show you
  people nearby and show your tag to them. We keep only your **single most recent
  location** — there is no location history. You control this through your
  device's location permission and the app's visibility control.
- **Basic technical data:** like any website, our hosting providers automatically
  process standard request information (e.g. IP address, browser type) to serve
  the app and keep it secure.

**Stored only on your device (never sent to us)**
- The names you choose to **remember**, the people you **hide**, your login token,
  and a local copy of your own tag and photo.

We do **not** use analytics or advertising SDKs, and we do not track you across
other apps or websites.

## How we use your information

- To show you people nearby and to show your tag to co-present users.
- To create and secure your account and let you sign back in.
- To send you a password-reset link if you request one.
- To keep the service working and protect it from abuse.

We do **not** sell or rent your personal information, and we do not use it for
advertising.

## Who can see your information

- **Other people using Nametag near you** can see your tag — your name, pronouns,
  one line, stickers, colour, and photo — **while you are visible** and within a
  short distance. They see an approximate sense of closeness, **not** your exact
  coordinates. If you use a **party code**, only people who enter the same code
  can see you.
- **Our service providers** process data on our behalf to run the app (see
  "Service providers" below).
- We may disclose information if required by law, or to protect the rights,
  safety, or security of our users or the service.

## How long we keep it

- **Your tag and location** are kept only while you're visible. They are deleted
  **immediately when you switch to invisible**, and **automatically after about
  24 hours** without opening the app.
- **Your account** (email and password hash) is kept until you delete your
  account.
- **Password-reset links** expire after one hour and can be used once.
- **Names you remember and people you hide** stay on your device until you clear
  them or uninstall the app.

## Deleting your data

You can delete your entire account from within the app (**My tag → Delete
account**). This immediately and permanently removes your account, your tag, and
your photo. Going **invisible** removes your tag and location from our server
without deleting your account.

## Service providers

We use a small number of third parties to run Nametag. They process data only to
provide their service to us:

- **Neon** — database hosting (account and tag data).
- **Render** — application hosting and photo storage.
- **Vercel** — website hosting.
- **Resend** — email delivery, used to send password-reset emails.

Our fonts are self-hosted, so no font provider (such as Google Fonts) receives
your IP address.

## Security

We take reasonable measures to protect your information: traffic is encrypted in
transit (HTTPS), passwords are stored only as salted hashes, and we minimize what
we store and how long we store it. No method of transmission or storage is 100%
secure, and **because this is an early prototype, please don't share anything you
would consider sensitive.** Use a photo and details you're comfortable showing to
strangers in the same room.

## Your choices and rights

- **Visibility:** you decide when you're visible, invisible, or limited to a party
  code — change it any time from the wall, My tag, or Privacy.
- **Location:** you can revoke location permission in your device settings; the
  app can't place you on the wall without it.
- **Access and deletion:** you can view your own tag in the app and delete your
  account at any time. To make any other privacy request, contact
  [PRIVACY CONTACT EMAIL].

Depending on where you live (for example the EU/UK under GDPR, or California under
the CCPA), you may have additional rights to access, correct, delete, or port your
data, and to object to certain processing. Contact us to exercise them.

## Children

Nametag is not intended for anyone under [MINIMUM AGE, e.g. 13 / 16]. We do not
knowingly collect information from children under that age.

## International users

Your information may be processed in the countries where our service providers
operate (including the United States). By using Nametag you understand your data
may be transferred to and processed in those locations.

## Changes to this policy

We may update this policy as the app develops. We'll change the "Last updated"
date above, and for significant changes we'll provide a more prominent notice.

## Contact

Questions or requests: **[PRIVACY CONTACT EMAIL]**.

---

### Placeholders to fill before publishing
- `[EFFECTIVE DATE]`, `[OWNER / LEGAL NAME]`, `[PRIVACY CONTACT EMAIL]`,
  `[MINIMUM AGE]`.

### Must be true (or this text changed) before publishing — see `PRIVACY_REVIEW.md`
- ~~Lock down public photo URLs (**H1**)~~ — done: photo URLs are now unguessable
  random tokens. (This policy doesn't claim photos are access-controlled; an
  auth-gated photo route is optional further hardening.)
- ~~Stop logging reset links (**H2**)~~ — done: prod no longer logs them, and
  reset emails now send in production via Resend.
- ~~Self-host fonts (**M4**)~~ — done; fonts no longer load from Google.

Remaining before real users are mostly your calls: fill the placeholders above,
get a legal read, and set up SMTP.
