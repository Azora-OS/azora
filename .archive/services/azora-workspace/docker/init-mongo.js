// AZORA PROPRIETARY LICENSE
//
// Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
//
// See LICENSE file for details.

// MongoDB initialization script for Azora Workspace
db = db.getSiblingDB('azora-workspace');

// Create collections
db.createCollection('users');
db.createCollection('emails');
db.createCollection('workspaces');
db.createCollection('channels');
db.createCollection('messages');
db.createCollection('files');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "lastLogin": 1 });

db.emails.createIndex({ "userId": 1 });
db.emails.createIndex({ "from": 1 });
db.emails.createIndex({ "to": 1 });
db.emails.createIndex({ "sentAt": 1 });
db.emails.createIndex({ "receivedAt": 1 });
db.emails.createIndex({ "threadId": 1 });
db.emails.createIndex({ "isRead": 1 });
db.emails.createIndex({ "isStarred": 1 });

db.workspaces.createIndex({ "owner": 1 });
db.workspaces.createIndex({ "members": 1 });
db.workspaces.createIndex({ "createdAt": 1 });

db.channels.createIndex({ "workspaceId": 1 });
db.channels.createIndex({ "members": 1 });

db.messages.createIndex({ "channelId": 1 });
db.messages.createIndex({ "userId": 1 });
db.messages.createIndex({ "createdAt": 1 });

db.files.createIndex({ "userId": 1 });
db.files.createIndex({ "workspaceId": 1 });
db.files.createIndex({ "uploadedAt": 1 });

// Create admin user (for development)
db.users.insertOne({
  email: "admin@azora.workspace",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8GwqWJqKS", // password: admin123
  firstName: "Azora",
  lastName: "Admin",
  role: "admin",
  organization: "Azora OS",
  emailSettings: {
    signature: "Best regards,\nAzora Admin",
    autoReply: false
  },
  createdAt: new Date(),
  lastLogin: new Date()
});

print("Azora Workspace database initialized successfully!");