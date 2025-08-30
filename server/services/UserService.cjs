"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class UserService {
    constructor() {
        this.usersFilePath = path_1.default.join(process.cwd(), 'users.csv');
        this.csvHeaders = [
            'user_id',
            'name',
            'email',
            'phone',
            'password_hash',
            'membership_tier',
            'user_cookie_id',
            'is_new_user',
            'account_created_date',
            'last_login_date',
            'login_count',
            'user_agent',
            'ip_address',
            'user_location'
        ];
        this.initializeUsersFile();
    }
    initializeUsersFile() {
        if (!fs_1.default.existsSync(this.usersFilePath)) {
            const headerRow = this.csvHeaders.join(',');
            fs_1.default.writeFileSync(this.usersFilePath, headerRow + '\n');
        }
    }
    generateUserId() {
        return (0, uuid_1.v4)();
    }
    hashPassword(password) {
        return Buffer.from(password).toString('base64');
    }
    readUsers() {
        try {
            if (!fs_1.default.existsSync(this.usersFilePath)) {
                return [];
            }
            const fileContent = fs_1.default.readFileSync(this.usersFilePath, 'utf-8');
            const lines = fileContent.trim().split('\n');
            if (lines.length <= 1)
                return [];
            const users = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length >= this.csvHeaders.length) {
                    const user = {};
                    this.csvHeaders.forEach((header, index) => {
                        user[header] = values[index] || '';
                    });
                    users.push(user);
                }
            }
            return users;
        }
        catch (error) {
            console.error('Error reading users file:', error);
            return [];
        }
    }
    writeUsers(users) {
        try {
            const headerRow = this.csvHeaders.join(',');
            const dataRows = users.map(user => this.csvHeaders.map(header => user[header] || '').join(','));
            const content = [headerRow, ...dataRows].join('\n');
            fs_1.default.writeFileSync(this.usersFilePath, content);
        }
        catch (error) {
            console.error('Error writing users file:', error);
            throw error;
        }
    }
    async createUser(userData) {
        try {
            const users = this.readUsers();
            const existingUser = users.find(user => user.email === userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists. Please sign in instead.'
                };
            }
            const existingUserByCookie = users.find(user => user.user_cookie_id === userData.user_cookie_id);
            if (existingUserByCookie) {
                return {
                    success: false,
                    message: 'You already have an account. Please sign in instead.'
                };
            }
            const newUser = {
                user_id: this.generateUserId(),
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password_hash: this.hashPassword(userData.password),
                membership_tier: userData.selectedMembershipTier || '',
                user_cookie_id: userData.user_cookie_id,
                is_new_user: false,
                account_created_date: new Date().toISOString(),
                last_login_date: new Date().toISOString(),
                login_count: 1,
                user_agent: userData.user_agent || '',
                ip_address: userData.ip_address || '',
                user_location: userData.user_location || ''
            };
            users.push(newUser);
            this.writeUsers(users);
            return {
                success: true,
                user_id: newUser.user_id,
                message: 'Account created successfully!'
            };
        }
        catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: 'Failed to create account. Please try again.'
            };
        }
    }
    async checkUserExists(cookieId) {
        try {
            const users = this.readUsers();
            const user = users.find(u => u.user_cookie_id === cookieId);
            if (user) {
                return { exists: true, user };
            }
            return { exists: false };
        }
        catch (error) {
            console.error('Error checking user existence:', error);
            return { exists: false };
        }
    }
    async getUserByCookieId(cookieId) {
        try {
            const users = this.readUsers();
            return users.find(u => u.user_cookie_id === cookieId) || null;
        }
        catch (error) {
            console.error('Error getting user by cookie ID:', error);
            return null;
        }
    }
    async updateUserLogin(cookieId, userAgent, ipAddress) {
        try {
            const users = this.readUsers();
            const userIndex = users.findIndex(u => u.user_cookie_id === cookieId);
            if (userIndex !== -1) {
                users[userIndex].last_login_date = new Date().toISOString();
                users[userIndex].login_count += 1;
                if (userAgent)
                    users[userIndex].user_agent = userAgent;
                if (ipAddress)
                    users[userIndex].ip_address = ipAddress;
                this.writeUsers(users);
            }
        }
        catch (error) {
            console.error('Error updating user login:', error);
        }
    }
    async getAllUsers() {
        try {
            return this.readUsers();
        }
        catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    }
    async deleteUser(userId) {
        try {
            const users = this.readUsers();
            const filteredUsers = users.filter(u => u.user_id !== userId);
            if (filteredUsers.length < users.length) {
                this.writeUsers(filteredUsers);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }
    async updateUserPreferences(cookieId, preferences) {
        try {
            const users = this.readUsers();
            const userIndex = users.findIndex(u => u.user_cookie_id === cookieId);
            if (userIndex !== -1) {
                users[userIndex].last_login_date = new Date().toISOString();
                this.writeUsers(users);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error updating user preferences:', error);
            return false;
        }
    }
}
exports.default = UserService;
