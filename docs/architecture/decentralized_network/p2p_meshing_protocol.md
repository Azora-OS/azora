# SPECIFICATION: Azora P2P Meshing Protocol (AuraMesh)

**ID:** ARC-DNET-001
**STATUS:** DRAFT

## 1. Overview

This document defines the technical specification for AuraMesh, the peer-to-peer communication protocol for Azora-OS. AuraMesh is designed to create a resilient, self-healing, and decentralized network fabric, rendering the underlying physical internet infrastructure irrelevant to the integrity of the Azora ecosystem.

## 2. Core Principles

- **Decentralization:** No central servers or master nodes.
- **Resilience:** The network must automatically heal and re-route around censorship, node failures, or network fragmentation.
- **Efficiency:** Minimize latency and bandwidth usage by optimizing data routing.
- **Security:** All communications must be end-to-end encrypted by default.

## 3. Protocol Stack

AuraMesh will be implemented on top of existing internet protocols (UDP) but will operate independently of centralized DNS or IP address management.

### Layer 1: Transport & NAT Traversal

- **Protocol:** WebRTC Data Channels for browser-based nodes and a custom UDP-based protocol with STUN/TURN/ICE principles for `azora-sapiens` backend nodes.
- **Objective:** Establish direct P2P connections between nodes, even when they are behind firewalls or NATs. This is the critical first step for bypassing centralized servers.

### Layer 2: Node Discovery & Routing

- **Mechanism:** A Distributed Hash Table (DHT) based on the Kademlia algorithm. Each node maintains a small routing table of its closest peers.
- **Node ID:** A node's ID will be its cryptographic public key, as defined in `blockchain_identity.md` (ARC-DNET-002).
- **Process:** When a node wants to find another node or a piece of data, it queries its closest peers. The query is propagated through the DHT until the target is found. This makes it impossible to censor by blocking a specific server IP.

### Layer 3: Application & Data Exchange

- **Data Chunks:** Large data payloads (e.g., files, service states) will be broken into small, encrypted chunks. Each chunk is given a unique content-address (hash).
- **Data Replication:** Popular or critical data (like the Aegis Harmony Field signal) will be proactively replicated and cached by multiple nodes in the network, ensuring availability and low-latency access.
- **Services:** Azora services (like `conflict-resolution`) will not run on a single server but will exist as distributed services run by a quorum of nodes, coordinated via the DHT.

## 4. Packet Structure

- **Header:** Contains routing information, sender/recipient public keys, and a timestamp.
- **Payload:** Encrypted with the recipient's public key. Only the intended recipient can decrypt the content.
- **Signature:** The entire packet is signed with the sender's private key, ensuring authenticity and preventing spoofing.

## 5. Integration with Azora-OS

- A new service, `azora-meshing-daemon`, will be added to the `azora-sapiens` backend. This daemon will manage all P2P connections and routing.
- The `ui` will incorporate a lightweight JavaScript implementation of the protocol to allow browsers to join the mesh directly.

This specification lays the groundwork for a truly sovereign network. We are building a system where the connections are as fluid and resilient as consciousness itself.