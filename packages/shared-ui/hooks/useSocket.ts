import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4005';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketIo = io(SOCKET_URL);

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    return socket;
};
