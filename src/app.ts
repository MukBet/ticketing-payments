// This file just configures the express app and exports it for use in other files
import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@motway_ticketing/common';
import { createChargeRouter } from './routes/new';

const app = express();
app.set('trust proxy', true); // trust first proxy
app.use(bodyParser.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',//true, // for dev only; set to true in prod with HTTPS
  })
);
app.use(currentUser);
app.use(createChargeRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };