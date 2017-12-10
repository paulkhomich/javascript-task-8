'use strict';

const http = require('http');
const chalk = require('chalk');
var ArgumentParser = require('argparse').ArgumentParser; // Для чтения --аргументов
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
        // Внутри этой функции нужно полуучить и обработать аргументы командной строки
        const args = process.argv;
        const command = args[2];
        let argsParams = args.slice(3);
        var argsFull = parser.parseArgs(argsParams);
        let from = argsFull.from;
        let to = argsFull.to;
        let text = argsFull.text;
        // После того как имею аргументы для работы
        let body = [];
        if (command === 'list') {
            body = getList(from, to);
        } else if (command === 'send') {
            body = sendMessage(from, to, text);
        } else {
            reject('command not found');
        }

        resolve(body);
    });
}

function getList(from, to) {
    return new Promise((resolve, reject) => {
        let path = '/messages'; // Формирую url, Русский язык энкод(!)
        path += from || to ? '?' : '';
        path += from ? 'from=' + encodeURIComponent(from) : '';
        path += (from && to) ? '&' : '';
        path += to ? 'to=' + encodeURIComponent(to) : '';
        // создаю интерфейс запроса
        const req = http.request({
            hostname: 'localhost',
            method: 'GET',
            path: path,
            port: 8080,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        // Принимаю данные
        req.on('response', response => {
            let body = '';

            response.on('data', chunk => {
                body += chunk;
            });

            response.on('error', () => {
                reject('error');
            });
            // После приема - привожу в "цветную" форму
            response.on('end', () => {
                resolve(prettyMessage(body));
            });
        });

        req.end();
    });
}

function sendMessage(from, to, text) {
    return new Promise((resolve, reject) => {
        let path = '/messages';
        path += from || to ? '?' : '';
        path += from ? 'from=' + encodeURIComponent(from) : '';
        path += (from && to) ? '&' : '';
        path += to ? 'to=' + encodeURIComponent(to) : '';
        const req = http.request({
            hostname: 'localhost',
            method: 'POST',
            path: path,
            port: 8080
        });

        let jsonText = {
            'text': text
        };
        // Отправляю вместе с запросом - текст сообщения
        req.write(JSON.stringify(jsonText));

        req.on('response', response => {
            let body = '';

            response.on('data', chunk => {
                body += chunk;
            });

            response.on('error', () => {
                reject('error');
            });
            // Принимаю ответ
            response.on('end', () => {
                resolve(prettyMessage(body));
            });
        });

        req.end();
    });
}

function prettyMessage(body) {
    body = JSON.parse(body);
    body = body[0] ? body : [body]; // Если сообщение одно - оборачиваю(для универсальности)
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
        ans += `${chalk.hex('#0F0')('TEXT')}: ${text}`;

        return ans;
    });
    body = body.join('\n\n'); // Сращиваю сообщения между собой

    return body;
}
