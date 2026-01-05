import { NextResponse } from 'next/server';
import { PlayerService, NewsService, SettingService, query, execute } from '@/lib/mysqlService';
import fs from 'fs/promises';
import path from 'path';
import { hashPassword } from '@/lib/auth';

// Force Node.js runtime for MySQL
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if data already exists
    const existingPlayers = await query<any>('SELECT COUNT(*) as count FROM players');

    const results = {
      players: 0,
      news: 0,
      settings: 0,
      coaches: 0,
      alreadyInitialized: false
    };

    // If data already exists, return
    if (existingPlayers && existingPlayers[0] && existingPlayers[0].count > 0) {
      results.alreadyInitialized = true;
      return NextResponse.json({
        success: true,
        message: 'قاعدة البيانات تم تهيئتها مسبقاً ✅',
        results
      });
    }

    const DATA_DIR = path.join(process.cwd(), 'data');

    // Helper to read JSON
    const readJSON = async (filename: string) => {
      try {
        const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
        return JSON.parse(content);
      } catch (e) {
        console.error(`Error reading ${filename}:`, e);
        return null;
      }
    };

    // Helper to stringify JSON fields
    const stringifyJSON = (data: any) => {
      if (data === null || data === undefined) return null;
      if (typeof data === 'string') return data;
      return JSON.stringify(data);
    };

    // Seed Players
    const localPlayers = await readJSON('players.json');
    if (localPlayers && Array.isArray(localPlayers)) {
      for (const player of localPlayers) {
        const { id, _id, ...rest } = player;
        await execute(`
          INSERT INTO players (
            name, age, position, bio, achievements, images, videos,
            isFeatured, joinDate,
            subscription_type, subscription_amount, subscription_status,
            subscription_lastPayment, subscription_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rest.name,
          rest.age,
          rest.position,
          rest.bio || '',
          stringifyJSON(rest.achievements || []),
          stringifyJSON(rest.images || []),
          stringifyJSON(rest.videos || []),
          rest.isFeatured ? 1 : 0,
          rest.joinDate ? new Date(rest.joinDate) : new Date(),
          rest.subscription?.type || null,
          rest.subscription?.amount || 0,
          rest.subscription?.status || 'unpaid',
          rest.subscription?.lastPayment ? new Date(rest.subscription.lastPayment) : null,
          rest.subscription?.notes || null
        ]);
      }
      results.players = localPlayers.length;
    }

    // Seed News
    const localNews = await readJSON('news.json');
    if (localNews && Array.isArray(localNews)) {
      for (const item of localNews) {
        const { id, _id, ...rest } = item;
        await execute(`
          INSERT INTO news (title, content, image, isPublished, date)
          VALUES (?, ?, ?, ?, ?)
        `, [
          rest.title,
          rest.content,
          rest.image || '',
          rest.isPublished !== false ? 1 : 0,
          rest.date ? new Date(rest.date) : new Date()
        ]);
      }
      results.news = localNews.length;
    }

    // Seed Settings
    const localSettings = await readJSON('settings.json');
    if (localSettings && Array.isArray(localSettings) && localSettings[0]) {
      const { id, _id, adminCredentials, ...rest } = localSettings[0];

      // Hash the admin password before storing
      const hashedPassword = await hashPassword(adminCredentials?.password || 'admin123');

      await execute(`
        INSERT INTO settings (
          academyName, slogan, phone, email, address, facebook, instagram, twitter,
          facebookShareText, admin_username, admin_password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        rest.academyName || 'أكاديمية البشائر لكرة القدم',
        rest.slogan || 'نصنع أبطال المستقبل',
        rest.phone || '0501234567',
        rest.email || 'info@albashayer.com',
        rest.address || 'الرياض - حي النرجس',
        rest.facebook || '',
        rest.instagram || '',
        rest.twitter || '',
        rest.facebookShareText || '',
        adminCredentials?.username || 'admin',
        hashedPassword
      ]);
      results.settings = 1;
    } else {
      // Fallback to default settings if no JSON
      // Hash the default password
      const hashedPassword = await hashPassword('admin123');

      await execute(`
        INSERT INTO settings (
          academyName, slogan, phone, email, address, facebook, instagram, twitter,
          facebookShareText, admin_username, admin_password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'أكاديمية البشائر لكرة القدم',
        'نصنع أبطال المستقبل',
        '0501234567',
        'info@albashayer.com',
        'الرياض - حي النرجس',
        '',
        '',
        '',
        '',
        'admin',
        hashedPassword
      ]);
      results.settings = 1;
    }

    // Seed Coaches
    const localCoaches = await readJSON('coaches.json');
    if (localCoaches && Array.isArray(localCoaches)) {
      for (const coach of localCoaches) {
        const { id, _id, ...rest } = coach;
        await execute(`
          INSERT INTO coaches (name, title, bio, image, experience, certifications, isHeadCoach, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          rest.name,
          rest.title,
          rest.bio || '',
          rest.image || '',
          rest.experience || '',
          stringifyJSON(rest.certifications || []),
          rest.isHeadCoach ? 1 : 0,
          rest.order_index || 0
        ]);
      }
      results.coaches = localCoaches.length;
    }

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح من الملفات المحلية! ✅',
      results,
      tables: ['players', 'news', 'settings', 'coaches']
    });

  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل تهيئة قاعدة البيانات',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
