'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
    function Server() {
        var _this = this;

        _classCallCheck(this, Server);

        this.app = (0, _express2.default)();
        this.server = _http2.default.Server(this.app);
        this.io = new _socket2.default(this.server);
        this.port = process.env.WEBSOCKET_PORT || 3000;
        this.io.on('connection', this.onConnection);

        this.app.use(_express2.default.static(__dirname + '/../public'));

        this.server.listen(this.port, function () {
            _this.onListen();
        });
    }

    _createClass(Server, [{
        key: 'onListen',
        value: function onListen() {
            console.log('Listening on Port ' + this.port + '...');
        }
    }, {
        key: 'onConnection',
        value: function onConnection(socket) {
            console.log('connect');

            socket.on('disconnect', function () {
                console.log('user disconnected');
            });

            socket.on('client_update', function (clientData) {
                console.log('client: ' + clientData);
            });

            socket.on('move', function (clientData) {
                console.log('clientmove: ' + clientData);
            });
        }
    }]);

    return Server;
}();

exports.default = Server;


var server = new Server();