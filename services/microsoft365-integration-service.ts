/**
 * AZORA OS - Microsoft 365 Integration Service
 *
 * Provides comprehensive Microsoft 365 integration including:
 * - Microsoft Teams (Chat, Meetings, Channels)
 * - OneDrive (File Storage, Sync, Sharing)
 * - SharePoint (Sites, Lists, Document Libraries)
 * - Outlook (Email, Calendar, Contacts)
 * - Microsoft Graph API (Unified API access)
 * - Office Online (Word, Excel, PowerPoint)
 * - Azure AD (Authentication, User Management)
 *
 * This service enables Azora OS to compete directly with Microsoft's productivity suite
 * by providing native Microsoft 365 integration capabilities.
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { DefaultAzureCredential } from '@azure/identity';

export interface Microsoft365Config {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  webUrl: string;
}

export interface TeamsMessage {
  id: string;
  content: string;
  sender: {
    displayName: string;
    email: string;
  };
  createdDateTime: string;
  lastModifiedDateTime: string;
}

export interface OneDriveItem {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  downloadUrl?: string;
  lastModifiedDateTime: string;
  createdDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
    hashes: {
      sha256Hash: string;
    };
  };
}

export interface OutlookEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  body?: {
    content: string;
    contentType: 'text' | 'html';
  };
}

export class Microsoft365IntegrationService {
  private client: Client;
  private config: Microsoft365Config;

  constructor(config: Microsoft365Config) {
    this.config = config;
    this.initializeGraphClient();
  }

  private async initializeGraphClient(): Promise<void> {
    try {
      const credential = new DefaultAzureCredential();
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: this.config.scopes,
      });

      this.client = Client.initWithMiddleware({
        authProvider,
      });

      console.log('✅ Microsoft 365 Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Microsoft Graph client:', error);
      throw error;
    }
  }

  // ============================================================================
  // MICROSOFT TEAMS INTEGRATION
  // ============================================================================

  /**
   * Get user's joined teams
   */
  async getUserTeams(): Promise<any[]> {
    try {
      const response = await this.client.api('/me/joinedTeams').get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get user teams:', error);
      throw error;
    }
  }

  /**
   * Get channels for a specific team
   */
  async getTeamChannels(teamId: string): Promise<TeamsChannel[]> {
    try {
      const response = await this.client.api(`/teams/${teamId}/channels`).get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get team channels:', error);
      throw error;
    }
  }

  /**
   * Send message to Teams channel
   */
  async sendTeamsMessage(
    teamId: string,
    channelId: string,
    message: string,
    mentions?: string[]
  ): Promise<void> {
    try {
      const messageBody = {
        body: {
          content: message,
          contentType: 'text',
        },
      };

      // Add mentions if provided
      if (mentions && mentions.length > 0) {
        messageBody.body.content += mentions.map(mention =>
          ` @${mention}`
        ).join('');
      }

      await this.client.api(`/teams/${teamId}/channels/${channelId}/messages`).post(messageBody);
    } catch (error) {
      console.error('Failed to send Teams message:', error);
      throw error;
    }
  }

  /**
   * Get messages from Teams channel
   */
  async getTeamsMessages(teamId: string, channelId: string, limit: number = 50): Promise<TeamsMessage[]> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .top(limit)
        .get();

      return (response.value || []).map((msg: any) => ({
        id: msg.id,
        content: msg.body?.content || '',
        sender: {
          displayName: msg.from?.user?.displayName || 'Unknown',
          email: msg.from?.user?.userIdentityType === 'aadUser' ? msg.from.user.id : '',
        },
        createdDateTime: msg.createdDateTime,
        lastModifiedDateTime: msg.lastModifiedDateTime,
      }));
    } catch (error) {
      console.error('Failed to get Teams messages:', error);
      throw error;
    }
  }

  /**
   * Create Teams meeting
   */
  async createTeamsMeeting(subject: string, startTime: Date, endTime: Date, attendees?: string[]): Promise<any> {
    try {
      const meeting = {
        subject,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      };

      if (attendees && attendees.length > 0) {
        meeting.attendees = attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required',
        }));
      }

      const response = await this.client.api('/me/events').post(meeting);
      return response;
    } catch (error) {
      console.error('Failed to create Teams meeting:', error);
      throw error;
    }
  }

  // ============================================================================
  // ONEDRIVE INTEGRATION
  // ============================================================================

  /**
   * Get OneDrive root items
   */
  async getOneDriveRoot(): Promise<OneDriveItem[]> {
    try {
      const response = await this.client.api('/me/drive/root/children').get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get OneDrive root:', error);
      throw error;
    }
  }

  /**
   * Get OneDrive folder contents
   */
  async getOneDriveFolder(folderId: string): Promise<OneDriveItem[]> {
    try {
      const response = await this.client.api(`/me/drive/items/${folderId}/children`).get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get OneDrive folder:', error);
      throw error;
    }
  }

  /**
   * Upload file to OneDrive
   */
  async uploadToOneDrive(
    filename: string,
    content: Buffer,
    folderId?: string
  ): Promise<OneDriveItem> {
    try {
      const endpoint = folderId
        ? `/me/drive/items/${folderId}:/${filename}:/content`
        : `/me/drive/root:/${filename}:/content`;

      const response = await this.client.api(endpoint).put(content);
      return response;
    } catch (error) {
      console.error('Failed to upload to OneDrive:', error);
      throw error;
    }
  }

  /**
   * Download file from OneDrive
   */
  async downloadFromOneDrive(itemId: string): Promise<Buffer> {
    try {
      const response = await this.client.api(`/me/drive/items/${itemId}/content`).get();
      return Buffer.from(response);
    } catch (error) {
      console.error('Failed to download from OneDrive:', error);
      throw error;
    }
  }

  /**
   * Create OneDrive folder
   */
  async createOneDriveFolder(name: string, parentFolderId?: string): Promise<OneDriveItem> {
    try {
      const folderData = {
        name,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const endpoint = parentFolderId
        ? `/me/drive/items/${parentFolderId}/children`
        : '/me/drive/root/children';

      const response = await this.client.api(endpoint).post(folderData);
      return response;
    } catch (error) {
      console.error('Failed to create OneDrive folder:', error);
      throw error;
    }
  }

  /**
   * Share OneDrive item
   */
  async shareOneDriveItem(
    itemId: string,
    recipients: string[],
    message?: string
  ): Promise<string> {
    try {
      const shareData = {
        recipients: recipients.map(email => ({ email })),
        message,
        requireSignIn: true,
        sendInvitation: true,
        roles: ['read'],
      };

      const response = await this.client.api(`/me/drive/items/${itemId}/invite`).post(shareData);
      return response.shareId;
    } catch (error) {
      console.error('Failed to share OneDrive item:', error);
      throw error;
    }
  }

  // ============================================================================
  // SHAREPOINT INTEGRATION
  // ============================================================================

  /**
   * Get SharePoint sites
   */
  async getSharePointSites(): Promise<any[]> {
    try {
      const response = await this.client.api('/sites').get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get SharePoint sites:', error);
      throw error;
    }
  }

  /**
   * Get SharePoint site lists
   */
  async getSharePointLists(siteId: string): Promise<any[]> {
    try {
      const response = await this.client.api(`/sites/${siteId}/lists`).get();
      return response.value || [];
    } catch (error) {
      console.error('Failed to get SharePoint lists:', error);
      throw error;
    }
  }

  /**
   * Create SharePoint list item
   */
  async createSharePointListItem(
    siteId: string,
    listId: string,
    itemData: Record<string, any>
  ): Promise<any> {
    try {
      const response = await this.client
        .api(`/sites/${siteId}/lists/${listId}/items`)
        .post({ fields: itemData });

      return response;
    } catch (error) {
      console.error('Failed to create SharePoint list item:', error);
      throw error;
    }
  }

  /**
   * Get SharePoint document library
   */
  async getSharePointDocuments(siteId: string): Promise<any[]> {
    try {
      const response = await this.client
        .api(`/sites/${siteId}/drive/root/children`)
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Failed to get SharePoint documents:', error);
      throw error;
    }
  }

  // ============================================================================
  // OUTLOOK INTEGRATION
  // ============================================================================

  /**
   * Get Outlook emails
   */
  async getOutlookEmails(folder: string = 'inbox', limit: number = 50): Promise<any[]> {
    try {
      const response = await this.client
        .api(`/me/mailFolders/${folder}/messages`)
        .top(limit)
        .get();

      return response.value || [];
    } catch (error) {
      console.error('Failed to get Outlook emails:', error);
      throw error;
    }
  }

  /**
   * Send Outlook email
   */
  async sendOutlookEmail(
    to: string[],
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<void> {
    try {
      const message = {
        subject,
        body: {
          contentType: isHtml ? 'html' : 'text',
          content: body,
        },
        toRecipients: to.map(email => ({
          emailAddress: { address: email },
        })),
      };

      await this.client.api('/me/sendMail').post({ message });
    } catch (error) {
      console.error('Failed to send Outlook email:', error);
      throw error;
    }
  }

  /**
   * Get Outlook calendar events
   */
  async getOutlookCalendarEvents(limit: number = 50): Promise<OutlookEvent[]> {
    try {
      const response = await this.client
        .api('/me/events')
        .top(limit)
        .get();

      return (response.value || []).map((event: any) => ({
        id: event.id,
        subject: event.subject,
        start: event.start,
        end: event.end,
        location: event.location,
        attendees: event.attendees,
        body: event.body,
      }));
    } catch (error) {
      console.error('Failed to get Outlook calendar events:', error);
      throw error;
    }
  }

  /**
   * Create Outlook calendar event
   */
  async createOutlookEvent(
    subject: string,
    startTime: Date,
    endTime: Date,
    location?: string,
    attendees?: string[],
    description?: string
  ): Promise<OutlookEvent> {
    try {
      const event = {
        subject,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        location: location ? { displayName: location } : undefined,
        attendees: attendees ? attendees.map(email => ({
          emailAddress: { address: email },
          type: 'required',
        })) : undefined,
        body: description ? {
          contentType: 'text',
          content: description,
        } : undefined,
      };

      const response = await this.client.api('/me/events').post(event);
      return {
        id: response.id,
        subject: response.subject,
        start: response.start,
        end: response.end,
        location: response.location,
        attendees: response.attendees,
        body: response.body,
      };
    } catch (error) {
      console.error('Failed to create Outlook event:', error);
      throw error;
    }
  }

  // ============================================================================
  // OFFICE ONLINE INTEGRATION
  // ============================================================================

  /**
   * Create Word document in OneDrive
   */
  async createWordDocument(title: string, folderId?: string): Promise<string> {
    try {
      const documentData = {
        name: `${title}.docx`,
        file: {},
      };

      const endpoint = folderId
        ? `/me/drive/items/${folderId}/children`
        : '/me/drive/root/children';

      const response = await this.client.api(endpoint).post(documentData);
      return response.webUrl;
    } catch (error) {
      console.error('Failed to create Word document:', error);
      throw error;
    }
  }

  /**
   * Create Excel spreadsheet in OneDrive
   */
  async createExcelSpreadsheet(title: string, folderId?: string): Promise<string> {
    try {
      const spreadsheetData = {
        name: `${title}.xlsx`,
        file: {},
      };

      const endpoint = folderId
        ? `/me/drive/items/${folderId}/children`
        : '/me/drive/root/children';

      const response = await this.client.api(endpoint).post(spreadsheetData);
      return response.webUrl;
    } catch (error) {
      console.error('Failed to create Excel spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Create PowerPoint presentation in OneDrive
   */
  async createPowerPointPresentation(title: string, folderId?: string): Promise<string> {
    try {
      const presentationData = {
        name: `${title}.pptx`,
        file: {},
      };

      const endpoint = folderId
        ? `/me/drive/items/${folderId}/children`
        : '/me/drive/root/children';

      const response = await this.client.api(endpoint).post(presentationData);
      return response.webUrl;
    } catch (error) {
      console.error('Failed to create PowerPoint presentation:', error);
      throw error;
    }
  }

  // ============================================================================
  // AZORA OS SPECIFIC INTEGRATIONS
  // ============================================================================

  /**
   * Sync Azora user profile with Microsoft 365
   */
  async syncUserProfile(azoraUserData: any): Promise<void> {
    try {
      const profileData = {
        displayName: azoraUserData.displayName,
        givenName: azoraUserData.firstName,
        surname: azoraUserData.lastName,
        mail: azoraUserData.email,
        jobTitle: azoraUserData.jobTitle,
        department: azoraUserData.department,
        officeLocation: azoraUserData.location,
      };

      await this.client.api('/me').patch(profileData);
      console.log('✅ User profile synced with Microsoft 365');
    } catch (error) {
      console.error('Failed to sync user profile:', error);
      throw error;
    }
  }

  /**
   * Create Azora workspace in Teams
   */
  async createAzoraWorkspace(name: string, description: string): Promise<string> {
    try {
      const team = {
        displayName: `Azora - ${name}`,
        description,
        visibility: 'Private',
        memberSettings: {
          allowCreateUpdateChannels: true,
          allowDeleteChannels: true,
          allowAddRemoveApps: true,
          allowCreateUpdateRemoveTabs: true,
          allowCreateUpdateRemoveConnectors: true,
        },
        guestSettings: {
          allowCreateUpdateChannels: false,
          allowDeleteChannels: false,
        },
        funSettings: {
          allowGiphy: true,
          giphyContentRating: 'moderate',
          allowStickersAndMemes: true,
          allowCustomMemes: true,
        },
        messagingSettings: {
          allowUserEditMessages: true,
          allowUserDeleteMessages: true,
          allowOwnerDeleteMessages: true,
          allowTeamMentions: true,
          allowChannelMentions: true,
        },
      };

      const response = await this.client.api('/teams').post(team);
      return response.id;
    } catch (error) {
      console.error('Failed to create Azora workspace:', error);
      throw error;
    }
  }

  /**
   * Setup Azora document library in OneDrive
   */
  async setupAzoraDocumentLibrary(): Promise<string> {
    try {
      const library = await this.createOneDriveFolder('Azora Documents');
      await this.createOneDriveFolder('Education Materials', library.id);
      await this.createOneDriveFolder('Financial Reports', library.id);
      await this.createOneDriveFolder('Project Files', library.id);
      await this.createOneDriveFolder('Shared Resources', library.id);

      return library.id;
    } catch (error) {
      console.error('Failed to setup Azora document library:', error);
      throw error;
    }
  }

  /**
   * Broadcast Azora announcement to all teams
   */
  async broadcastAnnouncement(message: string, teams?: string[]): Promise<void> {
    try {
      const targetTeams = teams || (await this.getUserTeams()).map((team: any) => team.id);

      for (const teamId of targetTeams) {
        const channels = await this.getTeamChannels(teamId);
        const generalChannel = channels.find((ch: TeamsChannel) =>
          ch.displayName.toLowerCase().includes('general')
        );

        if (generalChannel) {
          await this.sendTeamsMessage(teamId, generalChannel.id, `📢 **Azora OS Announcement**\n\n${message}`);
        }
      }

      console.log('✅ Announcement broadcasted to Teams');
    } catch (error) {
      console.error('Failed to broadcast announcement:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<any> {
    return {
      service: 'Microsoft 365 Integration Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      config: {
        tenantId: this.config.tenantId,
        clientId: this.config.clientId,
        scopes: this.config.scopes,
      },
      capabilities: [
        'Teams Chat & Meetings',
        'OneDrive File Storage',
        'SharePoint Sites & Lists',
        'Outlook Email & Calendar',
        'Office Online Documents',
        'Azure AD Integration',
      ]
    };
  }

  /**
   * Cleanup Microsoft 365 resources
   */
  async cleanup(): Promise<void> {
    // Cleanup any temporary resources
    console.log('Microsoft 365 Integration Service cleanup completed');
  }
}

// Export default configuration
export const defaultMicrosoft365Config: Microsoft365Config = {
  tenantId: process.env.MICROSOFT365_TENANT_ID || '',
  clientId: process.env.MICROSOFT365_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT365_CLIENT_SECRET || '',
  scopes: [
    'https://graph.microsoft.com/.default',
    'User.ReadWrite.All',
    'Group.ReadWrite.All',
    'Directory.ReadWrite.All',
    'Mail.ReadWrite',
    'Calendars.ReadWrite',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All',
    'TeamsApp.ReadWrite.All',
    'Channel.ReadWrite.All',
    'Chat.ReadWrite.All',
  ],
};

// Factory function to create Microsoft 365 integration service
export function createMicrosoft365IntegrationService(config?: Partial<Microsoft365Config>): Microsoft365IntegrationService {
  const finalConfig = { ...defaultMicrosoft365Config, ...config };
  return new Microsoft365IntegrationService(finalConfig);
}
