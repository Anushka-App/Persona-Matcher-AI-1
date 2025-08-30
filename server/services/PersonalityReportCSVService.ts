import fs from 'fs';
import path from 'path';

export interface PersonalityReportData {
  user_id: string;
  personality_type: string;
  sentiment: string;
  explanation: string;
  report_data: string; // JSON stringified data
  timestamp: string;
  circle_member: boolean;
  email?: string;
  name?: string;
  phone?: string;
  session_id?: string;
  confidence_score?: number;
  style_preferences?: string[]; // Will be JSON stringified
  lifestyle_insights?: string;
  bag_personality?: string;
  markdown_report?: string;
  // New field for complete personality report
  personality_report: string;
  // User details and cookie management
  user_cookie_id: string;
  is_new_user: boolean;
  first_visit_date: string;
  last_visit_date: string;
  visit_count: number;
  user_agent?: string;
  ip_address?: string;
  user_location?: string;
}

export interface CompletePersonalityReport {
  personality: string;
  sentiment: string;
  explanation: string;
  confidenceScore?: number;
  stylePreferences?: string[];
  lifestyleInsights?: string;
  totalQuestionsAnswered?: number;
  sessionDuration?: number;
  artworkInsights?: Record<string, unknown>;
  markdownReport?: string;
  bagPersonality?: string;
  extractedPersonalityName?: string;
  extractedStyleStatement?: string;
  extractedStyleProfile?: string;
  recommendations?: Array<Record<string, unknown>>;
  timestamp: string;
  userInfo?: {
    email?: string;
    name?: string;
    phone?: string;
    session_id?: string;
    circle_member?: boolean;
    // User tracking and cookie management
    userCookieId?: string;
    isNewUser?: boolean;
    firstVisitDate?: string;
    lastVisitDate?: string;
    visitCount?: number;
    userAgent?: string;
    ipAddress?: string;
    userLocation?: string;
  };
}

export class PersonalityReportCSVService {
  private csvPath: string;
  private csvHeaders: string[];

  constructor() {
    this.csvPath = path.join(process.cwd(), 'personality_reports.csv');
    this.csvHeaders = [
      'user_id',
      'personality_type', 
      'sentiment',
      'explanation',
      'report_data',
      'timestamp',
      'circle_member',
      'email',
      'name',
      'phone',
      'session_id',
      'confidence_score',
      'style_preferences',
      'lifestyle_insights',
      'bag_personality',
      'markdown_report',
      'personality_report', // New complete report column
      // User tracking and cookie management columns
      'user_cookie_id',
      'is_new_user',
      'first_visit_date',
      'last_visit_date',
      'visit_count',
      'user_agent',
      'ip_address',
      'user_location'
    ];
    
    this.initializeCSV();
  }

  private initializeCSV(): void {
    try {
      if (!fs.existsSync(this.csvPath)) {
        // Create CSV with headers
        const headerRow = this.csvHeaders.join(',') + '\n';
        fs.writeFileSync(this.csvPath, headerRow, 'utf8');
        console.log('✅ Created personality_reports.csv with headers');
      }
    } catch (error) {
      console.error('❌ Error initializing personality reports CSV:', error);
    }
  }

  private escapeCSVValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    let stringValue = String(value);
    
    // Replace line breaks with spaces to avoid CSV parsing issues
    stringValue = stringValue.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
    
    // If the value contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
  }

  private generateCompletePersonalityReport(data: CompletePersonalityReport): string {
    try {
      const report = {
        // Core personality data
        personalityType: data.personality,
        sentiment: data.sentiment,
        explanation: data.explanation,
        
        // Analysis metrics
        confidenceScore: data.confidenceScore,
        totalQuestionsAnswered: data.totalQuestionsAnswered,
        sessionDuration: data.sessionDuration,
        
        // Style and preferences
        stylePreferences: data.stylePreferences,
        lifestyleInsights: data.lifestyleInsights,
        bagPersonality: data.bagPersonality,
        
        // Extracted insights
        extractedPersonalityName: data.extractedPersonalityName,
        extractedStyleStatement: data.extractedStyleStatement,
        extractedStyleProfile: data.extractedStyleProfile,
        
        // Full markdown report
        markdownReport: data.markdownReport,
        
        // Artwork insights
        artworkInsights: data.artworkInsights,
        
        // Recommendations
        recommendations: data.recommendations,
        
        // User tracking and cookie data
        userCookieId: data.userInfo?.userCookieId,
        isNewUser: data.userInfo?.isNewUser,
        firstVisitDate: data.userInfo?.firstVisitDate,
        lastVisitDate: data.userInfo?.lastVisitDate,
        visitCount: data.userInfo?.visitCount,
        userAgent: data.userInfo?.userAgent,
        ipAddress: data.userInfo?.ipAddress,
        userLocation: data.userInfo?.userLocation,
        
        // Metadata
        timestamp: data.timestamp,
        userInfo: data.userInfo
      };
      
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('❌ Error generating complete personality report:', error);
      return JSON.stringify({ error: 'Failed to generate complete report' });
    }
  }

  async savePersonalityReport(data: CompletePersonalityReport): Promise<void> {
    try {
      // Generate unique user ID if not provided
      const userId = data.userInfo?.session_id || this.generateUserId();
      
      // Generate complete personality report
      const completeReport = this.generateCompletePersonalityReport(data);
      
      // Prepare CSV row data
      const rowData: (string | number | boolean)[] = [
        userId,
        data.personality,
        data.sentiment,
        data.explanation,
        JSON.stringify({
          confidenceScore: data.confidenceScore,
          totalQuestionsAnswered: data.totalQuestionsAnswered,
          sessionDuration: data.sessionDuration,
          artworkInsights: data.artworkInsights
        }),
        data.timestamp,
        data.userInfo?.circle_member || false,
        data.userInfo?.email || '',
        data.userInfo?.name || '',
        data.userInfo?.phone || '',
        data.userInfo?.session_id || '',
        data.confidenceScore || 0,
        JSON.stringify(data.stylePreferences || []),
        data.lifestyleInsights || '',
        data.bagPersonality || '',
        data.markdownReport || '',
        completeReport, // Complete personality report in new column
        // User tracking and cookie data
        data.userInfo?.userCookieId || '',
        data.userInfo?.isNewUser || false,
        data.userInfo?.firstVisitDate || data.timestamp,
        data.userInfo?.lastVisitDate || data.timestamp,
        data.userInfo?.visitCount || 1,
        data.userInfo?.userAgent || '',
        data.userInfo?.ipAddress || '',
        data.userInfo?.userLocation || ''
      ];

      // Convert to CSV row
      const csvRow = rowData.map(value => this.escapeCSVValue(value)).join(',') + '\n';
      
      // Append to CSV file
      fs.appendFileSync(this.csvPath, csvRow, 'utf8');
      
      console.log('✅ Personality report saved to CSV successfully');
      console.log(`📄 Report for personality: ${data.personality}`);
      console.log(`📊 Complete report length: ${completeReport.length} characters`);
      
    } catch (error) {
      console.error('❌ Error saving personality report to CSV:', error);
      throw error;
    }
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getReports(): Promise<PersonalityReportData[]> {
    try {
      if (!fs.existsSync(this.csvPath)) {
        return [];
      }

      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        return []; // Only headers or empty
      }

      const reports: PersonalityReportData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVRow(lines[i]);
          if (values.length >= this.csvHeaders.length) {
            const report: PersonalityReportData = {
              user_id: values[0],
              personality_type: values[1],
              sentiment: values[2],
              explanation: values[3],
              report_data: values[4],
              timestamp: values[5],
              circle_member: values[6] === 'true',
              email: values[7] || undefined,
              name: values[8] || undefined,
              phone: values[9] || undefined,
              session_id: values[10] || undefined,
              confidence_score: values[11] ? parseFloat(values[11]) : undefined,
              style_preferences: values[12] ? JSON.parse(values[12]) : [],
              lifestyle_insights: values[13] || undefined,
              bag_personality: values[14] || undefined,
              markdown_report: values[15] || undefined,
              personality_report: values[16] || '', // Complete personality report
              // User tracking and cookie data
              user_cookie_id: values[17] || '',
              is_new_user: values[18] === 'true',
              first_visit_date: values[19] || '',
              last_visit_date: values[20] || '',
              visit_count: values[21] ? parseInt(values[21]) : 1,
              user_agent: values[22] || undefined,
              ip_address: values[23] || undefined,
              user_location: values[24] || undefined
            };
            reports.push(report);
          }
        } catch (parseError) {
          console.error('❌ Error parsing CSV row:', parseError);
        }
      }

      return reports;
    } catch (error) {
      console.error('❌ Error reading personality reports:', error);
      return [];
    }
  }

  private parseCSVRow(row: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          currentValue += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of value
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    return values;
  }

  async getReportByUserId(userId: string): Promise<PersonalityReportData | null> {
    const reports = await this.getReports();
    return reports.find(report => report.user_id === userId) || null;
  }

  async getReportsByPersonalityType(personalityType: string): Promise<PersonalityReportData[]> {
    const reports = await this.getReports();
    return reports.filter(report => report.personality_type === personalityType);
  }

  // User cookie management methods
  async getUserByCookieId(cookieId: string): Promise<PersonalityReportData | null> {
    const reports = await this.getReports();
    return reports.find(report => report.user_cookie_id === cookieId) || null;
  }

  async updateUserVisitInfo(cookieId: string, isNewVisit: boolean = false): Promise<void> {
    try {
      if (!fs.existsSync(this.csvPath)) {
        return;
      }

      const csvContent = fs.readFileSync(this.csvPath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length <= 1) {
        return; // Only headers or empty
      }

      const updatedLines = [lines[0]]; // Keep header
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVRow(lines[i]);
          if (values.length >= this.csvHeaders.length && values[17] === cookieId) {
            // Update visit information for this user
            const currentVisitCount = values[21] ? parseInt(values[21]) : 1;
            const newVisitCount = isNewVisit ? currentVisitCount + 1 : currentVisitCount;
            const currentTime = new Date().toISOString();
            
            // Update last visit date and visit count
            values[20] = currentTime; // last_visit_date
            values[21] = newVisitCount.toString(); // visit_count
            
            // If this is a new visit, update first visit date
            if (isNewVisit && !values[19]) {
              values[19] = currentTime; // first_visit_date
            }
            
            // Reconstruct the CSV line
            const updatedLine = values.map(value => this.escapeCSVValue(value)).join(',');
            updatedLines.push(updatedLine);
          } else {
            updatedLines.push(lines[i]); // Keep original line
          }
        } catch (parseError) {
          console.error('❌ Error parsing CSV row during update:', parseError);
          updatedLines.push(lines[i]); // Keep original line on error
        }
      }

      // Write updated content back to file
      fs.writeFileSync(this.csvPath, updatedLines.join('\n') + '\n', 'utf8');
      
      if (isNewVisit) {
        console.log(`✅ Updated visit info for user with cookie ID: ${cookieId}`);
      }
    } catch (error) {
      console.error('❌ Error updating user visit info:', error);
    }
  }

  async getNewUsersCount(): Promise<number> {
    const reports = await this.getReports();
    return reports.filter(report => report.is_new_user).length;
  }

  async getReturningUsersCount(): Promise<number> {
    const reports = await this.getReports();
    return reports.filter(report => !report.is_new_user && report.visit_count > 1).length;
  }

  async getUsersByVisitCount(minVisits: number): Promise<PersonalityReportData[]> {
    const reports = await this.getReports();
    return reports.filter(report => report.visit_count >= minVisits);
  }
}
