"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityReportCSVService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PersonalityReportCSVService {
    constructor() {
        this.csvPath = path_1.default.join(process.cwd(), 'personality_reports.csv');
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
            'personality_report',
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
    initializeCSV() {
        try {
            if (!fs_1.default.existsSync(this.csvPath)) {
                const headerRow = this.csvHeaders.join(',') + '\n';
                fs_1.default.writeFileSync(this.csvPath, headerRow, 'utf8');
                console.log('✅ Created personality_reports.csv with headers');
            }
        }
        catch (error) {
            console.error('❌ Error initializing personality reports CSV:', error);
        }
    }
    escapeCSVValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        let stringValue = String(value);
        stringValue = stringValue.replace(/\r?\n/g, ' ').replace(/\r/g, ' ');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            stringValue = '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
    }
    generateCompletePersonalityReport(data) {
        try {
            const report = {
                personalityType: data.personality,
                sentiment: data.sentiment,
                explanation: data.explanation,
                confidenceScore: data.confidenceScore,
                totalQuestionsAnswered: data.totalQuestionsAnswered,
                sessionDuration: data.sessionDuration,
                stylePreferences: data.stylePreferences,
                lifestyleInsights: data.lifestyleInsights,
                bagPersonality: data.bagPersonality,
                extractedPersonalityName: data.extractedPersonalityName,
                extractedStyleStatement: data.extractedStyleStatement,
                extractedStyleProfile: data.extractedStyleProfile,
                markdownReport: data.markdownReport,
                artworkInsights: data.artworkInsights,
                recommendations: data.recommendations,
                userCookieId: data.userInfo?.userCookieId,
                isNewUser: data.userInfo?.isNewUser,
                firstVisitDate: data.userInfo?.firstVisitDate,
                lastVisitDate: data.userInfo?.lastVisitDate,
                visitCount: data.userInfo?.visitCount,
                userAgent: data.userInfo?.userAgent,
                ipAddress: data.userInfo?.ipAddress,
                userLocation: data.userInfo?.userLocation,
                timestamp: data.timestamp,
                userInfo: data.userInfo
            };
            return JSON.stringify(report, null, 2);
        }
        catch (error) {
            console.error('❌ Error generating complete personality report:', error);
            return JSON.stringify({ error: 'Failed to generate complete report' });
        }
    }
    async savePersonalityReport(data) {
        try {
            const userId = data.userInfo?.session_id || this.generateUserId();
            const completeReport = this.generateCompletePersonalityReport(data);
            const rowData = [
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
                completeReport,
                data.userInfo?.userCookieId || '',
                data.userInfo?.isNewUser || false,
                data.userInfo?.firstVisitDate || data.timestamp,
                data.userInfo?.lastVisitDate || data.timestamp,
                data.userInfo?.visitCount || 1,
                data.userInfo?.userAgent || '',
                data.userInfo?.ipAddress || '',
                data.userInfo?.userLocation || ''
            ];
            const csvRow = rowData.map(value => this.escapeCSVValue(value)).join(',') + '\n';
            fs_1.default.appendFileSync(this.csvPath, csvRow, 'utf8');
            console.log('✅ Personality report saved to CSV successfully');
            console.log(`📄 Report for personality: ${data.personality}`);
            console.log(`📊 Complete report length: ${completeReport.length} characters`);
        }
        catch (error) {
            console.error('❌ Error saving personality report to CSV:', error);
            throw error;
        }
    }
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    async getReports() {
        try {
            if (!fs_1.default.existsSync(this.csvPath)) {
                return [];
            }
            const csvContent = fs_1.default.readFileSync(this.csvPath, 'utf8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            if (lines.length <= 1) {
                return [];
            }
            const reports = [];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVRow(lines[i]);
                    if (values.length >= this.csvHeaders.length) {
                        const report = {
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
                            personality_report: values[16] || '',
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
                }
                catch (parseError) {
                    console.error('❌ Error parsing CSV row:', parseError);
                }
            }
            return reports;
        }
        catch (error) {
            console.error('❌ Error reading personality reports:', error);
            return [];
        }
    }
    parseCSVRow(row) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                if (inQuotes && row[i + 1] === '"') {
                    currentValue += '"';
                    i++;
                }
                else {
                    inQuotes = !inQuotes;
                }
            }
            else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            }
            else {
                currentValue += char;
            }
        }
        values.push(currentValue);
        return values;
    }
    async getReportByUserId(userId) {
        const reports = await this.getReports();
        return reports.find(report => report.user_id === userId) || null;
    }
    async getReportsByPersonalityType(personalityType) {
        const reports = await this.getReports();
        return reports.filter(report => report.personality_type === personalityType);
    }
    async getUserByCookieId(cookieId) {
        const reports = await this.getReports();
        return reports.find(report => report.user_cookie_id === cookieId) || null;
    }
    async updateUserVisitInfo(cookieId, isNewVisit = false) {
        try {
            if (!fs_1.default.existsSync(this.csvPath)) {
                return;
            }
            const csvContent = fs_1.default.readFileSync(this.csvPath, 'utf8');
            const lines = csvContent.split('\n').filter(line => line.trim());
            if (lines.length <= 1) {
                return;
            }
            const updatedLines = [lines[0]];
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVRow(lines[i]);
                    if (values.length >= this.csvHeaders.length && values[17] === cookieId) {
                        const currentVisitCount = values[21] ? parseInt(values[21]) : 1;
                        const newVisitCount = isNewVisit ? currentVisitCount + 1 : currentVisitCount;
                        const currentTime = new Date().toISOString();
                        values[20] = currentTime;
                        values[21] = newVisitCount.toString();
                        if (isNewVisit && !values[19]) {
                            values[19] = currentTime;
                        }
                        const updatedLine = values.map(value => this.escapeCSVValue(value)).join(',');
                        updatedLines.push(updatedLine);
                    }
                    else {
                        updatedLines.push(lines[i]);
                    }
                }
                catch (parseError) {
                    console.error('❌ Error parsing CSV row during update:', parseError);
                    updatedLines.push(lines[i]);
                }
            }
            fs_1.default.writeFileSync(this.csvPath, updatedLines.join('\n') + '\n', 'utf8');
            if (isNewVisit) {
                console.log(`✅ Updated visit info for user with cookie ID: ${cookieId}`);
            }
        }
        catch (error) {
            console.error('❌ Error updating user visit info:', error);
        }
    }
    async getNewUsersCount() {
        const reports = await this.getReports();
        return reports.filter(report => report.is_new_user).length;
    }
    async getReturningUsersCount() {
        const reports = await this.getReports();
        return reports.filter(report => !report.is_new_user && report.visit_count > 1).length;
    }
    async getUsersByVisitCount(minVisits) {
        const reports = await this.getReports();
        return reports.filter(report => report.visit_count >= minVisits);
    }
}
exports.PersonalityReportCSVService = PersonalityReportCSVService;
