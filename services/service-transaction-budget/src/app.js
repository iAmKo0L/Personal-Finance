const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(routes);
app.use(errorHandler);
module.exports = app;

