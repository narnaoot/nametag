const app = require('./app');
const migrate = require('./db/migrate');
const { runCleanup } = require('./cleanup');

const PORT = process.env.PORT || 3001;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // every hour

migrate().then(() => {
  app.listen(PORT, () => console.log(`Nametag server running on port ${PORT}`));
  // Run once on startup, then every hour
  runCleanup();
  setInterval(runCleanup, CLEANUP_INTERVAL_MS);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
