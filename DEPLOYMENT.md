# Railway Deployment Guide

## Prerequisites
1. GitHub account
2. Railway account (sign up at https://railway.app)

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### 2. Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `voty` repository
5. Railway will automatically detect the configuration

### 3. Add MySQL Database
1. In your Railway project, click "New"
2. Select "Database" → "Add MySQL"
3. Railway will create a MySQL instance

### 4. Configure Environment Variables
Click on your web service → "Variables" tab and add:

**For Node.js API (apis/hedera-api/.env):**
- `OPERATOR_ID` = Your Hedera operator ID (e.g., 0.0.7103057)
- `OPERATOR_KEY_PRIVATE` = Your Hedera private key
- `TOPIC_ID` = Your Hedera topic ID (e.g., 0.0.7168101)

**For PHP API (apis/.env):**
- `AES_KEY` = Your AES encryption key
- `HMAC_KEY` = MDlTP61eci5WNISwoI4z46S4fsXr146KgUSPUDhEXXc= (from seeded user)

**Database Connection (Railway auto-provides these):**
- `MYSQL_HOST` = (auto-set by Railway)
- `MYSQL_PORT` = (auto-set by Railway)
- `MYSQL_DATABASE` = (auto-set by Railway)
- `MYSQL_USER` = (auto-set by Railway)
- `MYSQL_PASSWORD` = (auto-set by Railway)

### 5. Import Database
1. In Railway, click on your MySQL service
2. Go to "Data" tab
3. Click "Import" and upload `voty.sql`

OR use MySQL client:
```bash
mysql -h [RAILWAY_MYSQL_HOST] -P [PORT] -u [USER] -p[PASSWORD] [DATABASE] < voty.sql
```

### 6. Update Database Connection in PHP
You'll need to update your PHP files to use Railway's MySQL environment variables:

In your database connection files, use:
```php
$host = getenv('MYSQL_HOST') ?: 'localhost';
$port = getenv('MYSQL_PORT') ?: '3306';
$dbname = getenv('MYSQL_DATABASE') ?: 'voty';
$username = getenv('MYSQL_USER') ?: 'root';
$password = getenv('MYSQL_PASSWORD') ?: '';
```

### 7. Deploy
Railway will automatically deploy after you push to GitHub. You can also manually trigger deployment from the Railway dashboard.

### 8. Access Your Site
Railway will provide you with a public URL like: `https://voty-production.up.railway.app`

## Important Notes

- **Free Tier Limits**: 500 hours/month, $5 credit
- **Estimated Usage**: Should last 20+ days for review purposes
- **Static Domain**: Your Railway URL won't change
- **Auto-Deploy**: Pushes to GitHub automatically redeploy

## Troubleshooting

### If deployment fails:
1. Check "Deployments" tab for error logs
2. Verify all environment variables are set
3. Ensure database is imported correctly

### If PHP pages don't work:
Railway primarily runs the Node.js server. For PHP pages to work, you may need to:
1. Set up a separate PHP service, OR
2. Use the Node.js API as a proxy to PHP files

**Alternative**: Deploy only the Node.js API on Railway and keep PHP pages on ngrok temporarily.

## Cost Estimate
- **Free tier**: Good for ~20 days of continuous running
- **After free tier**: ~$5-10/month (but you only need a few days)

## Cleanup After Review
1. Go to Railway project settings
2. Click "Delete Project"
3. All resources will be removed (no charges)
