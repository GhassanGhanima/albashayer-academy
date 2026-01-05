# Albashayer Academy - Deployment Guide

This guide provides step-by-step instructions for deploying the Albashayer Academy application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Build Process](#build-process)
5. [Production Deployment](#production-deployment)
6. [Health Checks](#health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or higher
- MySQL 8.0 or higher
- Git
- A production server (VPS, cloud hosting, or platform like Vercel/Railway)
- Basic knowledge of command line operations

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd albashayer-academy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```bash
# Database Configuration
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_DATABASE=albashayer_academy
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_secure_password

# JWT Secret (CRITICAL: Generate a secure random string)
JWT_SECRET=your_generated_jwt_secret_at_least_32_chars

# Application Environment
NODE_ENV=production
```

#### Generate Secure JWT Secret

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Verify Environment Variables

Start the application to verify all environment variables are set:

```bash
npm run build
```

If any required environment variables are missing, the build will fail with an error.

---

## Database Configuration

### 1. Create Database

```sql
CREATE DATABASE albashayer_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Database User (Optional but Recommended)

```sql
CREATE USER 'albashayer_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON albashayer_academy.* TO 'albashayer_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Initialize Tables

The application will automatically create tables on first run. To verify:

```bash
# After starting the application, check MySQL
mysql -u root -p
USE albashayer_academy;
SHOW TABLES;
```

Expected tables:
- `players`
- `news`
- `registrations`
- `settings`
- `coaches`

---

## Build Process

### 1. Run Production Build

```bash
npm run build
```

This will:
- Compile TypeScript
- Optimize assets
- Generate static pages
- Create production bundle
- Check for errors

**Expected Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    X kB          X kB
├ ○ /api/health                          X kB          X kB
└ ○ /...                                 X kB          X kB
✓ Compiled successfully
```

### 2. If Build Fails

Check for:
- Missing environment variables
- TypeScript errors
- Dependency issues
- Syntax errors

---

## Production Deployment

### Option 1: Traditional VPS/Server

#### 1. Build the Application

```bash
npm run build
```

#### 2. Start Production Server

```bash
npm start
```

The application will run on `http://localhost:3000`

#### 3. Use Process Manager (PM2)

Install PM2:
```bash
npm install -g pm2
```

Start with PM2:
```bash
pm2 start npm --name "albashayer-academy" -- start
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 status              # Check status
pm2 logs albashayer-academy    # View logs
pm2 restart albashayer-academy  # Restart
pm2 stop albashayer-academy     # Stop
```

#### 4. Set Up Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
vercel
```

Follow the prompts and set environment variables in the Vercel dashboard.

#### 3. Set Environment Variables in Vercel Dashboard

Go to: Project Settings > Environment Variables

Add:
- `MYSQL_HOST`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `JWT_SECRET`

### Option 3: Docker

#### 1. Create Dockerfile (if not exists)

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### 2. Build and Run

```bash
docker build -t albashayer-academy .
docker run -p 3000:3000 --env-file .env albashayer-academy
```

---

## Health Checks

### Health Check Endpoint

The application includes a health check endpoint at `/api/health`

#### Check Health Status

```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 123.456,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responseTime": 15
}
```

**Error Response:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Database connection failed"
}
```

### Setting Up Health Check Monitoring

#### Using Uptime Monitoring Services

Configure services like:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor: `https://your-domain.com/api/health`

Expected: HTTP 200 with JSON response

---

## Production Checklist

Before going live, ensure:

### Security
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Strong MySQL password
- [ ] Environment variables not committed to git
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled
- [ ] Database user has limited privileges (not root)
- [ ] CORS configured properly
- [ ] Rate limiting implemented (if needed)

### Performance
- [ ] Images optimized
- [ ] Build completed successfully
- [ ] Database indexes created
- [ ] Caching configured
- [ ] CDN configured for static assets (if applicable)

### Monitoring
- [ ] Health check endpoint accessible
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Logging configured
- [ ] Uptime monitoring setup

### Functionality
- [ ] All API endpoints working
- [ ] Authentication working correctly
- [ ] File upload working
- [ ] Database operations working
- [ ] Email configured (if applicable)
- [ ] All forms working

### Content
- [ ] Initial admin account created
- [ ] Settings configured
- [ ] Default content added (players, news, coaches)
- [ ] Images uploaded
- [ ] Site information updated (name, slogan, contact)

---

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
```
Solution: Check .env file contains all required variables
```

**Error: TypeScript compilation error**
```
Solution: Run npm run lint to identify issues
```

### Database Connection Issues

**Error: ECONNREFUSED**
```
Solution: Check MySQL is running and accessible
Solution: Verify MYSQL_HOST and MYSQL_PORT
```

**Error: Access denied**
```
Solution: Verify MYSQL_USER and MYSQL_PASSWORD
Solution: Check database user permissions
```

### Application Won't Start

**Error: Port 3000 already in use**
```
Solution: Kill process using port 3000
Solution: Use different port with PORT=4000 npm start
```

### Health Check Returns Error

**Database disconnected**
```
Solution: Check MySQL service status
Solution: Verify database credentials
Solution: Check network connectivity
```

---

## Maintenance

### Regular Tasks

#### Daily
- Check health status: `curl /api/health`
- Review error logs
- Monitor disk space

#### Weekly
- Backup database
- Review and rotate logs
- Check for security updates
- Monitor performance metrics

#### Monthly
- Update dependencies: `npm update`
- Review and optimize database
- Clean up old uploads (if needed)
- Review security settings

### Database Backup

```bash
# Backup
mysqldump -u root -p albashayer_academy > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p albashayer_academy < backup_20240115.sql
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart service
pm2 restart albashayer-academy
```

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Check database connectivity
4. Verify environment variables

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate JWT_SECRET** periodically (every 90 days)
3. **Use strong passwords** for database and admin accounts
4. **Enable HTTPS** in production
5. **Keep dependencies updated** to patch security vulnerabilities
6. **Monitor logs** for suspicious activity
7. **Implement rate limiting** on API endpoints
8. **Regular backups** of database and uploaded files
9. **Use firewall** to restrict database access
10. **Disable debug mode** in production

---

## Performance Optimization Tips

1. **Enable gzip compression** (included in next.config.js)
2. **Use image optimization** (configured in next.config.js)
3. **Implement database query caching**
4. **Use CDN** for static assets
5. **Enable HTTP/2**
6. **Minimize JavaScript bundle size**
7. **Use lazy loading** for images and components
8. **Optimize database queries** with proper indexes

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0
