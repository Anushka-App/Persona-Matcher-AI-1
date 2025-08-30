import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UserData {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  membership_tier?: string;
  user_cookie_id: string;
  is_new_user: boolean;
  account_created_date: string;
  last_login_date: string;
  login_count: number;
  user_agent?: string;
  ip_address?: string;
  user_location?: string;
}

interface UserAccountRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  selectedMembershipTier?: string;
  user_cookie_id: string;
  user_agent?: string;
  ip_address?: string;
  user_location?: string;
}

class UserService {
  private usersFilePath: string;
  private csvHeaders: string[];

  constructor() {
    this.usersFilePath = path.join(process.cwd(), 'users.csv');
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

  private initializeUsersFile() {
    if (!fs.existsSync(this.usersFilePath)) {
      const headerRow = this.csvHeaders.join(',');
      fs.writeFileSync(this.usersFilePath, headerRow + '\n');
    }
  }

  private generateUserId(): string {
    return uuidv4();
  }

  private hashPassword(password: string): string {
    // In a real application, use bcrypt or similar
    // This is a simple hash for demonstration
    return Buffer.from(password).toString('base64');
  }

  private readUsers(): UserData[] {
    try {
      if (!fs.existsSync(this.usersFilePath)) {
        return [];
      }

      const fileContent = fs.readFileSync(this.usersFilePath, 'utf-8');
      const lines = fileContent.trim().split('\n');

      if (lines.length <= 1) return []; // Only header or empty

      const users: UserData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= this.csvHeaders.length) {
          const user: Record<string, string> = {};
          this.csvHeaders.forEach((header, index) => {
            user[header] = values[index] || '';
          });
          users.push(user as unknown as UserData);
        }
      }

      return users;
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }

  private writeUsers(users: UserData[]) {
    try {
      const headerRow = this.csvHeaders.join(',');
      const dataRows = users.map(user =>
        this.csvHeaders.map(header => user[header as keyof UserData] || '').join(',')
      );
      const content = [headerRow, ...dataRows].join('\n');
      fs.writeFileSync(this.usersFilePath, content);
    } catch (error) {
      console.error('Error writing users file:', error);
      throw error;
    }
  }

  async createUser(userData: UserAccountRequest): Promise<{ success: boolean; user_id?: string; message?: string }> {
    try {
      const users = this.readUsers();

      // Check if user already exists with this email
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists. Please sign in instead.'
        };
      }

      // Check if user already exists with this cookie ID
      const existingUserByCookie = users.find(user => user.user_cookie_id === userData.user_cookie_id);
      if (existingUserByCookie) {
        return {
          success: false,
          message: 'You already have an account. Please sign in instead.'
        };
      }

      const newUser: UserData = {
        user_id: this.generateUserId(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password_hash: this.hashPassword(userData.password),
        membership_tier: userData.selectedMembershipTier || '',
        user_cookie_id: userData.user_cookie_id,
        is_new_user: false, // This user is now creating an account
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
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.'
      };
    }
  }

  async checkUserExists(cookieId: string): Promise<{ exists: boolean; user?: UserData }> {
    try {
      const users = this.readUsers();
      const user = users.find(u => u.user_cookie_id === cookieId);

      if (user) {
        return { exists: true, user };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking user existence:', error);
      return { exists: false };
    }
  }

  async getUserByCookieId(cookieId: string): Promise<UserData | null> {
    try {
      const users = this.readUsers();
      return users.find(u => u.user_cookie_id === cookieId) || null;
    } catch (error) {
      console.error('Error getting user by cookie ID:', error);
      return null;
    }
  }

  async updateUserLogin(cookieId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    try {
      const users = this.readUsers();
      const userIndex = users.findIndex(u => u.user_cookie_id === cookieId);

      if (userIndex !== -1) {
        users[userIndex].last_login_date = new Date().toISOString();
        users[userIndex].login_count += 1;
        if (userAgent) users[userIndex].user_agent = userAgent;
        if (ipAddress) users[userIndex].ip_address = ipAddress;

        this.writeUsers(users);
      }
    } catch (error) {
      console.error('Error updating user login:', error);
    }
  }

  async getAllUsers(): Promise<UserData[]> {
    try {
      return this.readUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const users = this.readUsers();
      const filteredUsers = users.filter(u => u.user_id !== userId);

      if (filteredUsers.length < users.length) {
        this.writeUsers(filteredUsers);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async updateUserPreferences(cookieId: string, preferences: Record<string, unknown>): Promise<boolean> {
    try {
      const users = this.readUsers();
      const userIndex = users.findIndex(u => u.user_cookie_id === cookieId);

      if (userIndex !== -1) {
        // For now, we'll just update the user's last login to indicate preferences were updated
        // In a real implementation, you might want to store preferences in a separate table
        users[userIndex].last_login_date = new Date().toISOString();
        this.writeUsers(users);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
}

export default UserService;
