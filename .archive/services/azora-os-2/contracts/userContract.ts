// This file contains the user contract for Azora OS, defining user-related functionalities and interactions.

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserContract {
    createUser(name: string, email: string): Promise<User>;
    getUser(id: string): Promise<User | null>;
    updateUser(id: string, name?: string, email?: string): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;
}

