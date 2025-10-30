# 🚀 Quick Setup Guide for Judges

This is a condensed setup guide to get Voty running in under 10 minutes.

## Prerequisites Checklist

- [ ] PHP >= 7.4 installed
- [ ] MySQL >= 5.7 installed
- [ ] Node.js >= 16.x installed
- [ ] Web server (Apache/Nginx/Laragon/XAMPP)

## 5-Minute Setup

### 1. Database Setup (2 minutes)

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE voty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p voty < voty.sql
```

### 2. Configure Database (1 minute)

```bash
# Copy config template
cp core/config.php.example core/config.php

# Edit core/config.php with your MySQL credentials
# Change: $username = 'root'; $password = 'yourpass';
```

### 3. Install Dependencies (3 minutes)

```bash
# PHP dependencies
cd apis && composer install && cd ..

# Node.js dependencies
cd apis/hedera-api && npm install && cd ../..
```

### 4. Configure Hedera (2 minutes)

```bash
cd apis/hedera-api

# Copy environment template
cp .env.example .env

# Edit .env with provided test credentials (see DoraHacks submission notes)
# Or use existing credentials:
# OPERATOR_ID=0.0.7103057
# OPERATOR_KEY_PRIVATE=3030020100300706052b8104000a04220420455d0d08e819e71b576a74a54bb7bae9727f1ab768fb12ce00f54946dda193c3
# TOPIC_ID=0.0.7116561
```

### 5. Start Application (1 minute)

```bash
# Terminal 1: Start Hedera API
cd apis/hedera-api
npm start
# ✅ API running on http://localhost:3000

# Terminal 2: Start PHP server (from project root)
php -S localhost:8000
# ✅ Web app running on http://localhost:8000
```

## Test the Platform

1. Navigate to: `http://localhost:8000`
2. Login with test credentials:
   - **Voter**: Use voter credentials from DoraHacks submission
   - **Admin**: Use admin credentials from DoraHacks submission
3. Select an active election
4. Cast a vote
5. Check vote on Hedera: [https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7116561/messages](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7116561/messages)

## Troubleshooting

### Port Already in Use
```bash
# Change Node.js port in apis/hedera-api/app.js (line 107)
const port = 3001; // Change from 3000

# Change PHP port
php -S localhost:8001 # Change from 8000
```

### Database Connection Failed
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `core/config.php`
- Ensure database 'voty' exists: `SHOW DATABASES;`

### Hedera API Errors
- Verify `.env` file exists in `apis/hedera-api/`
- Check OPERATOR_ID and TOPIC_ID format (must be `0.0.XXXXXX`)
- Ensure operator account has HBAR balance: [https://portal.hedera.com](https://portal.hedera.com)

### Permission Errors (Linux/Mac)
```bash
chmod +x apis/hedera-api/app.js
chmod -R 755 assets/images/
```

## Verification Checklist

After setup, verify:

- [ ] Web interface loads at `http://localhost:8000`
- [ ] Hedera API responds: `curl http://localhost:3000/api/get-votes`
- [ ] Can login with test credentials
- [ ] Can view elections list
- [ ] Vote submission returns success message
- [ ] Vote appears on Mirror Node within 5 seconds

## Quick Architecture Reference

```
Browser (localhost:8000)
    ↓
PHP Frontend + APIs
    ↓
Node.js Hedera API (localhost:3000)
    ↓
Hedera Testnet (HCS Topic: 0.0.7116561)
    ↓
Mirror Node (Public Verification)
```

## Need Help?

- **Full README**: See [README.md](README.md)
- **Contact**: [Provided in DoraHacks submission]
- **Video Demo**: [Link in README.md]

---

**Setup Time**: ~8 minutes | **Cost**: $0 (Testnet) | **Votes Ready**: Unlimited
