# Redesign — questions & best-guess decisions for Nabil

Implementing the "nearby name tags" Claude Design canvas (design source
formerly in `redesign/`, since removed — in git history)
in the React/Vite/Capacitor client. Where the design didn't map cleanly onto the
existing app or backend, I took a best guess and kept going — each is listed here
so you can confirm or redirect. Nothing here blocks the build; all screens are
implemented and match the canvas.

## ✅ Resolved in the follow-up pass (Aug 2026)

- **#10 Privacy copy — rewritten to match reality.** The four cards now describe
  what the code actually does (see the audit in "Actual privacy practices"
  below). The placeholder is gone.
- **#1 Sign in with Apple — dropped.** Too much setup for a web prototype (Apple
  Developer account + Services ID + verified domain + signed client secret). The
  Sign-in screen now has a single **Continue with email** button. Add Apple back
  when there's a native app + developer account.
- **#2 Tag colour — you pick it now.** Coral is the default, orchid is excluded
  (it's the app's), and your own tag on the wall is marked with the orchid "you"
  ring instead of by being coral.

## Actual privacy practices (audited from the server code)

Your stated goal was **on-device-only** storage. That is **not** the case today,
and it can't fully be for a "who's near me" app — the server has to know people's
locations to match co-present users. Here's the real split:

- **On our server, persistently:** your **email** + a bcrypt **password hash**
  (until you delete the account) + short-lived password-reset tokens.
- **On our server, only while you're visible:** name, pronouns, one line,
  stickers, colour, **photo file**, and your **single latest lat/lng** (+ a
  timestamp; no history). Deleted the instant you go invisible, and auto-deleted
  after 24 h without a refresh (`server/cleanup.js`). Account deletion hard-wipes
  the row + photo file.
- **On your device only (never sent to us):** your login token, a local copy of
  your photo + profile (to restore your tag after cleanup), **remembered names**,
  and **hidden people**.

Hardening:

1. ~~**Photos aren't cropped client-side.**~~ → **Done (Aug 2026).** Picked
   photos are now cropped to a centered square and downscaled to a 320px JPEG
   **on-device before upload** (`client/src/lib/imageCrop.js`), so the tag's small
   circle is all that's ever sent (a 1200×800 pick → ~2 KB). The Privacy copy now
   truthfully says the photo is cropped on your phone before it's sent.
2. ~~**Photo files are served at public, guessable `/uploads/user_<id>_<ts>` URLs.**~~
   → **Hardened (H1, Aug 2026).** Filenames are now unguessable 128-bit random
   tokens, so URLs can't be enumerated. They're still public *bearer* URLs while
   the file exists; signed/expiring or auth-gated serving is optional further
   hardening for launch. See `PRIVACY_REVIEW.md` → H1.

## Decisions I made (please confirm)

1. ~~**"Continue with Apple"**~~ → **Resolved: dropped** (see above). Single
   "Continue with email" button.

2. ~~**You no longer pick your own tag colour.**~~ → **Resolved: you do** (see
   above). Coral default, orchid excluded, orchid ring marks "you" on the wall.
   `tag_color` stores your chosen key again.

3. **The wall is a two-column staggered layout, not the fixed 6-tag composition.**
   The mock hand-places exactly six tags; live data has any number. I recreate
   the hand-laid feel (unequal tilts, shadows, widths, photo sizes; the right
   column dropped ~24px so nothing lines up) in a robust two-column wall. "You"
   (coral) always leads. Acceptable, or do you want a different dynamic layout?

4. **Radius control removed from the UI.** My tag (12f) shows only Name / One
   line / Stickers. The old 50 m–1 km radius selector is gone from the UI; the
   value is kept server-side at the stored/default 100 m so the nearby query
   still works. Re-add a radius control somewhere, or leave it out?

5. **Pronoun editing lives inside the "Name" row.** 12f has no pronouns row, but
   pronouns still need to be editable after onboarding. I put the pronoun chips
   in the Name row's inline editor. Prefer a dedicated Pronouns row instead?

6. **No venue name.** The mock says "Ritual Coffee"; we have no place detection,
   so the header reads "N tags nearby" and copy uses "nearby". Want venue
   detection (needs a places API + backend), or keep it generic?

7. **Mutual-context row (12e).** "Theo is here too — you were both at the same
   open mic last week." No backend produces this, so the row only renders when
   context data is supplied (never, in production, right now). Is a
   mutual-context feature planned, or should I drop the row?

8. **Party code has no "create/host" flow.** 13a assumes a host tells you a code
   out loud. Party code just filters the existing nearby query. Hosting is
   undesigned (README open question #2) — confirm out of scope for now.

9. **Ink/dark theme dropped.** The old app carried an unused dark "ink" theme.
   The new spec has no dark theme, so I removed it. Confirm.

## Needs your input / sign-off (from the README's own open questions)

10. ~~**Privacy statements are unverified.**~~ → **Resolved:** rewritten to match
    the actual code (see "Actual privacy practices" above). Still worth a human
    read to confirm the wording is one you're comfortable committing to publicly,
    and to decide on the two hardening items (client-side crop, public photo
    URLs).

11. ~~**"Read the whole policy" has no destination.**~~ → **Resolved (Aug 2026).**
    The row now opens a full in-app policy screen (`client/src/pages/PolicyDocument.jsx`),
    styled to the design system, mirroring `PRIVACY_POLICY.md`. A separate public
    web URL (for App Store submission / external sharing) is still a nice-to-have.

12. **Empty / error / permission states (README open question #3).** Built out
    proper versions (Aug 2026): a **location-permission** state (📍 + "Turn on
    location" + Try again) that distinguishes denied vs unavailable; **nobody
    nearby** and a distinct **party-code-with-no-matches** empty state; a
    **loading skeleton**; the "you're the first one here" note under your solo
    tag; and the **invisible** state. Copy is my best guess — tweak wording when
    you want, but the flows now hold together.

13. **Tablet & desktop (12g/12h) — built, with one adaptation.** The board is
    responsive (2/3/4 columns), tablet widens the board with the visibility
    control in the header, and desktop gets a left nav rail + centre board + a
    right "Selected" panel so opening a tag never covers the room. The one
    deviation from the canvas: it puts "where you are" / your own tag / the
    stacked visibility control in the desktop **left** rail; I kept the left rail
    as pure navigation (it's shared across tabs) and put visibility + your avatar
    in the Nearby centre header instead. Happy to move them into the rail if you
    prefer the exact canvas layout — a `stacked` VisibilityControl variant is
    already there for it.
