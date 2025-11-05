/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 

import { Dht } from './dht';
import { AzoraID } from '../../crypto/azora_id'; // Assuming crypto lib path
import { IceServer } from './ice';
import { PeerConnection } from './peer_connection';

/**
 * The AuraMesh Daemon runs as a background service on all azora-sapiens nodes.
 * It is responsible for maintaining the node's presence in the P2P network,
 * handling routing, and managing peer connections.
 */
class AuraMeshDaemon {
    private nodeId: AzoraID;
    private dht: Dht;
    private connections: Map<string, PeerConnection>; // Map public key to PeerConnection

    constructor() {
        console.log("Initializing AuraMesh Daemon...");
        this.connections = new Map();
    }

    /**
     * Starts the daemon.
     * Generates or loads the node's identity and joins the P2P network.
     */
    public async start(): Promise<void> {
        this.nodeId = await AzoraID.load(); // Load existing ID or create new one
        console.log(`Node ID: ${this.nodeId.getPublicKey()}`);

        this.dht = new Dht(this.nodeId);
        await this.dht.joinNetwork();
        console.log("Successfully joined the DHT network.");

        this.listenForConnections();
        console.log("Daemon started. Listening for peer connections...");
    }

    /**
     * Listens for incoming connection requests from other peers
     * discovered via the DHT.
     */
    private listenForConnections(): void {
        // This would involve signaling server logic via the DHT
        // to broker the initial WebRTC connection.
        this.dht.on('connection-request', async (peerId, offer) => {
            console.log(`Received connection request from ${peerId}`);
            const peer = new PeerConnection(peerId, this.nodeId);
            peer.on('connected', () => {
                this.connections.set(peerId, peer);
            });
            peer.on('disconnected', () => {
                this.connections.delete(peerId);
            });
            await peer.acceptOffer(offer);
        });
    }

    /**
     * Sends a message to a specific peer.
     * @param peerId The public key of the recipient peer.
     * @param data The data to send.
     */
    public async sendMessage(peerId: string, data: any): Promise<void> {
        let connection = this.connections.get(peerId);

        if (!connection || !connection.isConnected()) {
            console.log(`No active connection to ${peerId}. Establishing...`);
            // If not connected, find the peer via DHT and establish a new connection
            const peerInfo = await this.dht.findPeer(peerId);
            // ... logic to create new PeerConnection and send once connected
            connection = new PeerConnection(peerId, this.nodeId);
            await connection.initiateConnection(peerInfo);
            this.connections.set(peerId, connection);
        }

        await connection.send(data);
    }
}

// Main execution
const daemon = new AuraMeshDaemon();
daemon.start().catch(error => {
    console.error("Critical daemon error:", error);
    process.exit(1);
});

