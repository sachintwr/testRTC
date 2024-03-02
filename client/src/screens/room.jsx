import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from '../Context/SocketProvider'
import ReactPlayer from 'react-player';
import peer from "../service/peer";

const RoomPage = () => {
    const socket = useSocket();
    const [remotSocketId, setRemotSocketId] = useState(null)
    const [myStream, setMyStream] = useState()
    const [remoteStream, setRemoteStream] = useState()

    const handleCllUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const offer = await peer.getOffer();
        console.log("offer in react ====>>>>", offer)
        socket.emit("user:call", { to: remotSocketId, offer })
        setMyStream(stream);
    }, [remotSocketId, socket])

    const handleUserJoind = useCallback((data) => {
        console.log("new joined===>", data)
        console.log(`email ${data.id} joind room`)

        setRemotSocketId(data.id)
    }, [])

    const sendStrem = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(async ({ from, ans }) => {
        peer.setLocalDescription(ans)
        console.log("myStream=====>", myStream)
        sendStrem();
        console.log("call accepted!!")
    }, [sendStrem])



    const handleInCommingCall = useCallback(async ({ from, offer }) => {
        setRemotSocketId(from);
        console.log("from nd offers", from, offer);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted", { to: from, ans });

    }, [socket])

    const handleNegotiationNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remotSocketId })

    }, [remotSocketId, socket])

    const handleNegoNeededIncomming = useCallback(async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans })

    }, [socket]);

    const handleNegoFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded)
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded)

        }

    }, [handleNegotiationNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams
            console.log("got trackes")
            setRemoteStream(remoteStream[0]);
        })
    }, [])

    useEffect(() => {
        socket.on('user:joined', handleUserJoind);
        socket.on('incomming:call', handleInCommingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeededIncomming);
        socket.on('peer:nego:final', handleNegoFinal);

        return () => {
            socket.off('user:joined', handleUserJoind);
            socket.off('incomming:call', handleInCommingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeededIncomming);
            socket.off('peer:nego:final', handleNegoFinal);

        }
    }, [socket, handleUserJoind, handleInCommingCall, handleCallAccepted, handleNegoNeededIncomming, handleNegoFinal]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remotSocketId ? "connected" : 'no one in side the room'}</h4>
            {myStream && <button onClick={sendStrem}>Send Stream</button>}
            {remotSocketId && <button onClick={handleCllUser}>Call</button>}
            {
                myStream && (
                    <>
                        <h1>My Stream</h1>
                        <ReactPlayer
                            playing muted
                            height='100px'
                            width='200px'
                            url={myStream}
                        />
                    </>)
            }
            {
                remoteStream && (
                    <>
                        <h1>Remote Stream</h1>
                        <ReactPlayer
                            playing muted
                            height='100px'
                            width='200px'
                            url={remoteStream}
                        />
                    </>)
            }
        </div>
    )
}
export default RoomPage