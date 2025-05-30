import { google } from 'googleapis';
import { EmailService, EmailOptions } from './EmailInterface';

export class GoogleWorkspaceEmailService implements EmailService {
  private gmail;
  private auth;

  constructor() {
    // Initialize with service account credentials
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose'
      ],
      // Impersonate a Google Workspace user with send permissions
      subject: process.env.GWS_SENDER_EMAIL || 'noreply@thelawshop.com'
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const message = this.createMessage(options);
      
      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message
        }
      });

      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email via Google Workspace:', error);
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  private createMessage(options: EmailOptions): string {
    const boundary = '----=_Part_0_1234567890.123456789';
    
    const messageParts = [
      `From: ${options.from || process.env.GWS_SENDER_EMAIL || 'noreply@thelawshop.com'}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.text || this.htmlToText(options.html || ''),
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      options.html || options.text || '',
      '',
      `--${boundary}--`
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return encodedMessage;
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  async sendBulkEmails(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void> {
    // Google Workspace has good rate limits, but still batch for safety
    const batchSize = 50;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(
        batch.map(to => this.sendEmail({ ...options, to }))
      );
      
      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}