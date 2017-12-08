'use strict';

const http = require('http');
const chalk = require('chalk');
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({});
parser.addArgument(
    ['--from']
);
parser.addArgument(
    ['--to']
);
parser.addArgument(
    ['--text']
);

module.exports.execute = execute;
module.exports.isStar = false;

function execute() {
    return new Promise((resolve, reject) => {
        // Внутри этой функции нужно получить и обработать аргументы командной строки
        const args = process.argv;
        const command = args[2];
        let argsParams = args.slice(3);
        var argsFull = parser.parseArgs(argsParams);
        let from = argsFull.from;
        let to = argsFull.to;
        let text = argsFull.text;

        let body = [];
        if (command === 'list') {
            body = await getList(from, to);
        } else if (command === 'send') {
            body = await sendMessage(from, to, text);
        } else {
            reject('command not found');
        }

        resolve(body);
    });
}

function getList(from, to) {
    return new Promise((resolve, reject) => {
        let path = '/messages?';
        path += from ? 'from=' + from + '&' : '';
        path += to ? 'to=' + to : '';

        const req = http.request({
            hostname: 'localhost',
            method: 'GET',
            path: path,
            port: 8080
        });

        req.on('response', response => {
            let body = '';

            response.on('data', chunk => {
                body += chunk;
            });

            response.on('end', () => {
                resolve(prettyMessage(body));
            });
        });

        req.end();
    });
}

function sendMessage(from, to, text) {
    return new Promise((resolve, reject) => {
        let path = '/messages?';
        path += from ? 'from=' + from + '&' : '';
        path += to ? 'to=' + to : '';

        const req = http.request({
            hostname: 'localhost',
            method: 'POST',
            path: path,
            port: 8080,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let jsonText = {
            'text': text
        };

        req.write(JSON.stringify(jsonText));

        req.on('response', response => {
            let body = '';

            response.on('data', chunk => {
                body += chunk;
            });

            response.on('end', () => {
                resolve(prettyMessage(body));
            });
        });

        req.end();
    });
}

function prettyMessage(body) {
    body = JSON.parse(body);
    body = body[0] ? body : [body];
    body = body.map(mes => {
        let ans = '';
        let from = mes.from;
        let to = mes.to;
        let text = mes.text;
        if (from) {
            ans += `${chalk.hex('#F00')('FROM')}: ${from}\n`;
        }
        if (to) {
            ans += `${chalk.hex('#F00')('TO')}: ${to}\n`;
        }
        if (text) {
            ans += `${chalk.hex('#0F0')('TEXT')}: ${text}`;
        }

        return ans;
    });
    body = body.join('\n\n');

    return body;
}
