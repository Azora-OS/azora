// This file contains the authentication contract for the Azora OS. 
// It defines the structure and functions related to user authentication.

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";

const AUTH_CONTRACT_ADDRESS = "0xYourContractAddressHere"; // Replace with your contract address

const authContractABI = [
    // Define the ABI for the authentication contract
    "function registerUser(string memory username, string memory password) public",
    "function loginUser(string memory username, string memory password) public view returns (bool)",
    "function isUserRegistered(string memory username) public view returns (bool)"
];

export class AuthContract {
    private contract: Contract;

    constructor(signer: Signer | Provider) {
        this.contract = new Contract(AUTH_CONTRACT_ADDRESS, authContractABI, signer);
    }

    async registerUser(username: string, password: string): Promise<void> {
        const tx = await this.contract.registerUser(username, password);
        await tx.wait();
    }

    async loginUser(username: string, password: string): Promise<boolean> {
        return await this.contract.loginUser(username, password);
    }

    async isUserRegistered(username: string): Promise<boolean> {
        return await this.contract.isUserRegistered(username);
    }
}

