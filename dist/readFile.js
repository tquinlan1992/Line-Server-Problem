"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
let lineIndexes = [];
function getByteIndexOfLineBreaks({ start, line }) {
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
function readBuffer({ bufferSize, byteIndex = 0, fd }) {
    return new Promise(resolve => {
        const buffer = Buffer.alloc(bufferSize);
        fs_1.default.read(fd, buffer, 0, bufferSize, byteIndex, function (err, num) {
            const bufferString = buffer.toString('utf8', 0, num);
            const indexes = getByteIndexOfLineBreaks({ start: byteIndex, line: bufferString });
            resolve(indexes);
        });
    });
}
function getByteIndexOfLineBreaksInFile() {
    return new Promise(resolve => {
        const file = './src/textFiles/file.txt';
        fs_1.default.stat(file, (err, stats) => {
            const fileSize = stats.size;
            fs_1.default.open(file, 'r', function (status, fd) {
                let times = 0;
                const bufferSize = 100;
                const indexes = [];
                const readBufferPromises = [];
                while (times * bufferSize < fileSize) {
                    readBufferPromises.push(readBuffer({ bufferSize, byteIndex: times * bufferSize, fd }));
                    times = times + 1;
                }
                Promise.all(readBufferPromises).then(values => {
                    resolve(lodash_1.flatten(values));
                });
            });
        });
    });
}
function readFileIndexes() {
    return new Promise(resolve => {
        getByteIndexOfLineBreaksInFile().then(indexes => {
            lineIndexes = indexes;
            resolve();
        }).catch(e => {
            console.log('e', e);
        });
    });
}
exports.readFileIndexes = readFileIndexes;
function getLineUsingIndexes({ lineIndexes, lineNumber }) {
    return new Promise(resolve => {
        const file = './src/textFiles/file.txt';
        const startingByte = lineIndexes[lineNumber - 1];
        const size = lineIndexes[lineNumber] - startingByte;
        const buffer = Buffer.alloc(size);
        fs_1.default.open(file, 'r', (status, fd) => {
            fs_1.default.read(fd, buffer, 0, size, startingByte, function (err, num) {
                const bufferString = buffer.toString('utf8', 0, num);
                resolve(bufferString);
            });
        });
    });
}
function readFile(req, res) {
    const lineNumber = req.query.lineNumber;
    getLineUsingIndexes({ lineIndexes, lineNumber }).then(line => {
        res.send(line);
    });
}
exports.readFile = readFile;
//# sourceMappingURL=readFile.js.map