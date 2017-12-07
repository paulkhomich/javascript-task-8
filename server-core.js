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
    // Тут нужно обработать запрос
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/messages') && req.method === 'GET') {
        res.write(JSON.stringify(createLocalDB(from, to)));
        res.end();
    } else if (req.url.startsWith('/messages') && req.method === 'POST') {
        let fetchedData = '';
        req.on('data', chunk => {
            fetchedData += chunk;
        });
        req.on('end', () => {
            if (from) {
                body.from = from;
            }
            if (to) {
                body.to = to;
            }
            body.text = fetchedData;
            DB.push(body);
            res.write(JSON.stringify(body));
            res.end();
        });
    } else {
        res.statusCode = 404;
        res.end();
    }
});

module.exports = server;

function createLocalDB(from, to) {
    let localDB = DB;
    localDB = from ? localDB.filter(e => e.from === from) : localDB;
    localDB = to ? localDB.filter(e => e.to === to) : localDB;

    return localDB;
}
