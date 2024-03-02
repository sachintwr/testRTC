import React, { useState, useCallback, useEffect } from "react";
import { useSocket } from '../Context/SocketProvider';
import { useNavigate } from 'react-router-dom'
const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = useSocket();
    const navigate = useNavigate();
    const handleSubmitForm = useCallback((e) => {
        e.preventDefault();
        socket.emit('room:join', { email, room })

    }, [email, room, socket]);

    const handleJoinRoom = useCallback((e) => {
        const { email, room } = e
        console.log(email, room)
        navigate(`/room/${room}`);
    }, [navigate]);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom)
        return () => {
            socket.off('room:join', handleJoinRoom)
        }
    }, [socket, handleJoinRoom])

    return (
        <div>
            <h1>LObby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email Id</label>
                <input type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="room">Room No.</label>
                <input type="text"
                    id="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)} />
                <button>join</button>
            </form>
        </div>
    )
}

export default LobbyScreen;