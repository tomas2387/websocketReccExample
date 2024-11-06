import { io } from 'socket.io-client';

const URL = 'http://localhost:4000';

export const socket = io(URL, {
    autoConnect: true,
    transports: ['websocket'],
    auth: async (cb) => {
        console.log('fetching token...');
        const res = await fetch('http://localhost:4000/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ channelId: '123', userId: '456' }),
        });
        const data = await res.json();
        cb({ token: data.token });
    }
});
