'use strict';

const http = require('http');
const chalk = require('chalk');

module.exports.execute = execute;
module.exports.isStar = false;

function execute() {
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

    if (command === 'list') {
        getList(from, to);
    } else if (command === 'send') {
        sendMessage(from, to, text);
    } else {
        console.info('command not found');
    }

    return Promise.resolve('Это строка будет выведена на консоль');
}

function getList(from, to) {
    let path = '/messages?';
    path += from ? 'from=' + encodeURIComponent(from) + '&' : '';
    path += to ? 'to=' + encodeURIComponent(to) : '';

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
            prettyMessage(body);
        });
    });

    req.end();
}

function sendMessage(from, to, text) {
    let path = '/messages?';
    path += from ? 'from=' + encodeURIComponent(from) + '&' : '';
    path += to ? 'to=' + encodeURIComponent(to) : '';
    text = encodeURIComponent(text);

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
            prettyMessage(body);
        });
    });

    req.end();
}

function prettyMessage(body) {
    body = JSON.parse(body);
    body.forEach(mes => {
        let from = mes.from;
        let to = mes.to;
        let text = mes.text;
        if (from) {
            console.info(chalk.hex('#F00')('FROM') + ': ' + from);
        }
        if (to) {
            console.info(chalk.hex('#F00')('TO') + ': ' + to);
        }
        if (text) {
            console.info(chalk.hex('#0F0')('TEXT') + ': ' + text);
        }
        if (body.indexOf(mes) + 1 !== body.length) {
            console.info('');
        }
    });
}
