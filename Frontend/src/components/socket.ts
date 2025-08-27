// src/socket.ts
import { io } from 'socket.io-client';

const socket_Server = import.meta.env.VITE_SOCKET_SERVER;
// Replace with your backend's URL and port

const socket = io(socket_Server,{
    transports: ['websocket'],
}); // or wherever your backend runs

export default socket;