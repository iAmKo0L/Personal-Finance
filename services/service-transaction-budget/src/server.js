const app = require('./app');
const config = require('./config');
const { ensureSchema } = require('./db/schema');
const categoryRepository = require('./repositories/category-repository');

async function start() {
  await ensureSchema();
  await categoryRepository.seedDefaults();
  app.listen(config.port, () => console.log(`service-transaction-budget listening on ${config.port}`));
}

start().catch((err) => {
  console.error('Failed to start service-transaction-budget', err);
  process.exit(1);
});
