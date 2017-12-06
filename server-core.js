'use strict';

const http = require('http');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');

const server = http.createServer();

let DB = [];

server.on('request', (req, res) => {
    const { query } = parseUrl(req.url);
    const { from, to } = parseQuery(query);
    const body = {};
    body.text = decodeURIComponent(req.headers.text);
    // Тут нужно обработать запрос
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/messages') && req.method === 'GET') {
        res.write(JSON.stringify(createLocalDB(from, to)));
    } else if (req.url.startsWith('/messages') && req.method === 'POST') {
        if (from) {
            body.from = from;
        }
        if (to) {
            body.to = to;
        }
        DB.push(body);
        res.write(JSON.stringify([body]));
    } else {
        res.statusCode = 404;
    }
    res.end();
});

module.exports = server;

function createLocalDB(from, to) {
    let localDB = DB;
    localDB = from ? localDB.filter(e => e.from === from) : localDB;
    localDB = to ? localDB.filter(e => e.to === to) : localDB;

    return localDB;
}
