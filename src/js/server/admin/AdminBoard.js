import path from 'path';
import twig from 'twig';
import basicAuth from 'basic-auth';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import {ServerConfig} from 'shared/configs/GameConfig';

export default class AdminBoard {


    /**
     *
     */
    constructor(app, data) {
        this.app = app;
        this.data = data;

        twig.cache(false);

        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        this.app.set('views', path.resolve('server/admin/views'));
        this.app.set('view engine', 'twig');
        this.app.set('cache', false);

        this.app.get('/admin', this.authMiddleware, this.getAdminBoard.bind(this));
        this.app.post('/admin/reset-throwables', this.authMiddleware, this.resetThrowables.bind(this));
        this.app.post('/admin/reset-stats', this.authMiddleware, this.resetStats.bind(this));
        this.app.post('/admin/close-room', this.authMiddleware, this.closeRoom.bind(this));
        this.app.post('/admin/reset-server', this.authMiddleware, this.resetServer.bind(this));

    }


    /**
     *
     */
    getAdminBoard(req, res) {
        res.render('index.twig', this.data);
    }


    /**
     *
     */
    resetThrowables(req, res) {
        let gameRoom = this.getRoom(req.body.roomKey);
        if(gameRoom) {
            gameRoom.resetAllThrowables();
            console.log(gameRoom.roomKey + ': Admin reset throwables');
            return res.sendStatus(200);
        }

        return res.sendStatus(500);
    }


    /**
     *
     */
    resetStats(req, res) {
        let gameRoom = this.getRoom(req.body.roomKey);
        if(gameRoom) {
            gameRoom.resetAllThrowables();
            console.log(gameRoom.roomKey + ': Admin reset throwables');
            return res.sendStatus(200);
        }

        return res.sendStatus(500);
    }


    /**
     *
     */
    closeRoom(req, res) {
        let gameRoom = this.getRoom(req.body.roomKey);
        if(gameRoom) {
            gameRoom.closeRoom();
            this.data.gameRooms.splice(this.data.gameRooms.indexOf(gameRoom), 1);
            console.log(gameRoom.roomKey + ': Admin close room');
            return res.sendStatus(200);
        }

        return res.sendStatus(500);
    }


    /**
     *
     */
    resetServer(req, res) {
        process.exit(1);
    }


    /**
     *
     */
    getRoom(roomKey) {
        for(let gameRoom of this.data.gameRooms) {
            if(gameRoom.roomKey == roomKey) {
                return gameRoom;
            }
        }
    }


    /**
     *
     */
    authMiddleware(req, res, next) {

        let middleWareRes = res;

        function unauthorized(res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        };

        let user = basicAuth(req);

        if (!user || !user.name || !user.pass) {
            return unauthorized(res);
        };

        bcrypt.compare(user.pass, ServerConfig.PWHASH, (err, res) => {
            if (user.name === ServerConfig.USER && res == true) {
                return next();
            } else {
                return unauthorized(middleWareRes);
            };
        });

    };

}
