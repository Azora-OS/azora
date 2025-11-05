/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 

import { generateKeyPair, sign, verify } from './utils/crypto_utils'; // Assuming utils exist

/**
 * Represents a user's sovereign identity in the Azora ecosystem.
 * The private key is managed by the user's device and never exposed.
 * The public key is the user's address on the network.
 */
export class AzoraID {
    private privateKey: string;
    private publicKey: string;

    private constructor(privateKey: string, publicKey: string) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    /**
     * Loads an existing AzoraID from secure storage or creates a new one.
     * @returns A promise that resolves to an AzoraID instance.
     */
    public static async load(): Promise<AzoraID> {
        // In a real implementation, this would involve secure storage and
        // password-based key derivation (PBKDF2).
        let privateKey = localStorage.getItem('azora_private_key');
        let publicKey = localStorage.getItem('azora_public_key');

        if (!privateKey || !publicKey) {
            console.log("No existing ID found. Generating new AzoraID...");
            const keyPair = await generateKeyPair();
            privateKey = keyPair.privateKey;
            publicKey = keyPair.publicKey;
            
            localStorage.setItem('azora_private_key', privateKey);
            localStorage.setItem('azora_public_key', publicKey);
            console.log("New ID generated and saved securely.");
        }

        return new AzoraID(privateKey, publicKey);
    }

    /**
     * Gets the public key associated with this ID.
     * @returns The public key string.
     */
    public getPublicKey(): string {
        return this.publicKey;
    }

    /**
     * Signs a piece of data with the user's private key.
     * @param data The data to sign.
     * @returns A promise that resolves to the signature.
     */
    public async sign(data: any): Promise<string> {
        const dataString = JSON.stringify(data);
        return await sign(dataString, this.privateKey);
    }

    /**
     * Verifies a signature against this ID's public key.
     * @param data The original data.
     * @param signature The signature to verify.
     * @param publicKey The public key to use for verification.
     * @returns A promise that resolves to true if the signature is valid.
     */
    public static async verify(data: any, signature: string, publicKey: string): Promise<boolean> {
        const dataString = JSON.stringify(data);
        return await verify(dataString, signature, publicKey);
    }
}

