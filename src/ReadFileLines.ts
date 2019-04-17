import { Request, Response } from "express";
import fs from 'fs';
import { flatten } from 'lodash';

export class ReadFileLines {

    private filePath: string;
    private lineIndexes: number[];

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    public readFileIndexesIntoMemory() {
        return new Promise(resolve => {
            this.getByteIndexOfLineBreaksInFile().then(indexes => {
                this.lineIndexes = indexes;
                resolve();
            }).catch(e => {
                console.log('e', e);
            });
        })
    }

    // Iterate reading from file to retieve all line break indexes
    private getByteIndexOfLineBreaksInFile(): Promise<number[]> {
        return new Promise(resolve => {
            fs.stat(this.filePath, (err, stats) => {
                const fileSize = stats.size;
                fs.open(this.filePath, 'r', (status, fd) => {
                    let times = 0;
                    const bufferSize = 100;
                    const readBufferPromises = [];
                    let totalBufferSizeRead = times * bufferSize;
                    while (totalBufferSizeRead < fileSize) {
                        readBufferPromises.push(this.getByteIndexesFromBuffer({ bufferSize, byteIndex: times * bufferSize, fd }));
                        times = times + 1;
                        totalBufferSizeRead = times * bufferSize;
                    }
                    const lastCalculatedBufferSize = (totalBufferSizeRead - bufferSize);
                    const remainingBufferSize = fileSize - lastCalculatedBufferSize;
                    if (remainingBufferSize !== 0) {
                        readBufferPromises.push(this.getByteIndexesFromBuffer({ bufferSize: remainingBufferSize, byteIndex: lastCalculatedBufferSize, fd }));
                    }
                    Promise.all(readBufferPromises).then(values => {
                        resolve(flatten(values))
                    });
                });
            });
        });
    }

    // Read a portion of the file and pass data to getByteIndexOfLineBreaksFromBufferString to retrieve indexes
    private getByteIndexesFromBuffer({ bufferSize, byteIndex = 0, fd }: { bufferSize: number, byteIndex: number, fd: number }): Promise<number[]> {
        return new Promise(resolve => {
            const buffer = Buffer.alloc(bufferSize);
            fs.read(fd, buffer, 0, bufferSize, byteIndex, (err, num) => {
                const bufferString = buffer.toString('utf8', 0, num);
                const indexes = this.getByteIndexOfLineBreaksFromBufferString({ start: byteIndex, line: bufferString })
                resolve(indexes)
            });
        });
    }

    // Find all line breaks (\n) and return the indexes
   private getByteIndexOfLineBreaksFromBufferString({ start, line }: { start: number; line: string }) {
        let pos = 0;
        const indexes = [];
        let i = -1;

        while (pos != -1) {
            pos = line.indexOf("\n", i + 1);
            if (pos !== -1) {
                indexes.push(start + pos + 1);
            }
            i = pos;
        }
        return indexes;
    }

    // Using already generate lineIndexes, that contains the bytes for line breaks, retrieve the line from the file
    private getLineUsingIndexes({ lineNumber }: { lineNumber: number; }): Promise<string> {
        return new Promise(resolve => {
            const startingByte = this.lineIndexes[lineNumber - 1];
            const size = this.lineIndexes[lineNumber] - startingByte;
            const buffer = Buffer.alloc(size);
            fs.open(this.filePath, 'r', (status, fd) => {
                fs.read(fd, buffer, 0, size, startingByte, function (err, num) {
                    const bufferString = buffer.toString('utf8', 0, num);
                    resolve(bufferString);
                });
            });
        });
    }

    // express endpoint to be used after generating the line break indexes
    public endpoint(req: Request, res: Response) {
        const lineNumber = req.query.lineNumber;
        if (!this.lineIndexes[lineNumber]) {
            res.send('line number doesnt exist');
            return;
        }
        this.getLineUsingIndexes({ lineNumber }).then(line => {
            res.send(line);
        });
    }
}