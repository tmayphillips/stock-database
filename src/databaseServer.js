"use strict";
exports.__esModule = true;
exports.StockDatabaseServer = void 0;
var express = require("express");
var cors = require("cors");
var http = require("http");
var pg_1 = require("pg");
// import { doQuery } from './query.service'
var StockDatabaseServer = /** @class */ (function () {
    function StockDatabaseServer() {
        this.createApp();
        this.listen();
    }
    StockDatabaseServer.prototype.createApp = function () {
        this.app = express();
        this.app.use(cors());
        this.server = http.createServer(this.app);
        this.port = process.env.PORT || StockDatabaseServer.PORT;
        this.connectionString = process.env.DATABASE_URL;
    };
    StockDatabaseServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        try {
            StockDatabaseServer.doQuery('SELECT * FROM min5_prices')
                .then(function (resp) {
                return console.log('this is the db response ', resp);
            });
        }
        catch (e) {
            console.log('failed');
        }
    };
    StockDatabaseServer.prototype.getApp = function () {
        return this.app;
    };
    StockDatabaseServer.PORT = 8080; // Default local port
    StockDatabaseServer.SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'JPM', 'BAC', 'NBR', 'GOOG', 'AXP', 'COF', 'WFC', 'MSFT', 'FB', 'AMZN', 'GS', 'MS', 'V', 'GME', 'NFLX', 'KO', 'JNJ', 'CRM', 'PYPL', 'XOM', 'HD', 'DIS', 'INTC', 'COP', 'CVX', 'RDS.A', 'OXY', 'BP', 'MPC', 'SLB', 'PSX', 'VLO'];
    StockDatabaseServer.doQuery = function (query) {
        return new Promise(function (resolve, reject) {
            var client = new pg_1.Client({
                connectionString: 'postgres://vujwyosxlhitrw:8e2e84a5507c45cf3c54802e97948abd2ebb73ad29453ec3558f64cbe02469e7@ec2-3-228-236-221.compute-1.amazonaws.com:5432/djvd7ebilq70q'
            });
            client.connect(function (connectError) {
                if (connectError)
                    // return reject(connectError.message)
                    console.log('error');
                client.query(query, function (queryError, queryResult) {
                    if (queryError)
                        // return reject(queryError.message+`(${query})`)
                        return reject(queryError.message);
                    client.end(function (endError) {
                        return reject(endError ? endError.message : 'error on client.end');
                    });
                    resolve(queryResult);
                });
            });
        });
    };
    return StockDatabaseServer;
}());
exports.StockDatabaseServer = StockDatabaseServer;
