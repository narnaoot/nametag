const app = require('./app');
const db = require('./db');
const migrate = require('./db/migrate');
const { runCleanup, SHUTDOWN_STALE_MINUTES } = require('./cleanup');

const PORT = process.env.PORT || 3001;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every five minutes
const SHUTDOWN_DEADLINE_MS = 20 * 1000;    // hosts force-kill ~30s after asking us to stop

let server;
let sweepTimer;

migrate().then(() => {
  server = app.listen(PORT, () => console.log(`Nametag server running on port ${PORT}`));
  // Sweep on startup (which is also "waking from sleep" on a host that stops
  // idle services), then every few minutes while running.
  runCleanup();
  sweepTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

// The sweep only runs while this process is alive, and an idle-sleeping host
// (Render's free plan) stops the process after ~15 quiet minutes — before the
// 30-minute rule would fire. So when we're asked to stop, clear out every tag
// that isn't being actively refreshed on the way down: nothing should sit in
// the database while the server is asleep. People still using the app (it
// refreshes every minute) are untouched, so a restart or deploy doesn't blank
// the room. The log lines below are how to confirm in the host's logs that this
// really happens.
let stopping = false;
async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`[shutdown] ${signal} received — clearing tags that aren't in use before stopping`);
  setTimeout(() => {
    console.error('[shutdown] ran out of time; exiting with the sweep unfinished');
    process.exit(1);
  }, SHUTDOWN_DEADLINE_MS).unref();

  clearInterval(sweepTimer);
  if (server) server.close();              // stop taking new requests
  await runCleanup({ staleMinutes: SHUTDOWN_STALE_MINUTES });
  await db.end().catch(() => {});
  console.log('[shutdown] sweep finished');
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
