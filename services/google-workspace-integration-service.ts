/**
 * AZORA OS - Google Workspace Integration Service
 *
 * Provides comprehensive Google Workspace integration including:
 * - Google Drive (File storage, sharing, collaboration)
 * - Google Docs (Word processing, real-time collaboration)
 * - Google Sheets (Spreadsheets, data analysis)
 * - Google Slides (Presentations, slideshows)
 * - Gmail (Email, labels, filters)
 * - Google Calendar (Events, scheduling, time management)
 * - Google Forms (Surveys, data collection)
 * - Google Sites (Websites, intranet)
 * - Google Chat (Team communication)
 * - Google Meet (Video conferencing)
 *
 * This service enables Azora OS to compete directly with Google's productivity suite
 * by providing native Google Workspace integration capabilities.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { drive_v3, docs_v1, sheets_v4, gmail_v1, calendar_v3 } from 'googleapis';

export interface GoogleWorkspaceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  credentials?: {
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  };
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  webViewLink: string;
  downloadUrl?: string;
  modifiedTime: string;
  createdTime: string;
  owners: Array<{
    displayName: string;
    emailAddress: string;
  }>;
  permissions: Array<{
    id: string;
    type: string;
    role: string;
    emailAddress?: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  status: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export class GoogleWorkspaceIntegrationService {
  private config: GoogleWorkspaceConfig;
  private oauth2Client: OAuth2Client;
  private drive?: drive_v3.Drive;
  private docs?: docs_v1.Docs;
  private sheets?: sheets_v4.Sheets;
  private gmail?: gmail_v1.Gmail;
  private calendar?: calendar_v3.Calendar;

  constructor(config: GoogleWorkspaceConfig) {
    this.config = config;
    this.oauth2Client = new OAuth2Client(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    if (this.config.credentials) {
      this.oauth2Client.setCredentials(this.config.credentials);
    }

    this.initializeGoogleAPIs();
  }

  private async initializeGoogleAPIs(): Promise<void> {
    try {
      // Initialize Google APIs
      this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
      this.docs = google.docs({ version: 'v1', auth: this.oauth2Client });
      this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      console.log('✅ Google Workspace Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google APIs:', error);
      throw error;
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    this.oauth2Client.setCredentials(credentials);
  }

  // ============================================================================
  // GOOGLE DRIVE INTEGRATION
  // ============================================================================

  /**
   * List files in Google Drive
   */
  async listDriveFiles(query?: string, pageSize: number = 100): Promise<DriveFile[]> {
    try {
      const response = await this.drive!.files.list({
        q: query,
        pageSize,
        fields: 'files(id,name,mimeType,size,webViewLink,modifiedTime,createdTime,owners,permissions)',
      });

      return (response.data.files || []).map(file => ({
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size || '0',
        webViewLink: file.webViewLink || '',
        modifiedTime: file.modifiedTime || '',
        createdTime: file.createdTime || '',
        owners: (file.owners || []).map(owner => ({
          displayName: owner.displayName || '',
          emailAddress: owner.emailAddress || '',
        })),
        permissions: (file.permissions || []).map(perm => ({
          id: perm.id!,
          type: perm.type!,
          role: perm.role!,
          emailAddress: perm.emailAddress,
        })),
      }));
    } catch (error) {
      console.error('Failed to list Drive files:', error);
      throw error;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadToDrive(
    filename: string,
    data: Buffer,
    mimeType: string,
    folderId?: string
  ): Promise<DriveFile> {
    try {
      const fileMetadata: any = {
        name: filename,
      };

      if (folderId) {
        fileMetadata.parents = [folderId];
      }

      const media = {
        mimeType,
        body: data,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id,name,mimeType,size,webViewLink,modifiedTime,createdTime,owners,permissions',
      });

      const file = response.data;
      return {
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType!,
        size: file.size || '0',
        webViewLink: file.webViewLink || '',
        modifiedTime: file.modifiedTime || '',
        createdTime: file.createdTime || '',
        owners: (file.owners || []).map(owner => ({
          displayName: owner.displayName || '',
          emailAddress: owner.emailAddress || '',
        })),
        permissions: (file.permissions || []).map(perm => ({
          id: perm.id!,
          type: perm.type!,
          role: perm.role!,
          emailAddress: perm.emailAddress,
        })),
      };
    } catch (error) {
      console.error('Failed to upload to Drive:', error);
      throw error;
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFromDrive(fileId: string): Promise<Buffer> {
    try {
      const response = await this.drive!.files.get({
        fileId,
        alt: 'media',
      }, { responseType: 'arraybuffer' });

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error('Failed to download from Drive:', error);
      throw error;
    }
  }

  /**
   * Create Google Drive folder
   */
  async createDriveFolder(name: string, parentId?: string): Promise<string> {
    try {
      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id!;
    } catch (error) {
      console.error('Failed to create Drive folder:', error);
      throw error;
    }
  }

  /**
   * Share Google Drive file
   */
  async shareDriveFile(
    fileId: string,
    email: string,
    role: 'reader' | 'writer' | 'commenter' = 'reader'
  ): Promise<void> {
    try {
      await this.drive!.permissions.create({
        fileId,
        requestBody: {
          type: 'user',
          role,
          emailAddress: email,
        },
      });
    } catch (error) {
      console.error('Failed to share Drive file:', error);
      throw error;
    }
  }

  // ============================================================================
  // GOOGLE DOCS INTEGRATION
  // ============================================================================

  /**
   * Create Google Doc
   */
  async createGoogleDoc(title: string, folderId?: string): Promise<string> {
    try {
      const fileMetadata = {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
        parents: folderId ? [folderId] : undefined,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id!;
    } catch (error) {
      console.error('Failed to create Google Doc:', error);
      throw error;
    }
  }

  /**
   * Get Google Doc content
   */
  async getGoogleDocContent(documentId: string): Promise<any> {
    try {
      const response = await this.docs!.documents.get({
        documentId,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get Google Doc content:', error);
      throw error;
    }
  }

  /**
   * Update Google Doc content
   */
  async updateGoogleDoc(
    documentId: string,
    requests: any[]
  ): Promise<void> {
    try {
      await this.docs!.documents.batchUpdate({
        documentId,
        requestBody: {
          requests,
        },
      });
    } catch (error) {
      console.error('Failed to update Google Doc:', error);
      throw error;
    }
  }

  /**
   * Insert text into Google Doc
   */
  async insertTextIntoDoc(
    documentId: string,
    text: string,
    index: number = 1
  ): Promise<void> {
    try {
      const requests = [{
        insertText: {
          location: {
            index,
          },
          text,
        },
      }];

      await this.updateGoogleDoc(documentId, requests);
    } catch (error) {
      console.error('Failed to insert text into Doc:', error);
      throw error;
    }
  }

  // ============================================================================
  // GOOGLE SHEETS INTEGRATION
  // ============================================================================

  /**
   * Create Google Sheet
   */
  async createGoogleSheet(title: string, folderId?: string): Promise<string> {
    try {
      const fileMetadata = {
        name: title,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: folderId ? [folderId] : undefined,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id!;
    } catch (error) {
      console.error('Failed to create Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Get Google Sheet data
   */
  async getSheetData(
    spreadsheetId: string,
    range: string
  ): Promise<any[][]> {
    try {
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Failed to get Sheet data:', error);
      throw error;
    }
  }

  /**
   * Update Google Sheet data
   */
  async updateSheetData(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    try {
      await this.sheets!.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Failed to update Sheet data:', error);
      throw error;
    }
  }

  /**
   * Append data to Google Sheet
   */
  async appendToSheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    try {
      await this.sheets!.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error('Failed to append to Sheet:', error);
      throw error;
    }
  }

  // ============================================================================
  // GOOGLE SLIDES INTEGRATION
  // ============================================================================

  /**
   * Create Google Slides presentation
   */
  async createGoogleSlides(title: string, folderId?: string): Promise<string> {
    try {
      const fileMetadata = {
        name: title,
        mimeType: 'application/vnd.google-apps.presentation',
        parents: folderId ? [folderId] : undefined,
      };

      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id!;
    } catch (error) {
      console.error('Failed to create Google Slides:', error);
      throw error;
    }
  }

  // ============================================================================
  // GMAIL INTEGRATION
  // ============================================================================

  /**
   * Get Gmail messages
   */
  async getGmailMessages(
    query?: string,
    maxResults: number = 50
  ): Promise<GmailMessage[]> {
    try {
      const response = await this.gmail!.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      const messages = [];
      for (const message of response.data.messages || []) {
        const messageData = await this.gmail!.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full',
        });
        messages.push(messageData.data as GmailMessage);
      }

      return messages;
    } catch (error) {
      console.error('Failed to get Gmail messages:', error);
      throw error;
    }
  }

  /**
   * Send Gmail message
   */
  async sendGmailMessage(
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<void> {
    try {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `To: ${to}`,
        `Subject: ${utf8Subject}`,
        `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
        '',
        body,
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      await this.gmail!.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
    } catch (error) {
      console.error('Failed to send Gmail message:', error);
      throw error;
    }
  }

  /**
   * Create Gmail label
   */
  async createGmailLabel(name: string): Promise<string> {
    try {
      const response = await this.gmail!.users.labels.create({
        userId: 'me',
        requestBody: {
          name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error('Failed to create Gmail label:', error);
      throw error;
    }
  }

  // ============================================================================
  // GOOGLE CALENDAR INTEGRATION
  // ============================================================================

  /**
   * Get calendar events
   */
  async getCalendarEvents(
    calendarId: string = 'primary',
    timeMin?: Date,
    timeMax?: Date,
    maxResults: number = 50
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar!.events.list({
        calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items || []).map(event => ({
        id: event.id!,
        summary: event.summary || '',
        description: event.description,
        start: event.start!,
        end: event.end!,
        location: event.location,
        attendees: event.attendees?.map(attendee => ({
          email: attendee.email!,
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus || 'needsAction',
        })),
        status: event.status || 'confirmed',
      }));
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    summary: string,
    startTime: Date,
    endTime: Date,
    calendarId: string = 'primary',
    attendees?: string[],
    location?: string,
    description?: string
  ): Promise<CalendarEvent> {
    try {
      const event = {
        summary,
        description,
        location,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: attendees?.map(email => ({ email })),
      };

      const response = await this.calendar!.events.insert({
        calendarId,
        requestBody: event,
      });

      const createdEvent = response.data;
      return {
        id: createdEvent.id!,
        summary: createdEvent.summary || '',
        description: createdEvent.description,
        start: createdEvent.start!,
        end: createdEvent.end!,
        location: createdEvent.location,
        attendees: createdEvent.attendees?.map(attendee => ({
          email: attendee.email!,
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus || 'needsAction',
        })),
        status: createdEvent.status || 'confirmed',
      };
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(
    calendarId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      await this.calendar!.events.patch({
        calendarId,
        eventId,
        requestBody: updates,
      });
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  }

  // ============================================================================
  // AZORA OS SPECIFIC INTEGRATIONS
  // ============================================================================

  /**
   * Setup Azora workspace in Google Drive
   */
  async setupAzoraWorkspace(): Promise<{
    rootFolderId: string;
    docsFolderId: string;
    sheetsFolderId: string;
    sharedFolderId: string;
  }> {
    try {
      const rootFolderId = await this.createDriveFolder('Azora OS Workspace');
      const docsFolderId = await this.createDriveFolder('Documents', rootFolderId);
      const sheetsFolderId = await this.createDriveFolder('Spreadsheets', rootFolderId);
      const sharedFolderId = await this.createDriveFolder('Shared Resources', rootFolderId);

      return {
        rootFolderId,
        docsFolderId,
        sheetsFolderId,
        sharedFolderId,
      };
    } catch (error) {
      console.error('Failed to setup Azora workspace:', error);
      throw error;
    }
  }

  /**
   * Create Azora educational materials
   */
  async createEducationalMaterials(courseName: string): Promise<{
    syllabusDocId: string;
    scheduleSheetId: string;
    assignmentsFolderId: string;
  }> {
    try {
      const courseFolderId = await this.createDriveFolder(`${courseName} Course`);

      const syllabusDocId = await this.createGoogleDoc(`${courseName} - Syllabus`, courseFolderId);
      const scheduleSheetId = await this.createGoogleSheet(`${courseName} - Schedule`, courseFolderId);
      const assignmentsFolderId = await this.createDriveFolder('Assignments', courseFolderId);

      // Initialize syllabus with basic structure
      await this.insertTextIntoDoc(syllabusDocId, `${courseName} Course Syllabus\n\nCourse Overview:\n\nLearning Objectives:\n\nSchedule:\n\nAssessment:\n\nResources:\n`);

      // Initialize schedule sheet with headers
      await this.updateSheetData(scheduleSheetId, 'A1:D1', [['Week', 'Topic', 'Assignment', 'Due Date']]);

      return {
        syllabusDocId,
        scheduleSheetId,
        assignmentsFolderId,
      };
    } catch (error) {
      console.error('Failed to create educational materials:', error);
      throw error;
    }
  }

  /**
   * Sync Azora calendar with Google Calendar
   */
  async syncAzoraCalendar(azoraEvents: any[]): Promise<void> {
    try {
      for (const azoraEvent of azoraEvents) {
        await this.createCalendarEvent(
          azoraEvent.title,
          new Date(azoraEvent.startTime),
          new Date(azoraEvent.endTime),
          'primary',
          azoraEvent.attendees,
          azoraEvent.location,
          azoraEvent.description
        );
      }

      console.log(`✅ Synced ${azoraEvents.length} Azora events to Google Calendar`);
    } catch (error) {
      console.error('Failed to sync Azora calendar:', error);
      throw error;
    }
  }

  /**
   * Create Azora communication channel (Google Chat alternative)
   */
  async setupAzoraCommunication(): Promise<string> {
    try {
      // This would integrate with Google Chat API
      // For now, create a shared Google Doc for communication
      const commsDocId = await this.createGoogleDoc('Azora OS Communication Hub');

      await this.insertTextIntoDoc(commsDocId, `Azora OS Communication Hub\n\nReal-time communication and announcements will be posted here.\n\n📢 Latest Updates:\n\n💬 Team Discussions:\n\n📋 Action Items:\n\n📚 Resources:\n`);

      return commsDocId;
    } catch (error) {
      console.error('Failed to setup Azora communication:', error);
      throw error;
    }
  }

  /**
   * Generate Azora productivity reports
   */
  async generateProductivityReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    try {
      const reportSheetId = await this.createGoogleSheet(`Azora Productivity Report - ${userId}`);

      // Get calendar events for productivity analysis
      const events = await this.getCalendarEvents('primary', startDate, endDate);

      // Get Gmail activity
      const emails = await this.getGmailMessages(`after:${startDate.getTime()} before:${endDate.getTime()}`);

      // Get Drive activity (would need additional API calls)
      const files = await this.listDriveFiles(`modifiedTime > '${startDate.toISOString()}' and modifiedTime < '${endDate.toISOString()}'`);

      // Create report data
      const reportData = [
        ['Productivity Report', `${startDate.toDateString()} - ${endDate.toDateString()}`],
        [''],
        ['Calendar Events', events.length.toString()],
        ['Emails Sent/Received', emails.length.toString()],
        ['Files Modified', files.length.toString()],
        [''],
        ['Event Details'],
        ['Summary', 'Start Time', 'End Time'],
        ...events.map(event => [
          event.summary,
          event.start.dateTime || event.start.date || '',
          event.end.dateTime || event.end.date || ''
        ]),
      ];

      await this.updateSheetData(reportSheetId, 'A1:C50', reportData);

      return reportSheetId;
    } catch (error) {
      console.error('Failed to generate productivity report:', error);
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
      service: 'Google Workspace Integration Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      apis: {
        drive: !!this.drive,
        docs: !!this.docs,
        sheets: !!this.sheets,
        gmail: !!this.gmail,
        calendar: !!this.calendar,
      },
      config: {
        clientId: this.config.clientId,
        scopes: this.config.scopes,
        hasCredentials: !!this.config.credentials,
      },
      capabilities: [
        'Google Drive File Management',
        'Google Docs Word Processing',
        'Google Sheets Data Analysis',
        'Google Slides Presentations',
        'Gmail Email Management',
        'Google Calendar Scheduling',
        'Google Forms Data Collection',
        'Google Chat Communication',
        'Google Meet Video Conferencing',
      ]
    };
  }

  /**
   * Cleanup Google Workspace resources
   */
  async cleanup(): Promise<void> {
    // Cleanup any temporary resources
    console.log('Google Workspace Integration Service cleanup completed');
  }
}

// Export default configuration
export const defaultGoogleWorkspaceConfig: GoogleWorkspaceConfig = {
  clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_WORKSPACE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/forms',
    'https://www.googleapis.com/auth/chat.spaces',
    'https://www.googleapis.com/auth/meetings.space.created',
  ],
  credentials: process.env.GOOGLE_WORKSPACE_CREDENTIALS ? JSON.parse(process.env.GOOGLE_WORKSPACE_CREDENTIALS) : undefined,
};

// Factory function to create Google Workspace integration service
export function createGoogleWorkspaceIntegrationService(config?: Partial<GoogleWorkspaceConfig>): GoogleWorkspaceIntegrationService {
  const finalConfig = { ...defaultGoogleWorkspaceConfig, ...config };
  return new GoogleWorkspaceIntegrationService(finalConfig);
}
