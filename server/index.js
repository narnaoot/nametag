const app = require('./app');
const migrate = require('./db/migrate');

const PORT = process.env.PORT || 3001;

migrate().then(() => {
  app.listen(PORT, () => console.log(`Nametag server running on port ${PORT}`));
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
