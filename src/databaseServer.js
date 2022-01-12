"use strict";
exports.__esModule = true;
exports.StockDatabaseServer = void 0;
var express = require("express");
var cors = require("cors");
var http = require("http");
var pg_1 = require("pg");
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
        StockDatabaseServer.SYMBOLS.forEach(function (symbol) {
            StockDatabaseServer.TIMEFRAMES.forEach(function (timeframe) {
                console.log("\"SELECT * FROM ".concat(timeframe, "_prices WHERE Symbol = '").concat(symbol.toUpperCase(), "' \""));
                try {
                    StockDatabaseServer.doQuery("\"SELECT * FROM ".concat(timeframe, "_prices WHERE Symbol = '").concat(symbol.toUpperCase(), "' \""))
                        .then(function (resp) {
                        var getStockData = function (request, response, next) {
                            console.log(resp.rows);
                            response.status(200).json(resp.rows);
                        };
                        _this.app.get("/".concat(symbol, "/5/minute"), getStockData);
                        switch (timeframe) {
                            case 'min5':
                                console.log("/".concat(symbol, "/5/minute"));
                                _this.app.get("/".concat(symbol, "/5/minute"), getStockData);
                                break;
                            case 'min15':
                                _this.app.get("/".concat(symbol, "/15/minute"), getStockData);
                                break;
                            case 'hour':
                                _this.app.get("/".concat(symbol, "/1/hour"), getStockData);
                                break;
                            case 'daily':
                                _this.app.get("/".concat(symbol, "/1/day"), getStockData);
                                break;
                        }
                    });
                }
                catch (e) {
                    console.log('failed');
                }
            });
        });
    };
    StockDatabaseServer.prototype.getApp = function () {
        return this.app;
    };
    StockDatabaseServer.PORT = 8080; // Default local port
    StockDatabaseServer.SYMBOLS = ['AAPL'];
    StockDatabaseServer.TIMEFRAMES = ['min5', 'min15', 'hour', 'daily'];
    StockDatabaseServer.doQuery = function (query) {
        return new Promise(function (resolve, reject) {
            var client = new pg_1.Client({
                connectionString: 'postgres://vujwyosxlhitrw:8e2e84a5507c45cf3c54802e97948abd2ebb73ad29453ec3558f64cbe02469e7@ec2-3-228-236-221.compute-1.amazonaws.com:5432/djvd7ebilq70q',
                ssl: {
                    rejectUnauthorized: false
                }
            });
            client.connect(function (connectError) {
                if (connectError)
                    // return reject(connectError.message)
                    console.log('error');
                client.query(query, function (queryError, queryResult) {
                    if (queryError)
                        // return reject(queryError.message+`(${query})`)
                        return reject(queryError.message);
                    // client.end((endError: Error)=>{
                    //     return reject(endError? endError.message : 'error on client.end')
                    // })
                    resolve(queryResult);
                });
            });
            client.end();
        });
    };
    return StockDatabaseServer;
}());
exports.StockDatabaseServer = StockDatabaseServer;
