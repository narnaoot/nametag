# Redesign — questions & best-guess decisions for Nabil

Implementing `redesign/README.md` (the "nearby name tags" Claude Design canvas)
in the React/Vite/Capacitor client. Where the design didn't map cleanly onto the
existing app or backend, I took a best guess and kept going — each is listed here
so you can confirm or redirect. Nothing here blocks the build; all screens are
implemented and match the canvas.

## Decisions I made (please confirm)

1. **"Continue with Apple" on Sign in (12a).** There's no Apple OAuth backend.
   Both landing buttons open the existing **email/password** flow; the Apple
   button adds a small "Apple sign-in is coming soon — continue with email"
   note. Keep email/password as the working path, or should we wire real Sign
   in with Apple?

2. **You no longer pick your own tag colour.** The rule "coral is you" means your
   tag is always coral, so I removed the colour picker from My tag and
   onboarding and force `tag_color: 'coral'` for yourself. Other people's
   colours are derived **stably from their id** (excluding coral = you and
   orchid = the app; teal→lavender, orchid→citron per the canvas). OK to drop
   user colour choice entirely?

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

10. **Privacy statements are unverified (README open question #1).** The first
    card is the literal placeholder from the design: *"These points need to be
    modified to reflect actual privacy practices."* The other three claim (a)
    nothing is retained after you leave including no record you were there, (b)
    remembered names never leave the device and the other person is never
    notified, (c) photos are cropped client-side before upload. These need
    engineering sign-off before shipping — note the server currently keeps
    photos/location transiently and NULLs them when you go invisible, and
    request logs / analytics may count as "a record". **Please provide the
    final, verified copy for all four cards.**

11. **"Read the whole policy" has no destination.** The row exists but doesn't
    navigate — there's no policy URL/route yet. Where should it go?

12. **Empty / error / permission states (README open question #3).** I built
    minimal versions: nobody nearby ("this spot's free"), location denied (a
    coral note), and invisible (a "you're invisible" state). These aren't
    designed yet — replace with real designs when ready.

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
