import { Request, Response } from "express";

const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;
const path = require('path');

app.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  res.send(`Welcome ${name}`);
});

app.get('/hello', (req: Request, res: Response) => {
  res.status(200).send('Welcome to root URL');
});

app.use('/static', express.static(path.join(__dirname, '../static-files')));

app.listen(port, (error: Error) => {
  if (!error) {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  } else {
    console.log('An Error occured, server cannot start', error);
  }
});