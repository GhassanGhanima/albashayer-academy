import { query, execute, initializeTables } from './mysql';
import { logger } from './logger';
import { sanitizeInput, sanitizeObject } from './auth';

// Re-export query and execute for use in other modules
export { query, execute };

// Initialize tables on import
initializeTables().catch((err) => logger.error('Failed to initialize MySQL tables', err));

// Types
interface ISubscription {
    type: string;
    amount: number;
    status: 'paid' | 'unpaid';
    lastPayment?: Date;
    notes?: string;
}

export interface IPlayer {
    id?: number;
    name: string;
    age: number;
    position: string;
    bio?: string;
    achievements?: string[];
    images?: string[];
    videos?: string[];
    isFeatured: boolean;
    isActive: boolean;
    joinDate?: Date;
    subscription?: ISubscription;
    created_at?: Date;
    updated_at?: Date;
}

export interface INews {
    id?: number;
    title: string;
    content: string;
    image?: string;
    images?: string[];
    videos?: string[];
    isPublished: boolean;
    date?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface IRegistration {
    id?: number;
    childName: string;
    age: number;
    parentName: string;
    phone: string;
    email?: string;
    message?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt?: Date;
    created_at?: Date;
    updated_at?: Date;
}

export interface ISetting {
    id?: number;
    academyName: string;
    slogan: string;
    phone: string;
    email: string;
    address: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    facebookShareText?: string;
    adminCredentials?: {
        username: string;
        password: string;
    };
    // For backward compatibility with database columns
    admin_username?: string;
    admin_password?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ICoach {
    id?: number;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    experience?: string;
    certifications?: string[];
    isHeadCoach: boolean;
    order_index?: number;
    created_at?: Date;
    updated_at?: Date;
}

// Helper to parse JSON fields
function parseJSONField<T>(field: string | T | null | undefined, defaultValue: T): T {
    if (field === null || field === undefined) return defaultValue;
    if (typeof field === 'string') {
        try {
            return JSON.parse(field) as T;
        } catch {
            return defaultValue;
        }
    }
    return field;
}

// Helper to stringify JSON fields
function stringifyJSONField<T>(field: T | null | undefined): string | null {
    if (field === null || field === undefined) return null;
    if (typeof field === 'string') return field;
    return JSON.stringify(field);
}

// ==================== PLAYERS ====================

export const PlayerService = {
    async getAll(): Promise<IPlayer[]> {
        try {
            const rows = await query<any>(`
                SELECT
                    id, name, age, position, bio, achievements, images, videos,
                    isFeatured, isActive, joinDate,
                    subscription_type as subscriptionType,
                    subscription_amount as subscriptionAmount,
                    subscription_status as subscriptionStatus,
                    subscription_lastPayment as subscriptionLastPayment,
                    subscription_notes as subscriptionNotes,
                    created_at, updated_at
                FROM players
                ORDER BY isFeatured DESC, created_at DESC
            `);

            return rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                age: row.age,
                position: row.position,
                bio: row.bio || '',
                achievements: parseJSONField(row.achievements, []),
                images: parseJSONField(row.images, []),
                videos: parseJSONField(row.videos, []),
                isFeatured: !!row.isFeatured,
                isActive: row.isActive !== undefined ? !!row.isActive : true,
                joinDate: row.joinDate,
                subscription: row.subscriptionType ? {
                    type: row.subscriptionType,
                    amount: parseFloat(row.subscriptionAmount) || 0,
                    status: row.subscriptionStatus || 'unpaid',
                    lastPayment: row.subscriptionLastPayment,
                    notes: row.subscriptionNotes || ''
                } : undefined,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } catch (error) {
            logger.error('Error fetching players from MySQL', error);
            throw error;
        }
    },

    async getById(id: string | number): Promise<IPlayer | null> {
        try {
            const rows = await query<any>(`
                SELECT
                    id, name, age, position, bio, achievements, images, videos,
                    isFeatured, isActive, joinDate,
                    subscription_type as subscriptionType,
                    subscription_amount as subscriptionAmount,
                    subscription_status as subscriptionStatus,
                    subscription_lastPayment as subscriptionLastPayment,
                    subscription_notes as subscriptionNotes,
                    created_at, updated_at
                FROM players
                WHERE id = ?
            `, [id]);

            if (!rows || rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                name: row.name,
                age: row.age,
                position: row.position,
                bio: row.bio || '',
                achievements: parseJSONField(row.achievements, []),
                images: parseJSONField(row.images, []),
                videos: parseJSONField(row.videos, []),
                isFeatured: !!row.isFeatured,
                isActive: row.isActive !== undefined ? !!row.isActive : true,
                joinDate: row.joinDate,
                subscription: row.subscriptionType ? {
                    type: row.subscriptionType,
                    amount: parseFloat(row.subscriptionAmount) || 0,
                    status: row.subscriptionStatus || 'unpaid',
                    lastPayment: row.subscriptionLastPayment,
                    notes: row.subscriptionNotes || ''
                } : undefined,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (error) {
            logger.error('Error fetching player from MySQL:', error);
            throw error;
        }
    },

    async create(data: IPlayer): Promise<number> {
        try {
            // Sanitize user input
            const sanitizedData = {
                ...data,
                name: sanitizeInput(data.name),
                position: sanitizeInput(data.position),
                bio: data.bio ? sanitizeInput(data.bio) : '',
            };

            const result = await execute(`
                INSERT INTO players (
                    name, age, position, bio, achievements, images, videos,
                    isFeatured, isActive, joinDate,
                    subscription_type, subscription_amount, subscription_status,
                    subscription_lastPayment, subscription_notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sanitizedData.name,
                sanitizedData.age,
                sanitizedData.position,
                sanitizedData.bio,
                stringifyJSONField(sanitizedData.achievements),
                stringifyJSONField(sanitizedData.images),
                stringifyJSONField(sanitizedData.videos),
                sanitizedData.isFeatured ? 1 : 0,
                sanitizedData.isActive !== undefined ? (sanitizedData.isActive ? 1 : 0) : 1,
                sanitizedData.joinDate || new Date(),
                sanitizedData.subscription?.type || null,
                sanitizedData.subscription?.amount || 0,
                sanitizedData.subscription?.status || 'unpaid',
                sanitizedData.subscription?.lastPayment || null,
                sanitizedData.subscription?.notes || null
            ]);

            return result.insertId;
        } catch (error) {
            logger.error('Error creating player in MySQL:', error);
            throw error;
        }
    },

    async update(id: string | number, data: Partial<IPlayer>): Promise<boolean> {
        try {
            // Build dynamic update query
            const updates: string[] = [];
            const params: any[] = [];

            if (data.name !== undefined) {
                updates.push('name = ?');
                params.push(sanitizeInput(data.name));
            }
            if (data.age !== undefined) {
                updates.push('age = ?');
                params.push(data.age);
            }
            if (data.position !== undefined) {
                updates.push('position = ?');
                params.push(sanitizeInput(data.position));
            }
            if (data.bio !== undefined) {
                updates.push('bio = ?');
                params.push(sanitizeInput(data.bio));
            }
            if (data.achievements !== undefined) {
                updates.push('achievements = ?');
                params.push(stringifyJSONField(data.achievements));
            }
            if (data.images !== undefined) {
                updates.push('images = ?');
                // Ensure empty arrays are stored as null instead of empty JSON
                params.push(Array.isArray(data.images) && data.images.length > 0
                    ? stringifyJSONField(data.images)
                    : null);
            }
            if (data.videos !== undefined) {
                updates.push('videos = ?');
                // Ensure empty arrays are stored as null instead of empty JSON
                params.push(Array.isArray(data.videos) && data.videos.length > 0
                    ? stringifyJSONField(data.videos)
                    : null);
            }
            if (data.isFeatured !== undefined) {
                updates.push('isFeatured = ?');
                params.push(data.isFeatured ? 1 : 0);
            }
            if (data.isActive !== undefined) {
                updates.push('isActive = ?');
                params.push(data.isActive ? 1 : 0);
            }
            if (data.joinDate !== undefined) {
                updates.push('joinDate = ?');
                // Handle date string format (YYYY-MM-DD) -> convert to proper Date object
                params.push(data.joinDate instanceof Date
                    ? data.joinDate
                    : new Date(data.joinDate));
            }

            // Handle subscription updates
            if (data.subscription) {
                updates.push('subscription_type = ?');
                params.push(data.subscription.type);
                updates.push('subscription_amount = ?');
                params.push(data.subscription.amount);
                updates.push('subscription_status = ?');
                params.push(data.subscription.status);
                if (data.subscription.lastPayment !== undefined) {
                    updates.push('subscription_lastPayment = ?');
                    params.push(data.subscription.lastPayment instanceof Date
                        ? data.subscription.lastPayment
                        : data.subscription.lastPayment ? new Date(data.subscription.lastPayment) : null);
                }
                if (data.subscription.notes !== undefined) {
                    updates.push('subscription_notes = ?');
                    params.push(data.subscription.notes);
                }
            }

            if (updates.length === 0) return true;

            params.push(id);

            const result = await execute(
                `UPDATE players SET ${updates.join(', ')} WHERE id = ?`,
                params
            );

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error updating player in MySQL:', error);
            throw error;
        }
    },

    async updateSubscription(id: string | number, subscription: ISubscription): Promise<boolean> {
        try {
            const result = await execute(`
                UPDATE players
                SET subscription_type = ?,
                    subscription_amount = ?,
                    subscription_status = ?,
                    subscription_lastPayment = ?,
                    subscription_notes = ?
                WHERE id = ?
            `, [
                subscription.type,
                subscription.amount,
                subscription.status,
                subscription.lastPayment || null,
                subscription.notes || '',
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error updating subscription in MySQL:', error);
            throw error;
        }
    },

    async delete(id: string | number): Promise<boolean> {
        try {
            const result = await execute('DELETE FROM players WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error deleting player from MySQL:', error);
            throw error;
        }
    }
};

// ==================== NEWS ====================

export const NewsService = {
    async getAll(onlyPublished: boolean = false): Promise<INews[]> {
        try {
            let sql = `
                SELECT id, title, content, image, images, videos, isPublished, date, created_at, updated_at
                FROM news
            `;
            if (onlyPublished) {
                sql += ' WHERE isPublished = 1';
            }
            sql += ' ORDER BY date DESC';

            const rows = await query<any>(sql);

            return rows.map((row: any) => ({
                id: row.id,
                title: row.title,
                content: row.content,
                image: row.image || '',
                images: parseJSONField(row.images, []),
                videos: parseJSONField(row.videos, []),
                isPublished: !!row.isPublished,
                date: row.date,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } catch (error) {
            logger.error('Error fetching news from MySQL:', error);
            throw error;
        }
    },

    async getById(id: string | number): Promise<INews | null> {
        try {
            const rows = await query<any>(
                'SELECT id, title, content, image, images, videos, isPublished, date, created_at, updated_at FROM news WHERE id = ?',
                [id]
            );

            if (!rows || rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                title: row.title,
                content: row.content,
                image: row.image || '',
                images: parseJSONField(row.images, []),
                videos: parseJSONField(row.videos, []),
                isPublished: !!row.isPublished,
                date: row.date,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (error) {
            logger.error('Error fetching news item from MySQL:', error);
            throw error;
        }
    },

    async create(data: INews): Promise<number> {
        try {
            // Sanitize user input to prevent XSS
            const sanitizedData = {
                ...data,
                title: sanitizeInput(data.title),
                content: sanitizeInput(data.content),
            };

            const result = await execute(`
                INSERT INTO news (title, content, image, images, videos, isPublished, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                sanitizedData.title,
                sanitizedData.content,
                sanitizedData.image || '',
                Array.isArray(sanitizedData.images) && sanitizedData.images.length > 0
                    ? stringifyJSONField(sanitizedData.images)
                    : null,
                Array.isArray(sanitizedData.videos) && sanitizedData.videos.length > 0
                    ? stringifyJSONField(sanitizedData.videos)
                    : null,
                sanitizedData.isPublished !== false ? 1 : 0,
                sanitizedData.date || new Date()
            ]);

            return result.insertId;
        } catch (error) {
            logger.error('Error creating news in MySQL:', error);
            throw error;
        }
    },

    async update(id: string | number, data: Partial<INews>): Promise<boolean> {
        try {
            const updates: string[] = [];
            const params: any[] = [];

            if (data.title !== undefined) {
                updates.push('title = ?');
                params.push(sanitizeInput(data.title));
            }
            if (data.content !== undefined) {
                updates.push('content = ?');
                params.push(sanitizeInput(data.content));
            }
            if (data.image !== undefined) {
                updates.push('image = ?');
                params.push(data.image);
            }
            if (data.images !== undefined) {
                updates.push('images = ?');
                params.push(Array.isArray(data.images) && data.images.length > 0
                    ? stringifyJSONField(data.images)
                    : null);
            }
            if (data.videos !== undefined) {
                updates.push('videos = ?');
                params.push(Array.isArray(data.videos) && data.videos.length > 0
                    ? stringifyJSONField(data.videos)
                    : null);
            }
            if (data.isPublished !== undefined) {
                updates.push('isPublished = ?');
                params.push(data.isPublished ? 1 : 0);
            }
            if (data.date !== undefined) {
                updates.push('date = ?');
                params.push(data.date instanceof Date ? data.date : new Date(data.date));
            }

            if (updates.length === 0) return true;

            params.push(id);

            const result = await execute(
                `UPDATE news SET ${updates.join(', ')} WHERE id = ?`,
                params
            );

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error updating news in MySQL:', error);
            throw error;
        }
    },

    async delete(id: string | number): Promise<boolean> {
        try {
            const result = await execute('DELETE FROM news WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error deleting news from MySQL:', error);
            throw error;
        }
    }
};

// ==================== REGISTRATIONS ====================

export const RegistrationService = {
    async getAll(): Promise<IRegistration[]> {
        try {
            const rows = await query<any>(`
                SELECT id, childName, age, parentName, phone, email, message,
                       status, submittedAt, created_at, updated_at
                FROM registrations
                ORDER BY created_at DESC
            `);

            return rows.map((row: any) => ({
                id: row.id,
                childName: row.childName,
                age: row.age,
                parentName: row.parentName,
                phone: row.phone,
                email: row.email || '',
                message: row.message || '',
                status: row.status,
                submittedAt: row.submittedAt,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } catch (error) {
            logger.error('Error fetching registrations from MySQL:', error);
            throw error;
        }
    },

    async getById(id: string | number): Promise<IRegistration | null> {
        try {
            const rows = await query<any>(
                'SELECT id, childName, age, parentName, phone, email, message, status, submittedAt, created_at, updated_at FROM registrations WHERE id = ?',
                [id]
            );

            if (!rows || rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                childName: row.childName,
                age: row.age,
                parentName: row.parentName,
                phone: row.phone,
                email: row.email || '',
                message: row.message || '',
                status: row.status,
                submittedAt: row.submittedAt,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (error) {
            logger.error('Error fetching registration from MySQL:', error);
            throw error;
        }
    },

    async create(data: IRegistration): Promise<number> {
        try {
            // Sanitize user input to prevent XSS
            const sanitizedData = {
                ...data,
                childName: sanitizeInput(data.childName),
                parentName: sanitizeInput(data.parentName),
                message: data.message ? sanitizeInput(data.message) : '',
            };

            const result = await execute(`
                INSERT INTO registrations (childName, age, parentName, phone, email, message, status, submittedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sanitizedData.childName,
                sanitizedData.age,
                sanitizedData.parentName,
                sanitizedData.phone,
                sanitizedData.email || '',
                sanitizedData.message || '',
                sanitizedData.status || 'pending',
                sanitizedData.submittedAt || new Date()
            ]);

            return result.insertId;
        } catch (error) {
            logger.error('Error creating registration in MySQL:', error);
            throw error;
        }
    },

    async updateStatus(id: string | number, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
        try {
            const result = await execute(
                'UPDATE registrations SET status = ? WHERE id = ?',
                [status, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error updating registration status in MySQL:', error);
            throw error;
        }
    },

    async delete(id: string | number): Promise<boolean> {
        try {
            const result = await execute('DELETE FROM registrations WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error deleting registration from MySQL:', error);
            throw error;
        }
    }
};

// ==================== SETTINGS ====================

export const SettingService = {
    async get(): Promise<ISetting | null> {
        try {
            const rows = await query<any>(
                'SELECT id, academyName, slogan, phone, email, address, facebook, instagram, twitter, facebookShareText, admin_username as adminUsername, admin_password as adminPassword, created_at, updated_at FROM settings LIMIT 1'
            );

            if (!rows || rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                academyName: row.academyName,
                slogan: row.slogan,
                phone: row.phone,
                email: row.email,
                address: row.address,
                facebook: row.facebook || '',
                instagram: row.instagram || '',
                twitter: row.twitter || '',
                facebookShareText: row.facebookShareText || '',
                adminCredentials: {
                    username: row.adminUsername,
                    password: row.adminPassword
                },
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (error) {
            logger.error('Error fetching settings from MySQL:', error);
            throw error;
        }
    },

    async upsert(data: ISetting): Promise<ISetting> {
        try {
            // Check if settings exist
            const existing = await query<any>('SELECT id FROM settings LIMIT 1');

            if (existing && existing.length > 0) {
                // Update
                await execute(`
                    UPDATE settings
                    SET academyName = ?, slogan = ?, phone = ?, email = ?, address = ?,
                        facebook = ?, instagram = ?, twitter = ?, facebookShareText = ?,
                        admin_username = ?, admin_password = ?
                    WHERE id = ?
                `, [
                    data.academyName,
                    data.slogan,
                    data.phone,
                    data.email,
                    data.address,
                    data.facebook || '',
                    data.instagram || '',
                    data.twitter || '',
                    data.facebookShareText || '',
                    data.adminCredentials?.username || '',
                    data.adminCredentials?.password || '',
                    existing[0].id
                ]);

                return { ...data, id: existing[0].id };
            } else {
                // Insert
                const result = await execute(`
                    INSERT INTO settings (academyName, slogan, phone, email, address, facebook, instagram, twitter, facebookShareText, admin_username, admin_password)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    data.academyName,
                    data.slogan,
                    data.phone,
                    data.email,
                    data.address,
                    data.facebook || '',
                    data.instagram || '',
                    data.twitter || '',
                    data.facebookShareText || '',
                    data.adminCredentials?.username || '',
                    data.adminCredentials?.password || ''
                ]);

                return { ...data, id: result.insertId };
            }
        } catch (error) {
            logger.error('Error upserting settings in MySQL:', error);
            throw error;
        }
    }
};

// ==================== COACHES ====================

export const CoachService = {
    async getAll(): Promise<ICoach[]> {
        try {
            const rows = await query<any>(`
                SELECT id, name, title, bio, image, experience, certifications,
                       isHeadCoach, order_index, created_at, updated_at
                FROM coaches
                ORDER BY order_index ASC, created_at ASC
            `);

            return rows.map((row: any) => ({
                id: row.id,
                name: row.name,
                title: row.title,
                bio: row.bio || '',
                image: row.image || '',
                experience: row.experience || '',
                certifications: parseJSONField(row.certifications, []),
                isHeadCoach: !!row.isHeadCoach,
                order_index: row.order_index || 0,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } catch (error) {
            logger.error('Error fetching coaches from MySQL:', error);
            throw error;
        }
    },

    async getById(id: string | number): Promise<ICoach | null> {
        try {
            const rows = await query<any>(
                'SELECT id, name, title, bio, image, experience, certifications, isHeadCoach, order_index, created_at, updated_at FROM coaches WHERE id = ?',
                [id]
            );

            if (!rows || rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                name: row.name,
                title: row.title,
                bio: row.bio || '',
                image: row.image || '',
                experience: row.experience || '',
                certifications: parseJSONField(row.certifications, []),
                isHeadCoach: !!row.isHeadCoach,
                order_index: row.order_index || 0,
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (error) {
            logger.error('Error fetching coach from MySQL:', error);
            throw error;
        }
    },

    async create(data: ICoach): Promise<number> {
        try {
            // Sanitize user input to prevent XSS
            const sanitizedData = {
                ...data,
                name: sanitizeInput(data.name),
                title: sanitizeInput(data.title),
                bio: data.bio ? sanitizeInput(data.bio) : '',
                experience: data.experience ? sanitizeInput(data.experience) : '',
            };

            const result = await execute(`
                INSERT INTO coaches (name, title, bio, image, experience, certifications, isHeadCoach, order_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                sanitizedData.name,
                sanitizedData.title,
                sanitizedData.bio || '',
                sanitizedData.image || '',
                sanitizedData.experience || '',
                stringifyJSONField(sanitizedData.certifications),
                sanitizedData.isHeadCoach ? 1 : 0,
                sanitizedData.order_index || 0
            ]);

            return result.insertId;
        } catch (error) {
            logger.error('Error creating coach in MySQL:', error);
            throw error;
        }
    },

    async update(id: string | number, data: Partial<ICoach>): Promise<boolean> {
        try {
            const updates: string[] = [];
            const params: any[] = [];

            if (data.name !== undefined) {
                updates.push('name = ?');
                params.push(sanitizeInput(data.name));
            }
            if (data.title !== undefined) {
                updates.push('title = ?');
                params.push(sanitizeInput(data.title));
            }
            if (data.bio !== undefined) {
                updates.push('bio = ?');
                params.push(sanitizeInput(data.bio));
            }
            if (data.image !== undefined) {
                updates.push('image = ?');
                params.push(data.image);
            }
            if (data.experience !== undefined) {
                updates.push('experience = ?');
                params.push(sanitizeInput(data.experience));
            }
            if (data.certifications !== undefined) {
                updates.push('certifications = ?');
                params.push(stringifyJSONField(data.certifications));
            }
            if (data.isHeadCoach !== undefined) {
                updates.push('isHeadCoach = ?');
                params.push(data.isHeadCoach ? 1 : 0);
            }
            if (data.order_index !== undefined) {
                updates.push('order_index = ?');
                params.push(data.order_index);
            }

            if (updates.length === 0) return true;

            params.push(id);

            const result = await execute(
                `UPDATE coaches SET ${updates.join(', ')} WHERE id = ?`,
                params
            );

            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error updating coach in MySQL:', error);
            throw error;
        }
    },

    async delete(id: string | number): Promise<boolean> {
        try {
            const result = await execute('DELETE FROM coaches WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error('Error deleting coach from MySQL:', error);
            throw error;
        }
    },

    async reorder(coachIds: number[]): Promise<boolean> {
        try {
            for (let i = 0; i < coachIds.length; i++) {
                await execute('UPDATE coaches SET order_index = ? WHERE id = ?', [i, coachIds[i]]);
            }
            return true;
        } catch (error) {
            logger.error('Error reordering coaches:', error);
            throw error;
        }
    }
};

// ==================== SUBSCRIPTIONS (derived from players) ====================

// Payment record interface
interface PaymentRecord {
    month: string;      // YYYY-MM format
    amount: number;
    status: 'paid' | 'unpaid';
    paymentDate: string | null;
    notes?: string;
}

export const SubscriptionService = {
    async getAll(): Promise<any[]> {
        try {
            const rows = await query<any>(`
                SELECT
                    id, name, age, position,
                    subscription_type as subscriptionType,
                    subscription_amount as subscriptionAmount,
                    subscription_status as subscriptionStatus,
                    subscription_lastPayment as subscriptionLastPayment,
                    subscription_notes as subscriptionNotes,
                    payment_history as paymentHistory,
                    isActive,
                    joinDate
                FROM players
                WHERE isActive = 1
                ORDER BY created_at DESC
            `);

            return rows.map((row: any) => ({
                id: row.id,
                player_id: row.id,
                player_name: row.name,
                player_age: row.age,
                player_position: row.position,
                type: row.subscriptionType || 'شهري',
                amount: parseFloat(row.subscriptionAmount) || 20,
                // Current status (for backward compatibility)
                status: row.subscriptionStatus || 'unpaid',
                last_payment: row.subscriptionLastPayment,
                notes: row.subscriptionNotes || '',
                isActive: !!row.isActive,
                joinDate: row.joinDate,
                // Payment history - array of monthly payment records
                paymentHistory: parseJSONField<PaymentRecord[]>(row.paymentHistory, [])
            }));
        } catch (error) {
            logger.error('Error fetching subscriptions from MySQL:', error);
            throw error;
        }
    },

    // Get payment status for a specific player and month
    getPaymentStatusForMonth(player: any, month: string): { paid: boolean, paymentDate: string | null, amount: number } {
        const paymentHistory = player.paymentHistory || [];

        // Find payment record for this specific month
        const monthlyPayment = paymentHistory.find((p: PaymentRecord) => p.month === month);

        if (monthlyPayment) {
            return {
                paid: monthlyPayment.status === 'paid',
                paymentDate: monthlyPayment.paymentDate,
                amount: monthlyPayment.amount
            };
        }

        // Fallback: check if there's any payment and the current status
        return {
            paid: player.status === 'paid',
            paymentDate: player.last_payment,
            amount: player.amount
        };
    },

    // Add or update a payment record for a specific month
    async recordPayment(playerId: string | number, month: string, data: {
        amount: number;
        status: 'paid' | 'unpaid';
        paymentDate: string | null;
        notes?: string;
    }): Promise<boolean> {
        try {
            // Get current player data
            const rows = await query<any>(
                'SELECT payment_history FROM players WHERE id = ?',
                [playerId]
            );

            if (!rows || rows.length === 0) return false;

            const paymentHistory: PaymentRecord[] = parseJSONField(rows[0].paymentHistory, []);

            // Find existing record for this month
            const existingIndex = paymentHistory.findIndex(p => p.month === month);

            if (existingIndex >= 0) {
                // Update existing record
                paymentHistory[existingIndex] = {
                    month,
                    amount: data.amount,
                    status: data.status,
                    paymentDate: data.paymentDate,
                    notes: data.notes
                };
            } else {
                // Add new record
                paymentHistory.push({
                    month,
                    amount: data.amount,
                    status: data.status,
                    paymentDate: data.paymentDate,
                    notes: data.notes
                });
            }

            // Update database
            await execute(
                'UPDATE players SET payment_history = ?, subscription_status = ?, subscription_lastPayment = ? WHERE id = ?',
                [JSON.stringify(paymentHistory), data.status, data.paymentDate, playerId]
            );

            return true;
        } catch (error) {
            logger.error('Error recording payment:', error);
            return false;
        }
    }
};

// ==================== UNIFIED DATA SERVICE (for backward compatibility) ====================

export const DataService = {
    async getPlayers() {
        return await PlayerService.getAll();
    },

    async getNews(onlyPublished: boolean = false) {
        return await NewsService.getAll(onlyPublished);
    },

    async getRegistrations() {
        return await RegistrationService.getAll();
    },

    async getSettings() {
        return await SettingService.get();
    },

    async getSubscriptions() {
        return await SubscriptionService.getAll();
    },

    async getCoaches() {
        return await CoachService.getAll();
    }
};
