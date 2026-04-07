const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors());
// Do not use express.json() globally: it consumes the body stream and breaks POST/PUT
// forwarding through http-proxy-middleware (requests hang). Proxied routes need the raw stream.
app.use(morgan('dev'));

app.use(routes);
app.use(errorHandler);

module.exports = app;

