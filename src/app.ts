import express from 'express';
import { readFile, readFileIndexes } from './readFile';
const app = express();
const port = 3000;
app.get('/', readFile);
readFileIndexes().then(() => {
  app.listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
  });
});
