"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
class DatabaseService {
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://match_maker_user:ca22KPpezwg7b6MpN84qmI4GExGoCBCs@dpg-d2940m7diees73fit0g0-a.singapore-postgres.render.com/match_maker',
            ssl: {
                rejectUnauthorized: false
            }
        });
        this.testConnection();
    }
    async testConnection() {
        try {
            const client = await this.pool.connect();
            console.log('✅ Database connection successful');
            client.release();
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
        }
    }
    async initializeTables() {
        const client = await this.pool.connect();
        try {
            await client.query(`
        CREATE TABLE IF NOT EXISTS anuschka_users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          membership_number VARCHAR(50) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await client.query(`
        CREATE TABLE IF NOT EXISTS membership_counter (
          id INTEGER PRIMARY KEY DEFAULT 1,
          current_number INTEGER NOT NULL DEFAULT 30,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            await client.query(`
        INSERT INTO membership_counter (id, current_number) 
        VALUES (1, 30) 
        ON CONFLICT (id) DO NOTHING
      `);
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_anuschka_users_email ON anuschka_users(email)
      `);
            await client.query(`
        CREATE INDEX IF NOT EXISTS idx_anuschka_users_membership ON anuschka_users(membership_number)
      `);
            console.log('✅ Database tables initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize database tables:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async createUser(userData) {
        const client = await this.pool.connect();
        try {
            const existingUser = await client.query('SELECT * FROM anuschka_users WHERE email = $1', [userData.email]);
            if (existingUser.rows.length > 0) {
                throw new Error('User with this email already exists');
            }
            const existingMembership = await client.query('SELECT * FROM anuschka_users WHERE membership_number = $1', [userData.membership_number]);
            if (existingMembership.rows.length > 0) {
                throw new Error('Membership number already exists');
            }
            const result = await client.query(`INSERT INTO anuschka_users (name, email, phone, membership_number)
         VALUES ($1, $2, $3, $4)
         RETURNING *`, [userData.name, userData.email, userData.phone, userData.membership_number]);
            console.log('✅ User created successfully:', result.rows[0].email);
            return result.rows[0];
        }
        catch (error) {
            console.error('❌ Failed to create user:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getUserByEmail(email) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM anuschka_users WHERE email = $1', [email]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('❌ Failed to get user by email:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getUserByMembershipNumber(membershipNumber) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM anuschka_users WHERE membership_number = $1', [membershipNumber]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('❌ Failed to get user by membership number:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getUserById(id) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM anuschka_users WHERE id = $1', [id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('❌ Failed to get user by ID:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getAllUsers() {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM anuschka_users ORDER BY created_at DESC');
            return result.rows;
        }
        catch (error) {
            console.error('❌ Failed to get all users:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async updateUser(id, updates) {
        const client = await this.pool.connect();
        try {
            const fields = Object.keys(updates);
            const values = Object.values(updates);
            if (fields.length === 0) {
                throw new Error('No fields to update');
            }
            const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
            const query = `
        UPDATE anuschka_users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1 
        RETURNING *
      `;
            const result = await client.query(query, [id, ...values]);
            if (result.rows.length === 0) {
                throw new Error('User not found');
            }
            console.log('✅ User updated successfully:', result.rows[0].email);
            return result.rows[0];
        }
        catch (error) {
            console.error('❌ Failed to update user:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deleteUser(id) {
        const client = await this.pool.connect();
        try {
            const result = await client.query('DELETE FROM anuschka_users WHERE id = $1 RETURNING id', [id]);
            const deleted = result.rows.length > 0;
            if (deleted) {
                console.log('✅ User deleted successfully:', id);
            }
            return deleted;
        }
        catch (error) {
            console.error('❌ Failed to delete user:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getUsersCount() {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT COUNT(*) FROM anuschka_users');
            return parseInt(result.rows[0].count);
        }
        catch (error) {
            console.error('❌ Failed to get users count:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async isUserMember(email, phone) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(`SELECT EXISTS (
          SELECT 1 FROM anuschka_users
          WHERE email = $1 OR phone = $2
        )`, [email || '', phone || '']);
            return result.rows[0].exists;
        }
        catch (error) {
            console.error('❌ Failed to check user membership:', error);
            return false;
        }
        finally {
            client.release();
        }
    }
    async getNextMembershipNumber() {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(`
        UPDATE membership_counter 
        SET current_number = current_number + 1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1 
        RETURNING current_number
      `);
            if (result.rows.length === 0) {
                throw new Error('Failed to get next membership number');
            }
            const nextNumber = result.rows[0].current_number;
            await client.query('COMMIT');
            return `ACS${nextNumber}`;
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Failed to get next membership number:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.DatabaseService = DatabaseService;
