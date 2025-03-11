import configureRoutes from '../routers';
import configureSockets from '../sockets/socket-index';

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const port = process.env.PORT ?? 3000;

configureRoutes(app);

configureSockets(app.listen(port, (error: Error) => {
  if (!error) {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  } else {
    console.log('An Error occured, server cannot start', error);
  }
}));
