const app = require('./app');
const config = require('./config');
const { ensureSchema } = require('./db/schema');

async function start() {
  await ensureSchema();
  app.listen(config.port, () => console.log(`service-auth-user listening on ${config.port}`));
}

start().catch((err) => {
  console.error('Failed to start service-auth-user', err);
  process.exit(1);
});
