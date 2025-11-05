/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * AZORA OS - Azure Integration API Route
 * Vercel API route for Azure cloud integration services
 */

import { createAzureIntegrationService } from '../../services/azure-integration-service';

export default async function handler(req, res) {
  try {
    const azureService = createAzureIntegrationService();

    switch (req.method) {
      case 'GET':
        const health = await azureService.getHealthStatus();
        res.status(200).json(health);
        break;

      case 'POST':
        // Handle Azure operations based on body.action
        const { action, ...params } = req.body;

        switch (action) {
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
            res.status(400).json({ error: 'Unknown action' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Azure Integration API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

