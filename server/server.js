'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _v = require('uuid/v1');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_dotenv2.default.config();

var Server = function () {
    function Server() {
        var _this = this;

        _classCallCheck(this, Server);

        this.app = (0, _express2.default)();
        this.server = _http2.default.Server(this.app);
        this.port = process.env.WEBSOCKET_PORT || 3000;

        this.app.use(_express2.default.static(__dirname + '/../public'));
        this.server.listen(this.port, function () {
            _this.onListen();
        });

        this.io = new _socket2.default(this.server);
        this.io.on('connection', function (socket) {
            _this.onConnection(socket);
        });

        this.players = [];
        this.throwables = [];
    }

    _createClass(Server, [{
        key: 'getPlayer',
        value: function getPlayer(id) {
            return this.players.find(function (player) {
                return player.id == id;
            });
        }
    }, {
        key: 'onListen',
        value: function onListen() {
            console.log('Listening on Port ' + this.port + '...');
        }
    }, {
        key: 'joinPlayer',
        value: function joinPlayer(player, clientId) {
            player.id = clientId;
            this.players.push(player);
            console.log('Player joined');
        }
    }, {
        key: 'updatePlayer',
        value: function updatePlayer(updatedPlayer, clientId) {
            var player = this.getPlayer(clientId);
            player = Object.assign(player, updatedPlayer);
            this.io.emit('update_state', this.players);
        }
    }, {
        key: 'leavePlayer',
        value: function leavePlayer(clientId) {
            var removePlayer = this.getPlayer(clientId);
            this.players.splice(this.players.indexOf(removePlayer), 1);
            console.log('Player left');
        }
    }, {
        key: 'onConnection',
        value: function onConnection(socket) {
            var _this2 = this;

            socket.id = (0, _v2.default)();

            socket.on('join', function (player) {
                _this2.joinPlayer(player, socket.id);
            });
            socket.on('disconnect', function () {
                _this2.leavePlayer(socket.id);
            });
            socket.on('update_player', function (player) {
                _this2.updatePlayer(player, socket.id);
            });
        }
    }]);

    return Server;
}();

exports.default = Server;


var server = new Server();