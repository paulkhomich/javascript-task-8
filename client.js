/* eslint-disable no-console */
'use strict';

const { execute } = require('./client-core');
const chalk = require('chalk');

module.exports.isStar = false;

execute()
    .then(console.log)
    .catch(console.error);
