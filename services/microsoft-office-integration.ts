/**
 * AZORA OS - Microsoft Office 365 Integration Service
 *
 * Comprehensive Microsoft 365 integration providing Teams, OneDrive, SharePoint,
 * Outlook, and other Office services for enterprise productivity.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { DefaultAzureCredential } from '@azure/identity';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

export interface Microsoft365Config {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  userId?: string;
}

export interface Microsoft365ServiceStatus {
  graph: boolean;
  teams: boolean;
  onedrive: boolean;
  sharepoint: boolean;
  outlook: boolean;
  lastHealthCheck: Date;
}

/**
 * Microsoft Teams Integration
 */
export class TeamsIntegration {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Create a new Teams channel
   */
  async createChannel(teamId: string, channelName: string, description?: string): Promise<MicrosoftGraph.Channel> {
    const channel: MicrosoftGraph.Channel = {
      displayName: channelName,
      description: description || '',
    };

    return await this.graphClient
      .api(`/teams/${teamId}/channels`)
      .post(channel);
  }

  /**
   * Send message to Teams channel
   */
  async sendChannelMessage(teamId: string, channelId: string, message: string): Promise<MicrosoftGraph.ChatMessage> {
    const chatMessage: MicrosoftGraph.ChatMessage = {
      body: {
        content: message,
        contentType: 'text',
      },
    };

    return await this.graphClient
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post(chatMessage);
  }

  /**
   * Create a Teams meeting
   */
  async createMeeting(subject: string, startTime: Date, endTime: Date): Promise<MicrosoftGraph.OnlineMeeting> {
    const meeting: MicrosoftGraph.OnlineMeeting = {
      subject,
      startDateTime: startTime.toISOString(),
      endDateTime: endTime.toISOString(),
    };

    return await this.graphClient
      .api('/me/onlineMeetings')
      .post(meeting);
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<MicrosoftGraph.User[]> {
    const response = await this.graphClient
      .api(`/teams/${teamId}/members`)
      .get();

    return response.value;
  }
}

/**
 * OneDrive Integration
 */
export class OneDriveIntegration {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Upload file to OneDrive
   */
  async uploadFile(fileName: string, fileContent: Buffer): Promise<MicrosoftGraph.DriveItem> {
    const base64Content = fileContent.toString('base64');

    return await this.graphClient
      .api(`/me/drive/root:/${fileName}:/content`)
      .put(base64Content);
  }

  /**
   * Download file from OneDrive
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const response = await this.graphClient
      .api(`/me/drive/items/${fileId}/content`)
      .get();

    return Buffer.from(response);
  }

  /**
   * Create folder in OneDrive
   */
  async createFolder(folderName: string, parentFolderId?: string): Promise<MicrosoftGraph.DriveItem> {
    const folder: MicrosoftGraph.DriveItem = {
      name: folderName,
      folder: {},
    };

    const endpoint = parentFolderId
      ? `/me/drive/items/${parentFolderId}/children`
      : '/me/drive/root/children';

    return await this.graphClient
      .api(endpoint)
      .post(folder);
  }

  /**
   * Share OneDrive file
   */
  async shareFile(fileId: string, recipients: string[]): Promise<MicrosoftGraph.Permission> {
    const shareRequest: MicrosoftGraph.DriveRecipient[] = recipients.map(email => ({
      email,
    }));

    return await this.graphClient
      .api(`/me/drive/items/${fileId}/invite`)
      .post({
        recipients: shareRequest,
        message: 'Shared via Azora OS',
        requireSignIn: true,
        sendInvitation: true,
      });
  }

  /**
   * List files in OneDrive
   */
  async listFiles(folderId?: string): Promise<MicrosoftGraph.DriveItem[]> {
    const endpoint = folderId
      ? `/me/drive/items/${folderId}/children`
      : '/me/drive/root/children';

    const response = await this.graphClient
      .api(endpoint)
      .get();

    return response.value;
  }
}

/**
 * SharePoint Integration
 */
export class SharePointIntegration {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Create SharePoint site
   */
  async createSite(siteName: string, description?: string): Promise<MicrosoftGraph.Site> {
    const site = {
      displayName: siteName,
      description: description || '',
    };

    return await this.graphClient
      .api('/sites')
      .post(site);
  }

  /**
   * Upload document to SharePoint library
   */
  async uploadDocument(siteId: string, libraryName: string, fileName: string, fileContent: Buffer): Promise<MicrosoftGraph.DriveItem> {
    const base64Content = fileContent.toString('base64');

    return await this.graphClient
      .api(`/sites/${siteId}/drive/root:/${libraryName}/${fileName}:/content`)
      .put(base64Content);
  }

  /**
   * Create SharePoint list
   */
  async createList(siteId: string, listName: string, columns: any[]): Promise<MicrosoftGraph.List> {
    const list: MicrosoftGraph.List = {
      displayName: listName,
      columns: columns,
    };

    return await this.graphClient
      .api(`/sites/${siteId}/lists`)
      .post(list);
  }

  /**
   * Add item to SharePoint list
   */
  async addListItem(siteId: string, listId: string, itemData: any): Promise<MicrosoftGraph.ListItem> {
    const fields = { ...itemData };

    return await this.graphClient
      .api(`/sites/${siteId}/lists/${listId}/items`)
      .post({ fields });
  }
}

/**
 * Outlook Integration
 */
export class OutlookIntegration {
  private graphClient: Client;

  constructor(graphClient: Client) {
    this.graphClient = graphClient;
  }

  /**
   * Send email via Outlook
   */
  async sendEmail(to: string[], subject: string, body: string, isHtml: boolean = false): Promise<void> {
    const message: MicrosoftGraph.Message = {
      subject,
      body: {
        contentType: isHtml ? 'html' : 'text',
        content: body,
      },
      toRecipients: to.map(email => ({
        emailAddress: { address: email },
      })),
    };

    const sendMail = {
      message,
      saveToSentItems: true,
    };

    await this.graphClient
      .api('/me/sendMail')
      .post(sendMail);
  }

  /**
   * Create calendar event
   */
  async createEvent(subject: string, startTime: Date, endTime: Date, attendees?: string[]): Promise<MicrosoftGraph.Event> {
    const event: MicrosoftGraph.Event = {
      subject,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required',
      })),
    };

    return await this.graphClient
      .api('/me/events')
      .post(event);
  }

  /**
   * Get calendar events
   */
  async getEvents(startDate?: Date, endDate?: Date): Promise<MicrosoftGraph.Event[]> {
    let query = '/me/calendar/events';

    if (startDate && endDate) {
      query += `?startDateTime=${startDate.toISOString()}&endDateTime=${endDate.toISOString()}`;
    }

    const response = await this.graphClient
      .api(query)
      .get();

    return response.value;
  }

  /**
   * Create task in Microsoft To Do
   */
  async createTask(title: string, dueDateTime?: Date): Promise<MicrosoftGraph.TodoTask> {
    const task: MicrosoftGraph.TodoTask = {
      title,
      dueDateTime: dueDateTime ? {
        dateTime: dueDateTime.toISOString(),
        timeZone: 'UTC',
      } : undefined,
    };

    return await this.graphClient
      .api('/me/todo/lists/default/tasks')
      .post(task);
  }
}

/**
 * Microsoft 365 Integration Service
 * Unified interface for all Microsoft 365 services
 */
export class Microsoft365IntegrationService {
  private config: Microsoft365Config;
  private graphClient: Client;
  private status: Microsoft365ServiceStatus;

  // Service integrations
  public teams: TeamsIntegration;
  public onedrive: OneDriveIntegration;
  public sharepoint: SharePointIntegration;
  public outlook: OutlookIntegration;

  constructor(config: Microsoft365Config) {
    this.config = config;
    this.status = {
      graph: false,
      teams: false,
      onedrive: false,
      sharepoint: false,
      outlook: false,
      lastHealthCheck: new Date()
    };

    this.initializeServices();
  }

  /**
   * Initialize Microsoft Graph client and services
   */
  private async initializeServices(): Promise<void> {
    try {
      const credential = new DefaultAzureCredential();
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: this.config.scopes,
      });

      this.graphClient = Client.initWithMiddleware({
        authProvider,
      });

      // Initialize service integrations
      this.teams = new TeamsIntegration(this.graphClient);
      this.onedrive = new OneDriveIntegration(this.graphClient);
      this.sharepoint = new SharePointIntegration(this.graphClient);
      this.outlook = new OutlookIntegration(this.graphClient);

      await this.performHealthCheck();
    } catch (error) {
      console.error('Failed to initialize Microsoft 365 services:', error);
      throw new Error('Microsoft 365 service initialization failed');
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      // Test Microsoft Graph connectivity
      await this.graphClient.api('/me').get();
      this.status.graph = true;

      // Test individual services
      await this.testTeamsHealth();
      await this.testOneDriveHealth();
      await this.testSharePointHealth();
      await this.testOutlookHealth();

      this.status.lastHealthCheck = new Date();
    } catch (error) {
      console.error('Microsoft 365 health check failed:', error);
    }
  }

  private async testTeamsHealth(): Promise<void> {
    try {
      await this.graphClient.api('/me/joinedTeams').get();
      this.status.teams = true;
    } catch {
      this.status.teams = false;
    }
  }

  private async testOneDriveHealth(): Promise<void> {
    try {
      await this.graphClient.api('/me/drive').get();
      this.status.onedrive = true;
    } catch {
      this.status.onedrive = false;
    }
  }

  private async testSharePointHealth(): Promise<void> {
    try {
      await this.graphClient.api('/sites').get();
      this.status.sharepoint = true;
    } catch {
      this.status.sharepoint = false;
    }
  }

  private async testOutlookHealth(): Promise<void> {
    try {
      await this.graphClient.api('/me/messages').top(1).get();
      this.status.outlook = true;
    } catch {
      this.status.outlook = false;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<MicrosoftGraph.User> {
    return await this.graphClient
      .api('/me')
      .get();
  }

  /**
   * Search across Microsoft 365 services
   */
  async search(query: string, entityTypes: string[] = ['message', 'event', 'driveItem']): Promise<any> {
    const searchRequest = {
      requests: [{
        entityTypes,
        query: {
          queryString: query,
        },
      }],
    };

    return await this.graphClient
      .api('/search/query')
      .post(searchRequest);
  }

  /**
   * Get service health status
   */
  getServiceStatus(): Microsoft365ServiceStatus {
    return { ...this.status };
  }

  /**
   * Get service configuration (without sensitive data)
   */
  getServiceConfig(): Partial<Microsoft365Config> {
    const { clientSecret, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Get Microsoft Graph client for custom operations
   */
  getGraphClient(): Client {
    return this.graphClient;
  }
}

/**
 * Factory function to create Microsoft 365 Integration Service
 */
export function createMicrosoft365IntegrationService(config: Microsoft365Config): Microsoft365IntegrationService {
  return new Microsoft365IntegrationService(config);
}

/**
 * Default Microsoft 365 configuration template
 */
export const defaultMicrosoft365Config: Partial<Microsoft365Config> = {
  scopes: [
    'https://graph.microsoft.com/.default',
    'User.Read',
    'User.ReadWrite',
    'Mail.ReadWrite',
    'Mail.Send',
    'Calendars.ReadWrite',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All',
    'Team.ReadBasic.All',
    'TeamSettings.ReadWrite.All',
    'Channel.ReadBasic.All',
    'ChannelMessage.Send',
    'Tasks.ReadWrite',
  ],
  // Other fields would be populated from environment variables or secure storage
};
