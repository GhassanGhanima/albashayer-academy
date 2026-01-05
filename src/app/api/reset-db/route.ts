import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/mysql';
import { hashPassword } from '@/lib/auth';

// Force Node.js runtime for MySQL
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify master key for security
    const masterKey = request.headers.get('x-master-key');
    const envMasterKey = process.env.MASTER_RESET_KEY;

    // If MASTER_RESET_KEY is set, require it
    if (envMasterKey && masterKey !== envMasterKey) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Invalid master key'
      }, { status: 401 });
    }

    // If MASTER_RESET_KEY is not set, require authentication
    if (!envMasterKey) {
      const token = request.cookies.get('admin_token')?.value ||
                    request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized - Authentication required'
        }, { status: 401 });
      }
    }
    // Set charset first
    await execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

    // Disable foreign key checks temporarily
    await execute('SET FOREIGN_KEY_CHECKS = 0');

    // Drop existing tables if they exist (order matters for foreign keys)
    await execute('DROP TABLE IF EXISTS registrations');
    await execute('DROP TABLE IF EXISTS subscriptions');
    await execute('DROP TABLE IF EXISTS coaches');
    await execute('DROP TABLE IF EXISTS settings');
    await execute('DROP TABLE IF EXISTS news');
    await execute('DROP TABLE IF EXISTS players');

    // Re-enable foreign key checks
    await execute('SET FOREIGN_KEY_CHECKS = 1');

    // Create players table
    await execute(`
        CREATE TABLE players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            age INT NOT NULL,
            position VARCHAR(255) NOT NULL,
            bio TEXT,
            achievements JSON,
            images JSON,
            videos JSON,
            isFeatured BOOLEAN DEFAULT FALSE,
            joinDate DATETIME,
            subscription_type VARCHAR(50),
            subscription_amount DECIMAL(10, 2) DEFAULT 0,
            subscription_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
            subscription_lastPayment DATETIME,
            subscription_notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create news table
    await execute(`
        CREATE TABLE news (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT NOT NULL,
            image VARCHAR(500),
            isPublished BOOLEAN DEFAULT TRUE,
            date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create registrations table
    await execute(`
        CREATE TABLE registrations (
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
    await execute(`
        CREATE TABLE settings (
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
    await execute(`
        CREATE TABLE coaches (
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

    // Insert default settings
    // Hash the default admin password
    const hashedPassword = await hashPassword('admin123');

    await execute(`
        INSERT INTO settings (
            academyName, slogan, phone, email, address, facebook, instagram, twitter,
            facebookShareText, admin_username, admin_password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        'أكاديمية البشائر لكرة القدم',
        'نصنع أبطال المستقبل',
        '0790320149',
        'info@albashayer.com',
        'عمان - ماركا الجنوبية',
        'https://www.facebook.com/profile.php?id=100095355948179',
        '',
        '',
        '',
        'admin',
        hashedPassword
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully with UTF-8 support!'
    });

  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
