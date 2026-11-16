# Testing Nametag

Three layers, from fastest to most realistic. All three run automatically on
every pull request and on `main` (`.github/workflows/tests.yml`).

| Layer | Where | What it proves | Needs |
|---|---|---|---|
| **Unit** | `server/__tests__/*.test.js` | Each route's logic and edge cases, with the database mocked | nothing |
| **Integration** | `server/__tests__/integration/` | The API's promises against a **real Postgres** — the SQL actually runs | a test database |
| **Browser** | `e2e/tests/` | Real people using the real app: usually two browsers in the same "room", with the server's database checked after each step | a test database |

The unit tests are quick but can't catch a query Postgres rejects (the database
is faked). The other two exist because that has happened. When you change what
the server stores or deletes, or how the app moves a tag between the device and
the server, add or update an integration or browser test — those are the ones
that describe what Nametag promises.

## Running them

```bash
cd server && npm test
```

The other two need a throwaway Postgres database. **They wipe whatever database
they are pointed at**, and refuse to run unless its name contains `test`.

```bash
createdb nametag_test
```

```bash
export TEST_DATABASE_URL=postgres://localhost:5432/nametag_test
```

```bash
cd server && npm run test:integration
```

```bash
cd e2e && npm install && npx playwright install chromium && npm test
```

The browser tests start their own API (port 3101) and a production build of the
client (port 4273), so nothing else needs to be running. To watch them drive the
browser, use `npm run test:headed`.

## How the browser tests read

Each test is a short story — "Ada goes invisible; Otto can no longer see her;
the server holds nothing about her" — written with the helpers in
`e2e/support/app.js`:

- `device(browser)` — a new person on their own phone (a fresh browser profile).
- `join(page, email, name)` — sign up by email link and onboard to the wall.
- `sees(page, name)` / `doesNotSee(page, name)` — what's on someone's wall.
- `serverCopy(email)` — what the server's database holds for that person.
  `WIPED` is "nothing personal".
- `backdate(email, column, interval)` and `sweep()` — make time pass, then run
  the server's clean-up, instead of waiting 30 minutes or 4 hours.

Emails aren't sent in tests: with no mail provider the server logs the link, and
the tests read it from the log.

## When a browser test fails in CI

The failed run keeps an artifact called `browser-test-report` with screenshots
and the API log.
