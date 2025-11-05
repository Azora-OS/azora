/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * AZORA OS - Unified Services API Route
 * Vercel API route that handles all service requests through a single endpoint
 */

import { createAzureIntegrationService } from '../services/azure-integration-service';
import { createMicrosoft365IntegrationService } from '../services/microsoft365-integration-service';
import { createGoogleCloudIntegrationService } from '../services/google-cloud-integration-service';
import { createGoogleWorkspaceIntegrationService } from '../services/google-workspace-integration-service';
import { createDesktopEnvironmentService } from '../services/desktop-environment-service';
import { createFileSystemService } from '../services/filesystem-service';
import { createProcessManagementService } from '../services/process-management-service';
import { createNetworkStackService } from '../services/network-stack-service';
import { createSecurityFrameworkService } from '../services/security-framework-service';
import { createDevelopmentToolsService } from '../services/development-tools-service';
import { createProductivitySuiteService } from '../services/productivity-suite-service';
import { createCompatibilityLayersService } from '../services/compatibility-layers-service';

export default async function handler(req, res) {
  try {
    // Parse the service path from the URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Expected format: /services/{service-name}/{action}
    if (pathParts.length < 2 || pathParts[0] !== 'services') {
      return res.status(400).json({ error: 'Invalid service path format' });
    }

    const serviceName = pathParts[1];
    const action = pathParts.slice(2).join('/') || 'health';

    // Route to the appropriate service
    switch (serviceName) {
      case 'azure':
      case 'azure-integration':
        await handleAzureService(req, res, action);
        break;

      case 'microsoft365':
      case 'microsoft365-integration':
        await handleMicrosoft365Service(req, res, action);
        break;

      case 'google-cloud':
      case 'google-cloud-integration':
        await handleGoogleCloudService(req, res, action);
        break;

      case 'google-workspace':
      case 'google-workspace-integration':
        await handleGoogleWorkspaceService(req, res, action);
        break;

      case 'desktop':
      case 'desktop-environment':
        await handleDesktopService(req, res, action);
        break;

      case 'filesystem':
        await handleFilesystemService(req, res, action);
        break;

      case 'process':
      case 'process-management':
        await handleProcessService(req, res, action);
        break;

      case 'network':
      case 'network-stack':
        await handleNetworkService(req, res, action);
        break;

      case 'security':
      case 'security-framework':
        await handleSecurityService(req, res, action);
        break;

      case 'development':
      case 'development-tools':
        await handleDevelopmentService(req, res, action);
        break;

      case 'productivity':
      case 'productivity-suite':
        await handleProductivityService(req, res, action);
        break;

      case 'compatibility':
      case 'compatibility-layers':
        await handleCompatibilityService(req, res, action);
        break;

      default:
        res.status(404).json({ error: `Unknown service: ${serviceName}` });
    }

  } catch (error) {
    console.error('Services API Error:', error);
    res.status(500).json({
      error: error.message,
      service: 'api-services',
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================================================
// SERVICE HANDLERS
// ============================================================================

async function handleAzureService(req, res, action) {
  const azureService = createAzureIntegrationService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await azureService.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'upload-blob':
          const uploadResult = await azureService.uploadToBlobStorage(
            params.containerName,
            params.blobName,
            params.data,
            params.metadata
          );
          res.status(200).json({ success: true, url: uploadResult });
          break;

        case 'download-blob':
          const downloadResult = await azureService.downloadFromBlobStorage(
            params.containerName,
            params.blobName
          );
          res.status(200).json({ success: true, data: downloadResult });
          break;

        case 'analyze-text':
          const analysis = await azureService.analyzeSentiment(params.text);
          res.status(200).json({ success: true, analysis });
          break;

        case 'store-secret':
          await azureService.storeSecret(params.name, params.value);
          res.status(200).json({ success: true });
          break;

        case 'get-secret':
          const secret = await azureService.getSecret(params.name);
          res.status(200).json({ success: true, secret });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleMicrosoft365Service(req, res, action) {
  const ms365Service = createMicrosoft365IntegrationService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await ms365Service.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'get-teams':
          const teams = await ms365Service.getUserTeams();
          res.status(200).json({ success: true, teams });
          break;

        case 'send-message':
          await ms365Service.sendTeamsMessage(
            params.teamId,
            params.channelId,
            params.message,
            params.mentions
          );
          res.status(200).json({ success: true });
          break;

        case 'create-event':
          const event = await ms365Service.createOutlookEvent(
            params.summary,
            new Date(params.startTime),
            new Date(params.endTime),
            params.location,
            params.attendees,
            params.description
          );
          res.status(200).json({ success: true, event });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGoogleCloudService(req, res, action) {
  const gcpService = createGoogleCloudIntegrationService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await gcpService.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'create-user':
          const user = await gcpService.createFirebaseUser(
            params.email,
            params.password,
            params.displayName
          );
          res.status(200).json({ success: true, user });
          break;

        case 'upload-file':
          const uploadUrl = await gcpService.uploadToCloudStorage(
            params.bucketName,
            params.filename,
            params.data,
            params.metadata
          );
          res.status(200).json({ success: true, url: uploadUrl });
          break;

        case 'analyze-image':
          const analysis = await gcpService.analyzeImage(Buffer.from(params.imageData, 'base64'));
          res.status(200).json({ success: true, analysis });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGoogleWorkspaceService(req, res, action) {
  const gwsService = createGoogleWorkspaceIntegrationService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await gwsService.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'list-files':
          const files = await gwsService.listDriveFiles(params.query, params.pageSize);
          res.status(200).json({ success: true, files });
          break;

        case 'create-doc':
          const docId = await gwsService.createGoogleDoc(params.title, params.folderId);
          res.status(200).json({ success: true, documentId: docId });
          break;

        case 'send-email':
          await gwsService.sendGmailMessage(
            params.to,
            params.subject,
            params.body,
            params.isHtml
          );
          res.status(200).json({ success: true });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleDesktopService(req, res, action) {
  const desktopService = createDesktopEnvironmentService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = desktopService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'windows') {
        const windows = desktopService.getWindows();
        res.status(200).json({ success: true, windows });
      } else if (action === 'taskbar') {
        const taskbar = desktopService.getTaskbarItems();
        res.status(200).json({ success: true, taskbar });
      } else if (action === 'icons') {
        const icons = desktopService.getDesktopIcons();
        res.status(200).json({ success: true, icons });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'create-window':
          const windowId = desktopService.createWindow(params.config);
          res.status(200).json({ success: true, windowId });
          break;

        case 'close-window':
          const closed = desktopService.closeWindow(params.windowId);
          res.status(200).json({ success: closed });
          break;

        case 'launch-app':
          const appWindowId = await desktopService.launchApplication(params.appId);
          res.status(200).json({ success: true, windowId: appWindowId });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleFilesystemService(req, res, action) {
  const fsService = createFileSystemService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await fsService.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'list-directory':
          const items = await fsService.listDirectory(params.dirPath, params.includeHidden);
          res.status(200).json({ success: true, items });
          break;

        case 'create-directory':
          await fsService.createDirectory(params.dirPath);
          res.status(200).json({ success: true });
          break;

        case 'read-file':
          const content = await fsService.readFile(params.filePath);
          res.status(200).json({ success: true, content });
          break;

        case 'write-file':
          await fsService.writeFile(params.filePath, params.content);
          res.status(200).json({ success: true });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleProcessService(req, res, action) {
  const processService = createProcessManagementService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await processService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'processes') {
        const processes = processService.getAllProcesses();
        res.status(200).json({ success: true, processes });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'spawn-process':
          const pid = await processService.spawnProcess(
            params.command,
            params.args,
            params.options
          );
          res.status(200).json({ success: true, pid });
          break;

        case 'terminate-process':
          const terminated = await processService.terminateProcess(params.pid, params.force);
          res.status(200).json({ success: terminated });
          break;

        case 'set-priority':
          const prioritySet = processService.setProcessPriority(params.pid, params.priority);
          res.status(200).json({ success: prioritySet });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleNetworkService(req, res, action) {
  const networkService = createNetworkStackService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await networkService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'interfaces') {
        const interfaces = networkService.getNetworkInterfaces();
        res.status(200).json({ success: true, interfaces });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'connect-vpn':
          const vpnConnected = await networkService.connectVPN(params.connectionId);
          res.status(200).json({ success: vpnConnected });
          break;

        case 'disconnect-vpn':
          const vpnDisconnected = await networkService.disconnectVPN(params.connectionId);
          res.status(200).json({ success: vpnDisconnected });
          break;

        case 'add-firewall-rule':
          networkService.createFirewallRule(params.rule);
          res.status(200).json({ success: true });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleSecurityService(req, res, action) {
  const securityService = createSecurityFrameworkService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await securityService.getHealthStatus();
        res.status(200).json(health);
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'authenticate':
          const authResult = await securityService.authenticateUser(
            params.username,
            params.credentials
          );
          res.status(200).json(authResult);
          break;

        case 'create-user':
          const userId = await securityService.createUser(params.userData);
          res.status(200).json({ success: true, userId });
          break;

        case 'encrypt-data':
          const encrypted = await securityService.encryptData(
            params.data,
            params.keyId
          );
          res.status(200).json({ success: true, encrypted: encrypted.toString('base64') });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleDevelopmentService(req, res, action) {
  const devService = createDevelopmentToolsService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await devService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'projects') {
        const projects = Array.from(devService['projects'].values());
        res.status(200).json({ success: true, projects });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'create-project':
          const projectId = devService.createProject(params.projectData);
          res.status(200).json({ success: true, projectId });
          break;

        case 'build-project':
          const buildId = await devService.buildProject(params.projectId, params.target);
          res.status(200).json({ success: true, buildId });
          break;

        case 'analyze-code':
          const analysis = await devService.analyzeCode(params.filePath);
          res.status(200).json({ success: true, analysis });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleProductivityService(req, res, action) {
  const productivityService = createProductivitySuiteService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await productivityService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'documents') {
        const documents = Array.from(productivityService['documents'].values());
        res.status(200).json({ success: true, documents });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'create-document':
          const docId = productivityService.createDocument(
            params.type,
            params.title,
            params.templateId,
            params.author
          );
          res.status(200).json({ success: true, documentId: docId });
          break;

        case 'save-document':
          const saved = productivityService.saveDocument(
            params.documentId,
            params.userId,
            params.changes
          );
          res.status(200).json({ success: saved });
          break;

        case 'export-document':
          const exportedData = await productivityService.exportDocument(
            params.documentId,
            params.format,
            params.userId
          );
          res.status(200).json({
            success: true,
            data: exportedData.toString('base64'),
            contentType: getContentType(params.format)
          });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleCompatibilityService(req, res, action) {
  const compatibilityService = createCompatibilityLayersService();

  switch (req.method) {
    case 'GET':
      if (action === 'health' || action === '') {
        const health = await compatibilityService.getHealthStatus();
        res.status(200).json(health);
      } else if (action === 'layers') {
        const layers = compatibilityService.getCompatibilityLayers();
        res.status(200).json({ success: true, layers });
      } else {
        res.status(404).json({ error: 'Action not found' });
      }
      break;

    case 'POST':
      const { operation, ...params } = req.body;

      switch (operation) {
        case 'run-application':
          const appId = await compatibilityService.runApplication(params.appConfig);
          res.status(200).json({ success: true, applicationId: appId });
          break;

        case 'create-vm':
          compatibilityService.createVirtualMachine(params.vm);
          res.status(200).json({ success: true });
          break;

        case 'start-emulator':
          const emulatorStarted = await compatibilityService.startAndroidEmulator(params.emulatorId);
          res.status(200).json({ success: emulatorStarted });
          break;

        default:
          res.status(400).json({ error: 'Unknown operation' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper function
function getContentType(format: string): string {
  const types: Record<string, string> = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'html': 'text/html',
    'txt': 'text/plain',
    'json': 'application/json',
  };
  return types[format] || 'application/octet-stream';
}

