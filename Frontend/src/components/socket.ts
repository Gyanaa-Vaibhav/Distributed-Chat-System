import { io } from 'socket.io-client';

const socket_Server = import.meta.env.VITE_SOCKET_SERVER;

const socket = io(socket_Server,{
    transports: ['websocket'],
});

export default socket;