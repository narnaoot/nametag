# Nametag — Privacy Policy

> **DRAFT — needs a legal check before real users.**
> It describes how the app behaves **today**; every claim is backed by the code
> audit in `PRIVACY_REVIEW.md`. The same text is shown in the app
> (`client/src/pages/PolicyDocument.jsx`) — keep the two in step. Nametag is an
> **early prototype**.

**Last updated:** November 12, 2026
**Contact:** privacy@n4bil.com

---

## The short version

Nametag shows you the people who are physically near you, as a wall of digital
name tags, so you can go say hello.

- **Your tag lives on your device.** A copy is held on our server only while
  you're on the wall. Go invisible and it's deleted at once; close the app and
  it's deleted straight away where we can, and otherwise within about half an hour.
- **Nobody is told where you are.** Other people see your tag — never your
  location, and never how far away you are.
- **There's no feed, no history, and no messages.** We don't record where you've
  been, who you saw, or who saw you.
- **Party codes run out after four hours.** You then go invisible and your tag is
  deleted from our server.
- **Names you save stay on your phone** and are never sent to us.
- **Your account is just an email and a password**, and you can delete everything
  at any time.
- **We don't sell your data, show ads, or use third-party tracking or analytics.**

The rest of this document is the detail.

---

## Who we are

Nametag ("we," "us") is an independent prototype operated by Nabil Arnaoot.
The app is available at https://nametag.n4bil.com. Questions:
privacy@n4bil.com.

## Why anything is on a server at all

Nametag is built to keep your information on your own device. But for two phones
in the same room to find each other over the internet, something in between has
to know that both are there. So while you are visible — and only then — our
server briefly holds a copy of your tag and a rounded location. Everything below
describes that copy and how quickly it's deleted.

## What we collect

**Information you give us**
- **Account:** your email address and a password (stored only as a secure hash),
  plus a couple of settings: whether you last chose to be invisible, and the
  distance we search around you.
- **Your tag:** your display name, pronouns, a one-line status, up to three
  stickers, a tag colour, and a profile photo — whatever you choose to add. The
  photo is cropped to a small square on your device before it's sent; we never
  receive the original.
- **A party code**, if you enter one, and the time you entered it.

**Information collected as you use the app**
- **Location:** your device's current position, so we can show you people nearby
  and show your tag to them. We round it to about ten metres before storing it,
  and keep only your **single most recent position** — there is no location
  history. While you're invisible we don't store a location at all. You control
  this through your device's location permission and the app's visibility control.
- **Basic technical data:** like any website, our hosting providers automatically
  process standard request information (e.g. IP address, browser type) to serve
  the app and keep it secure.

**Stored only on your device (never sent to us)**
- The names you choose to **remember** and the people you **hide**.
- Your sign-in token, and the lasting copy of your own tag and photo — this is
  what puts your tag back on the wall when you return. (On the web, "your device"
  means this browser's storage.)

We do **not** use analytics or advertising SDKs, and we do not track you across
other apps or websites.

## How we use your information

- To show you people nearby and to show your tag to co-present users.
- To create and secure your account and let you sign back in.
- To email you a link to confirm your address when you sign up, and a
  password-reset link if you ask for one.
- To keep the service working and protect it from abuse.

We do **not** sell or rent your personal information, and we do not use it for
advertising.

## Who can see your information

- **Other people using Nametag near you** can see your tag — your name, pronouns,
  one line, stickers, colour, and photo — **while you are visible** and within a
  short distance (about 100 metres). They are **not** shown your location or your
  distance from them; tags simply appear, roughly nearest first. If you use a
  **party code**, only people who enter the same code can see you, and you see
  only them.
- **Your photo** is shown to those people from a long, random web address. It
  isn't listed anywhere, but anyone who is given that exact address could open
  the photo until it's deleted.
- **Our service providers** process data on our behalf to run the app (see
  "Service providers" below).
- We may disclose information if required by law, or to protect the rights,
  safety, or security of our users or the service.

## How long we keep it

- **Your tag, photo and location** are on our server only while you're on the
  wall. They're deleted **immediately** when you switch to invisible. When you
  close the app we delete them straight away where the app is able to tell us
  (closing the page in a browser); otherwise they're deleted automatically once
  the app hasn't checked in for **30 minutes** — and other people stop seeing you
  at that same point.
- **Party codes** last **4 hours** from when you enter them. After that you go
  invisible and your tag is deleted from our server.
- **Your account** (email, password hash and visibility setting) is kept until
  you delete your account. If you sign up but never confirm your email, the
  sign-up is deleted after 2 days.
- **Email links:** confirmation links last 24 hours and password-reset links one
  hour; each works once. Our record of a link is deleted once it's used or expired.
- **Names you remember, people you hide, and your own tag** stay on your device
  until you delete your account, sign in as someone else on that device, or clear
  the app's storage.

Two honest caveats. The automatic clean-up runs every few minutes while our
server is awake; if nobody at all has used Nametag for a while the server sleeps,
and the clean-up finishes as soon as it next wakes — nobody can see your tag in
the meantime. And once we delete something, traces may remain for a limited time
in our providers' routine backups and logs, which we don't control directly.

## Deleting your data

You can delete your entire account from within the app (**My tag → Delete
account**). This immediately and permanently removes your account, your tag, and
your photo from our server, and clears the copy on that device. Going
**invisible** removes your tag, photo, location and party code from our server
without deleting your account.

## Service providers

We use a small number of third parties to run Nametag. They process data only to
provide their service to us:

- **Neon** — database hosting (your account, and your tag and location while
  you're visible).
- **Render** — application hosting and photo storage (your photo while you're
  visible).
- **Vercel** — website hosting; requests to the app pass through it.
- **Resend** — email delivery, used to send account-confirmation and
  password-reset emails. It receives your email address and the message.

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
  code — change it any time from the wall or My tag. Invisible stays on until you
  turn it off.
- **Location:** you can revoke location permission in your device settings; the
  app can't place you on the wall without it.
- **Access and deletion:** you can view your own tag in the app and delete your
  account at any time. To make any other privacy request, contact
  privacy@n4bil.com.

Depending on where you live (for example the EU/UK under GDPR, or California under
the CCPA), you may have additional rights to access, correct, delete, or port your
data, and to object to certain processing. Contact us to exercise them.

## Children

Nametag is not intended for anyone under 16. We do not
knowingly collect information from children under that age.

## International users

Your information may be processed in the countries where our service providers
operate (including the United States). By using Nametag you understand your data
may be transferred to and processed in those locations.

## Changes to this policy

We may update this policy as the app develops. We'll change the "Last updated"
date above, and for significant changes we'll provide a more prominent notice.

## Contact

Questions or requests: **privacy@n4bil.com**.

---

### Before real users (owner checklist)

- **Set up `privacy@n4bil.com`** so it actually receives mail (a forwarding alias
  at your DNS/email provider). Until then, swap the contact to a working address.
- **Get a legal read.**
- **Check the provider settings this policy leans on** — database backup/history
  retention (Neon), email log retention (Resend), request-log retention (Render,
  Vercel). The policy only promises "a limited time"; shorter is better. See
  `PRIVACY_REVIEW.md` §5.
- **Decide whether to keep the server awake** so the 30-minute clean-up is a hard
  guarantee rather than "as soon as the server next wakes". See
  `PRIVACY_REVIEW.md` → R1.
