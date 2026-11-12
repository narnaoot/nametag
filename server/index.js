const app = require('./app');
const migrate = require('./db/migrate');
const { runCleanup } = require('./cleanup');

const PORT = process.env.PORT || 3001;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // every five minutes

migrate().then(() => {
  app.listen(PORT, () => console.log(`Nametag server running on port ${PORT}`));
  // Run once on startup (which also covers waking from sleep on idle-sleeping
  // hosts), then every few minutes
  runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
