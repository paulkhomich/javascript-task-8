'use strict';

const http = require('http');

module.exports.execute = execute;
module.exports.isStar = false;

function execute() {
    return new Promise(async (resolve, reject) => {
        // Внутри этой функции нужно получить и обработать аргументы командной строки
        const args = process.argv;
        const command = args[2];
        let argsParams = args.slice(3).join(' ');
        let from = argsParams.match(/--from(=|\s)\S+/i);
        let to = argsParams.match(/--to(=|\s)\S+/i);
        let text = argsParams.match(/--text(=|\s)\S+/i);
        from = from ? from[0].replace('--from', '').slice(1) : null;
        to = to ? to[0].replace('--to', '').slice(1) : null;
        text = text ? text[0].replace('--text', '').slice(1) : null;

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
    return new Promise((resolve) => {
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
                resolve(body);
            });
        });

        req.end();
    });
}

function sendMessage(from, to, text) {
    return new Promise((resolve) => {
        let path = '/messages?';
        path += from ? 'from=' + from + '&' : '';
        path += to ? 'to=' + to : '';

        const req = http.request({
            hostname: 'localhost',
            method: 'POST',
            path: path,
            headers: { 'text': text },
            port: 8080
        });

        req.on('response', response => {
            let body = '';

            response.on('data', chunk => {
                body += chunk;
            });

            response.on('end', () => {
                resolve(body);
            });
        });

        req.end();
    });
}
