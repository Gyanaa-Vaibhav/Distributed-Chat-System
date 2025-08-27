import { useEffect, useState } from 'react';
import socket from './socket';

type Props = {
    room: string,
}

export default function Chat ({room}:Props) {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');

    console.log(room)
    useEffect(() => {
        socket.on(room, (msg: string) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off(room); // cleanup on unmount
        };
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            // socket.emit('chat message', input);
            setMessages(prev => [...prev, input]);
            socket.emit("message", {message:input,room});
            setInput('');
        }
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                ))}
            </div>
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

