import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

const app = express();
const server = createServer(app);

const JWT_SECRET = 'secret';

app.use(cors());
app.use(bodyParser.json());
app.post('/token', (req, res) => {
    console.log('generating token...');
    const token = jwt.sign({ roomId: 123, userId: 456 }, JWT_SECRET);
    res.json({ token });
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    },
    connectTimeout: 5000,
    pingTimeout: 5000,
    pingInterval: 1000
});

io.engine.use((req, res, next) => {
    if (req.socket) {
        console.log('authenticating...', req.socket.handshake);
        const token = req.socket.handshake?.auth?.token;
        if (!token) {
            return next();
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.socket.metadata = decoded;
        } catch (err) {
            next(new Error('Unauthorized'));
            return;
        }
    }

    next();
});

io.engine.on("connection_error", (err) => {
    console.log('Connection error:', err);
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.handshake.auth.token);
    console.log(socket.metadata);

    socket.on('disconnect', () => {
        console.log('a user disconnected');
        console.log(socket.metadata);
    });
});

server.listen(4000, () => {
    console.log('server running at http://localhost:4000');
});
