import mysql from 'mysql2/promise';

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306');
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'albashayer_academy';

interface MySQLCache {
    conn: mysql.Connection | null;
    promise: Promise<mysql.Connection> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mysql: MySQLCache | undefined;
}

let cached: MySQLCache = global.mysql || { conn: null, promise: null };

if (!global.mysql) {
    global.mysql = cached;
}

async function createConnection(): Promise<mysql.Connection> {
    try {
        const connection = await mysql.createConnection({
            host: MYSQL_HOST,
            port: MYSQL_PORT,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
            charset: 'utf8mb4',
        });
        // Set session character set
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ MySQL connected successfully');
        return connection;
    } catch (error: any) {
        console.error('❌ MySQL connection failed:', error.message);
        throw error;
    }
}

async function connectDB(): Promise<mysql.Connection> {
    if (cached.conn) {
        // Check if connection is still alive
        try {
            await cached.conn.ping();
            return cached.conn;
        } catch {
            cached.conn = null;
            cached.promise = null;
        }
    }

    if (!cached.promise) {
        cached.promise = createConnection();
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Helper function to execute queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const connection = await connectDB();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows as T[];
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Helper function to execute insert/update/delete and return affected info
export async function execute(sql: string, params?: any[]): Promise<mysql.OkPacket> {
    const connection = await connectDB();
    try {
        const [result] = await connection.execute(sql, params);
        return result as mysql.OkPacket;
    } catch (error) {
        console.error('Execute error:', error);
        throw error;
    }
}

// Initialize database tables
export async function initializeTables() {
    const connection = await connectDB();

    // Create players table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            position VARCHAR(255) NOT NULL,
            bio TEXT,
            achievements JSON,
            images JSON,
            videos JSON,
            isFeatured BOOLEAN DEFAULT FALSE,
            isActive BOOLEAN DEFAULT TRUE,
            joinDate DATETIME,
            subscription_type VARCHAR(50),
            subscription_amount DECIMAL(10, 2) DEFAULT 0,
            subscription_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
            subscription_lastPayment DATETIME,
            subscription_notes TEXT,
            payment_history JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Add isActive column to existing players table if it doesn't exist
    try {
        await connection.execute(`ALTER TABLE players ADD COLUMN isActive BOOLEAN DEFAULT TRUE`);
    } catch (e: any) {}
    // Add payment_history column to existing players table if it doesn't exist
    try {
        await connection.execute(`ALTER TABLE players ADD COLUMN payment_history JSON`);
    } catch (e: any) {}

    // Create news table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT NOT NULL,
            image VARCHAR(500),
            images JSON,
            videos JSON,
            isPublished BOOLEAN DEFAULT TRUE,
            date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Add new columns to existing news table if they don't exist
    try {
        await connection.execute(`ALTER TABLE news ADD COLUMN images JSON AFTER image`);
    } catch (e: any) {
        // Column already exists or other error - ignore
        if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_BAD_FIELD_ERROR') {
            console.error('Error adding images column:', e.message);
        }
    }
    try {
        await connection.execute(`ALTER TABLE news ADD COLUMN videos JSON AFTER images`);
    } catch (e: any) {
        // Column already exists or other error - ignore
        if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_BAD_FIELD_ERROR') {
            console.error('Error adding videos column:', e.message);
        }
    }

    // Create registrations table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            childName VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            parentName VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(255),
            message TEXT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            submittedAt DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create settings table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            academyName VARCHAR(255) NOT NULL,
            slogan VARCHAR(500) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(255) NOT NULL,
            address TEXT NOT NULL,
            facebook VARCHAR(500),
            instagram VARCHAR(500),
            twitter VARCHAR(500),
            facebookShareText TEXT,
            admin_username VARCHAR(255) NOT NULL,
            admin_password VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create coaches table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS coaches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            bio TEXT,
            image VARCHAR(500),
            experience TEXT,
            certifications JSON,
            isHeadCoach BOOLEAN DEFAULT FALSE,
            order_index INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    console.log('✅ MySQL tables initialized');
}

export default connectDB;
