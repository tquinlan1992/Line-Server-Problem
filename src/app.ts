import express, { Express } from 'express';
import { ReadFileLines } from './ReadFileLines';
import { Server } from 'http';
export let app: Express | Server = express();
const port = 3000;
const readFile = new ReadFileLines('./src/textFiles/file.txt');
app.get('/', readFile.endpoint.bind(readFile));
readFile.readFileIndexesIntoMemory().then(() => {
  app = (app as Express).listen(port, err => {
    if (err) {
      return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
  });
});
