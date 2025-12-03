import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export interface IpfsResult {
    success: boolean;
    cid?: string;
    url?: string;
    error?: string;
}

export class IpfsService {
    private pinataApiKey: string;
    private pinataSecretApiKey: string;
    private gatewayUrl: string;

    constructor() {
        this.pinataApiKey = process.env.PINATA_API_KEY || '';
        this.pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY || '';
        this.gatewayUrl = process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
    }

    async uploadJSON(data: any): Promise<IpfsResult> {
        try {
            // If no API keys, return a mock CID for development
            if (!this.pinataApiKey) {
                console.warn('⚠️ No Pinata API keys found. Using mock IPFS CID.');
                const mockCid = 'QmMockHash' + Math.random().toString(36).substring(7);
                return {
                    success: true,
                    cid: mockCid,
                    url: `${this.gatewayUrl}/${mockCid}`
                };
            }

            const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
            const response = await axios.post(url, data, {
                headers: {
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretApiKey
                }
            });

            return {
                success: true,
                cid: response.data.IpfsHash,
                url: `${this.gatewayUrl}/${response.data.IpfsHash}`
            };
        } catch (error: any) {
            console.error('IPFS upload error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadFile(filePath: string): Promise<IpfsResult> {
        try {
            if (!this.pinataApiKey) {
                console.warn('⚠️ No Pinata API keys found. Using mock IPFS CID.');
                const mockCid = 'QmMockFileHash' + Math.random().toString(36).substring(7);
                return {
                    success: true,
                    cid: mockCid,
                    url: `${this.gatewayUrl}/${mockCid}`
                };
            }

            const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
            const data = new FormData();
            data.append('file', fs.createReadStream(filePath));

            const response = await axios.post(url, data, {
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data.getBoundary()}`,
                    'pinata_api_key': this.pinataApiKey,
                    'pinata_secret_api_key': this.pinataSecretApiKey
                }
            });

            return {
                success: true,
                cid: response.data.IpfsHash,
                url: `${this.gatewayUrl}/${response.data.IpfsHash}`
            };
        } catch (error: any) {
            console.error('IPFS file upload error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getGatewayUrl(cid: string): string {
        return `${this.gatewayUrl}/${cid}`;
    }
}
