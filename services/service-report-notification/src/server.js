const app = require('./app');
const config = require('./config');
const { ensureSchema } = require('./db/schema');

async function start() {
  await ensureSchema();
  app.listen(config.port, () => console.log(`service-report-notification listening on ${config.port}`));
}

start().catch((err) => {
  console.error('Failed to start service-report-notification', err);
  process.exit(1);
});
