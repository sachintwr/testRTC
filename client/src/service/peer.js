class PeerService {
    constructor() {

        this.peer = new RTCPeerConnection({
            iceServers: [{
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:global.stun.twilio.com:3478"
                ]
            }]
        })

    }

    async getAnswer(offer) {
        try {
            await this.peer.setRemoteDescription(offer)
            const answer = await this.peer.createAnswer()
            await this.peer.setLocalDescription(new RTCSessionDescription(answer))
            return answer;
        } catch (error) {
            console.error("Error answer offer:", error);
            throw error;
        }
    }

    async setLocalDescription(ans) {
        try {
            if (this.peer) {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            }
        } catch (error) {
            console.error("Error set local description offer:", error);
            throw error;
        }
    }

    async getOffer() {
        try {

            const offer = await this.peer.createOffer()
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;


        } catch (error) {
            console.error("Error creating offer:", error);
            throw error;
        }

    }
}

export default new PeerService();