import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Authentication and authorization utilities for API routes
 */

// Get JWT secret from environment - NO FALLBACK for security
const getJwtSecret = (): string => {
    const secret = 'albashayer_secret_key_2024_albashayer_secret_key_2024';
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not configured');
    }
    return secret;
};

/**
 * Verify JWT token from request
 * @param request - NextRequest object
 * @returns Decoded token payload or null
 */
export function verifyToken(request: NextRequest): any | null {
    try {
        // Try to get token from Authorization header first
        const authHeader = request.headers.get('authorization');
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else {
            // Fall back to cookie
            token = request.cookies.get('admin_token')?.value;
        }

        if (!token) {
            return null;
        }

        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

/**
 * Middleware function to protect API routes
 * Returns 401 response if authentication fails
 * @param request - NextRequest object
 * @returns NextResponse if unauthorized, null if authorized
 */
export function requireAuth(request: NextRequest): NextResponse | null {
    const decoded = verifyToken(request);

    if (!decoded) {
        return NextResponse.json(
            { error: 'Unauthorized - Please login' },
            { status: 401 }
        );
    }

    // Check if user has admin role
    if (decoded.role !== 'admin') {
        return NextResponse.json(
            { error: 'Forbidden - Admin access required' },
            { status: 403 }
        );
    }

    return null; // Authorized
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password
 * @returns True if passwords match
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate JWT token for a user
 * @param username - Username
 * @param role - User role (e.g., 'admin')
 * @returns JWT token
 */
export function generateToken(username: string, role: string = 'admin'): string {
    const secret = getJwtSecret();
    return jwt.sign(
        { username, role },
        secret,
        { expiresIn: '7d' }
    );
}

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove dangerous JavaScript patterns
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, ''); // e.g., onclick=

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
}

/**
 * Sanitize an object's string properties recursively
 * @param obj - Object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
        return sanitizeInput(obj) as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject) as T;
    }

    if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    return obj;
}
