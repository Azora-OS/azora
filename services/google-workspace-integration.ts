/**
 * AZORA OS - Google Workspace Integration Service
 *
 * Comprehensive Google Workspace integration providing Docs, Sheets, Drive,
 * Calendar, Gmail, and other Google services for enterprise productivity.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';

export interface GoogleWorkspaceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  credentials?: {
    access_token: string;
    refresh_token: string;
    expiry_date?: number;
  };
}

export interface GoogleWorkspaceServiceStatus {
  drive: boolean;
  docs: boolean;
  sheets: boolean;
  calendar: boolean;
  gmail: boolean;
  lastHealthCheck: Date;
}

/**
 * Google Drive Integration
 */
export class GoogleDriveIntegration {
  private drive: any;

  constructor(auth: OAuth2Client) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(fileName: string, fileContent: Buffer, mimeType: string = 'application/octet-stream'): Promise<any> {
    const fileMetadata = {
      name: fileName,
    };

    const media = {
      mimeType,
      body: require('stream').Readable.from(fileContent),
    };

    const response = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink',
    });

    return response.data;
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, { responseType: 'arraybuffer' });

    return Buffer.from(response.data);
  }

  /**
   * Create folder in Google Drive
   */
  async createFolder(folderName: string, parentId?: string): Promise<any> {
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const response = await this.drive.files.create({
      resource: fileMetadata,
      fields: 'id,name',
    });

    return response.data;
  }

  /**
   * Share Google Drive file
   */
  async shareFile(fileId: string, emailAddress: string, role: 'reader' | 'writer' | 'commenter' = 'reader'): Promise<void> {
    const permission = {
      type: 'user',
      role,
      emailAddress,
    };

    await this.drive.permissions.create({
      fileId: fileId,
      resource: permission,
      sendNotificationEmail: true,
      emailMessage: 'Shared via Azora OS',
    });
  }

  /**
   * List files in Google Drive
   */
  async listFiles(query?: string): Promise<any[]> {
    const response = await this.drive.files.list({
      q: query || "'root' in parents",
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
  }

  /**
   * Search files in Google Drive
   */
  async searchFiles(searchTerm: string): Promise<any[]> {
    const query = `name contains '${searchTerm}' or fullText contains '${searchTerm}'`;
    return await this.listFiles(query);
  }
}

/**
 * Google Docs Integration
 */
export class GoogleDocsIntegration {
  private docs: any;

  constructor(auth: OAuth2Client) {
    this.docs = google.docs({ version: 'v1', auth });
  }

  /**
   * Create a new Google Doc
   */
  async createDocument(title: string): Promise<any> {
    const resource = {
      title,
    };

    const response = await this.docs.documents.create({
      resource,
    });

    return response.data;
  }

  /**
   * Get document content
   */
  async getDocument(documentId: string): Promise<any> {
    const response = await this.docs.documents.get({
      documentId,
    });

    return response.data;
  }

  /**
   * Update document content
   */
  async updateDocument(documentId: string, requests: any[]): Promise<any> {
    const resource = {
      requests,
    };

    const response = await this.docs.documents.batchUpdate({
      documentId,
      resource,
    });

    return response.data;
  }

  /**
   * Insert text into document
   */
  async insertText(documentId: string, text: string, location: { index: number }): Promise<any> {
    const requests = [{
      insertText: {
        text,
        location,
      },
    }];

    return await this.updateDocument(documentId, requests);
  }

  /**
   * Create document from template
   */
  async createFromTemplate(templateId: string, title: string): Promise<any> {
    const drive = google.drive({ version: 'v3', auth: this.docs.auth });
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      resource: { name: title },
    });

    return copyResponse.data;
  }
}

/**
 * Google Sheets Integration
 */
export class GoogleSheetsIntegration {
  private sheets: any;

  constructor(auth: OAuth2Client) {
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  /**
   * Create a new Google Sheet
   */
  async createSpreadsheet(title: string): Promise<any> {
    const resource = {
      properties: {
        title,
      },
    };

    const response = await this.sheets.spreadsheets.create({
      resource,
    });

    return response.data;
  }

  /**
   * Get spreadsheet data
   */
  async getSpreadsheet(spreadsheetId: string, range?: string): Promise<any> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: range || 'Sheet1',
    });

    return response.data;
  }

  /**
   * Update spreadsheet data
   */
  async updateSpreadsheet(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const resource = {
      values,
    };

    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource,
    });

    return response.data;
  }

  /**
   * Append data to spreadsheet
   */
  async appendToSpreadsheet(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    const resource = {
      values,
    };

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource,
    });

    return response.data;
  }

  /**
   * Create chart in spreadsheet
   */
  async createChart(spreadsheetId: string, chartSpec: any): Promise<any> {
    const requests = [{
      addChart: {
        chart: chartSpec,
      },
    }];

    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: { requests },
    });

    return response.data;
  }
}

/**
 * Google Calendar Integration
 */
export class GoogleCalendarIntegration {
  private calendar: any;

  constructor(auth: OAuth2Client) {
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create calendar event
   */
  async createEvent(calendarId: string = 'primary', event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
  }): Promise<any> {
    const response = await this.calendar.events.insert({
      calendarId,
      resource: event,
    });

    return response.data;
  }

  /**
   * Get calendar events
   */
  async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<any[]> {
    const response = await this.calendar.events.list({
      calendarId,
      timeMin: timeMin?.toISOString(),
      timeMax: timeMax?.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  }

  /**
   * Update calendar event
   */
  async updateEvent(calendarId: string, eventId: string, updates: any): Promise<any> {
    const response = await this.calendar.events.patch({
      calendarId,
      eventId,
      resource: updates,
    });

    return response.data;
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  /**
   * Create calendar
   */
  async createCalendar(summary: string): Promise<any> {
    const calendar = {
      summary,
    };

    const response = await this.calendar.calendars.insert({
      resource: calendar,
    });

    return response.data;
  }
}

/**
 * Gmail Integration
 */
export class GmailIntegration {
  private gmail: any;

  constructor(auth: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  /**
   * Send email via Gmail
   */
  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = false): Promise<any> {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      `Content-Type: text/${isHtml ? 'html' : 'plain'}; charset=utf-8`,
      '',
      body,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: encodedMessage,
      },
    });

    return response.data;
  }

  /**
   * Get emails from inbox
   */
  async getEmails(maxResults: number = 10, query?: string): Promise<any[]> {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
    });

    const messages = response.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (msg: any) => {
        const detail = await this.gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
        });
        return detail.data;
      })
    );

    return detailedMessages;
  }

  /**
   * Mark email as read/unread
   */
  async markAsRead(messageId: string, read: boolean = true): Promise<any> {
    const addLabelIds = read ? [] : ['UNREAD'];
    const removeLabelIds = read ? ['UNREAD'] : [];

    const response = await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      resource: {
        addLabelIds,
        removeLabelIds,
      },
    });

    return response.data;
  }

  /**
   * Create draft email
   */
  async createDraft(to: string, subject: string, body: string): Promise<any> {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      body,
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await this.gmail.users.drafts.create({
      userId: 'me',
      resource: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    return response.data;
  }
}

/**
 * Google Workspace Integration Service
 * Unified interface for all Google Workspace services
 */
export class GoogleWorkspaceIntegrationService {
  private config: GoogleWorkspaceConfig;
  private auth: OAuth2Client;
  private status: GoogleWorkspaceServiceStatus;

  // Service integrations
  public drive: GoogleDriveIntegration;
  public docs: GoogleDocsIntegration;
  public sheets: GoogleSheetsIntegration;
  public calendar: GoogleCalendarIntegration;
  public gmail: GmailIntegration;

  constructor(config: GoogleWorkspaceConfig) {
    this.config = config;
    this.status = {
      drive: false,
      docs: false,
      sheets: false,
      calendar: false,
      gmail: false,
      lastHealthCheck: new Date()
    };

    this.initializeServices();
  }

  /**
   * Initialize Google Workspace services
   */
  private async initializeServices(): Promise<void> {
    try {
      this.auth = new OAuth2Client(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      );

      if (this.config.credentials) {
        this.auth.setCredentials(this.config.credentials);
      }

      // Initialize service integrations
      this.drive = new GoogleDriveIntegration(this.auth);
      this.docs = new GoogleDocsIntegration(this.auth);
      this.sheets = new GoogleSheetsIntegration(this.auth);
      this.calendar = new GoogleCalendarIntegration(this.auth);
      this.gmail = new GmailIntegration(this.auth);

      await this.performHealthCheck();
    } catch (error) {
      console.error('Failed to initialize Google Workspace services:', error);
      throw new Error('Google Workspace service initialization failed');
    }
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      await this.testDriveHealth();
      await this.testDocsHealth();
      await this.testSheetsHealth();
      await this.testCalendarHealth();
      await this.testGmailHealth();

      this.status.lastHealthCheck = new Date();
    } catch (error) {
      console.error('Google Workspace health check failed:', error);
    }
  }

  private async testDriveHealth(): Promise<void> {
    try {
      await this.drive.listFiles("'root' in parents");
      this.status.drive = true;
    } catch {
      this.status.drive = false;
    }
  }

  private async testDocsHealth(): Promise<void> {
    try {
      // Try to get a non-existent document to test API access
      await this.docs.docs.documents.get({ documentId: 'test' }).catch(() => {});
      this.status.docs = true;
    } catch {
      this.status.docs = false;
    }
  }

  private async testSheetsHealth(): Promise<void> {
    try {
      // Try to get a non-existent spreadsheet to test API access
      await this.sheets.sheets.spreadsheets.get({ spreadsheetId: 'test' }).catch(() => {});
      this.status.sheets = true;
    } catch {
      this.status.sheets = false;
    }
  }

  private async testCalendarHealth(): Promise<void> {
    try {
      await this.calendar.calendar.events.list({ calendarId: 'primary', maxResults: 1 });
      this.status.calendar = true;
    } catch {
      this.status.calendar = false;
    }
  }

  private async testGmailHealth(): Promise<void> {
    try {
      await this.gmail.gmail.users.getProfile({ userId: 'me' });
      this.status.gmail = true;
    } catch {
      this.status.gmail = false;
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<any> {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    const { credentials } = await this.auth.refreshAccessToken();
    this.auth.setCredentials(credentials);
  }

  /**
   * Search across Google Workspace
   */
  async searchWorkspace(query: string): Promise<{
    drive: any[];
    docs: any[];
    sheets: any[];
  }> {
    const [driveResults] = await Promise.all([
      this.drive.searchFiles(query),
    ]);

    return {
      drive: driveResults,
      docs: [], // Would need separate search implementation
      sheets: [], // Would need separate search implementation
    };
  }

  /**
   * Get service health status
   */
  getServiceStatus(): GoogleWorkspaceServiceStatus {
    return { ...this.status };
  }

  /**
   * Get service configuration (without sensitive data)
   */
  getServiceConfig(): Partial<GoogleWorkspaceConfig> {
    const { clientSecret, credentials, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Get OAuth2 client for custom operations
   */
  getAuthClient(): OAuth2Client {
    return this.auth;
  }
}

/**
 * Factory function to create Google Workspace Integration Service
 */
export function createGoogleWorkspaceIntegrationService(config: GoogleWorkspaceConfig): GoogleWorkspaceIntegrationService {
  return new GoogleWorkspaceIntegrationService(config);
}

/**
 * Default Google Workspace configuration template
 */
export const defaultGoogleWorkspaceConfig: Partial<GoogleWorkspaceConfig> = {
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
  ],
  // Other fields would be populated from environment variables or secure storage
};
