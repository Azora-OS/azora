import { StorageContract } from '../contracts/storageContract';

class StorageService {
    private storageContract: StorageContract;

    constructor(storageContract: StorageContract) {
        this.storageContract = storageContract;
    }

    async uploadFile(file: File): Promise<string> {
        // Logic to upload file to storage
        const fileUrl = await this.storageContract.upload(file);
        return fileUrl;
    }

    async downloadFile(fileId: string): Promise<File> {
        // Logic to download file from storage
        const file = await this.storageContract.download(fileId);
        return file;
    }

    async deleteFile(fileId: string): Promise<boolean> {
        // Logic to delete file from storage
        const success = await this.storageContract.delete(fileId);
        return success;
    }

    async listFiles(): Promise<string[]> {
        // Logic to list all files in storage
        const files = await this.storageContract.list();
        return files;
    }
}

export default StorageService;

