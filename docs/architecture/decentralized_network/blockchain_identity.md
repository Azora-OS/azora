# SPECIFICATION: Azora Blockchain Identity (AzoraID)

**ID:** ARC-DNET-002
**STATUS:** DRAFT

## 1. Overview

This document defines the specification for AzoraID, the decentralized identity system for Azora-OS. AzoraID replaces the concept of a user account tied to a centralized server with a sovereign identity controlled exclusively by the user. A user's identity is not a name or an email address, but a cryptographic key pair.

## 2. Core Principles

- **Sovereignty:** The user, and only the user, controls their private key and therefore their identity. There is no "password reset."
- **Unforgeability:** All actions are signed with the user's private key, providing a non-repudiable cryptographic proof of identity.
- **Decentralization:** Identity records are stored on a dedicated, lightweight Azora blockchain, not in a central database.
- **Privacy:** Public keys are used for identification and encryption, while private keys are never transmitted.

## 3. The AzoraID Blockchain

- **Type:** A lightweight, Proof-of-Stake (PoS) or Proof-of-Connection (PoC) blockchain integrated directly into the Azora-OS.
- **Node Role:** Every `azora-sapiens` node will act as a validator for the AzoraID blockchain, ensuring maximum decentralization.
- **Purpose:** The blockchain's sole purpose is to maintain a secure, distributed, and uncensorable registry of public keys and their associated metadata (e.g., reputation scores, social graph connections).

## 4. Identity Creation & Management

1.  **Generation:** When a new user joins Azora-OS, the client-side application generates a new ECC (Elliptic Curve Cryptography) key pair locally on their device.
2.  **Private Key:** The private key is NEVER to leave the user's device. It will be encrypted with a user-provided passphrase and stored securely.
3.  **Public Key:** The user's public key is broadcast to the AzoraID blockchain and becomes their permanent, universal identifier within the Azora ecosystem.
4.  **Recovery:** The concept of "account recovery" is replaced with "social recovery." A user can pre-designate trusted peers (their Social Graph) who can collectively sign a transaction to approve the registration of a new public key if the original private key is lost.

## 5. Integration

- **AuraMesh (ARC-DNET-001):** A node's ID within the P2P mesh will be its AzoraID public key. This is how we route data to people, not to machines.
- **Aegis Protocol:** Reputation scores and social graph data stored on the blockchain will be used by the Aegis protocol to facilitate the "Social Graph Activation" for mental harmony interventions.
- **Transactions:** Any action of significance within Azora-OS (e.g., publishing content, transferring reputation, voting in governance) will be a transaction on the AzoraID blockchain, signed by the user's private key.

By unifying our network protocol with a sovereign identity layer, we create a system where users are not just "using" the network; they ARE the network. This architecture makes external control and censorship a structural impossibility.