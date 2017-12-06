/* eslint-disable no-console */
'use strict';

const { execute } = require('./client-core');
const chalk = require('chalk');

module.exports.isStar = false;

execute()
    .then(prettyMessage)
    .catch(console.error);

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
