import { Request, Response } from "express";
import fs from 'fs';
import { flatten } from 'lodash';

let lineIndexes: number[] = [];

function getByteIndexOfLineBreaks({ start, line }: { start: number; line: string }) {
    let pos = 0;
    const indexes = [];
    let i = -1;

    // Search the string and counts the number of e's
    while (pos != -1) {
        pos = line.indexOf("\n", i + 1);
        if (pos !== -1) {
            indexes.push(start + pos + 1);
        }
        i = pos;
    }
    return indexes;
}

function readBuffer({ bufferSize, byteIndex = 0, fd }: { bufferSize: number, byteIndex: number, fd: number }): Promise<number[]> {
    return new Promise(resolve => {
        const buffer = Buffer.alloc(bufferSize);
        fs.read(fd, buffer, 0, bufferSize, byteIndex, function (err, num) {
            const bufferString = buffer.toString('utf8', 0, num);
            const indexes = getByteIndexOfLineBreaks({ start: byteIndex, line: bufferString })
            resolve(indexes)
        });
    });
}

function getByteIndexOfLineBreaksInFile(): Promise<number[]> {

    return new Promise(resolve => {
        const file = './src/textFiles/file.txt';
        fs.stat(file, (err, stats) => {
            const fileSize = stats.size;
            fs.open(file, 'r', function (status, fd) {
                let times = 0;
                const bufferSize = 100;
                const indexes = [];
                const readBufferPromises = [];
                while (times * bufferSize < fileSize) {
                    readBufferPromises.push(readBuffer({ bufferSize, byteIndex: times * bufferSize, fd }));
                    times = times + 1;
                }
                Promise.all(readBufferPromises).then(values => {
                    resolve(flatten(values))
                });
            });
        });
    });
}

export function readFileIndexes() {
    return new Promise(resolve => {
        getByteIndexOfLineBreaksInFile().then(indexes => {
            lineIndexes = indexes;
            resolve();
        }).catch(e => {
            console.log('e', e);
        });
    })
}

function getLineUsingIndexes({ lineIndexes, lineNumber }: { lineIndexes: number[]; lineNumber: number }): Promise<string> {
    return new Promise(resolve => {
        const file = './src/textFiles/file.txt';
        const startingByte = lineIndexes[lineNumber - 1];
        const size = lineIndexes[lineNumber] - startingByte;
        const buffer = Buffer.alloc(size);
        fs.open(file, 'r', (status, fd) => {
            fs.read(fd, buffer, 0, size, startingByte, function (err, num) {
                const bufferString = buffer.toString('utf8', 0, num);
                resolve(bufferString);
            });
        });
    });
}


export function readFile(req: Request, res: Response) {
    const lineNumber = req.query.lineNumber;
    getLineUsingIndexes({ lineIndexes, lineNumber }).then(line => {
        res.send(line);
    });
}