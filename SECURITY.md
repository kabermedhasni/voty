# Security Policy

## 🔒 Security Overview

Voty takes security seriously. This document outlines our security practices, known vulnerabilities, and how to report security issues.

## Supported Versions

| Version | Supported          | Notes |
| ------- | ------------------ | ----- |
| 1.0.x   | :white_check_mark: | Current release (Testnet) |
| < 1.0   | :x:                | Pre-release versions |

## Security Features

### 1. **Private Key Protection**
- ✅ All Hedera private keys stored in `.env` files (excluded from Git)
- ✅ Environment variables never exposed to frontend
- ✅ Operator keys only accessible to Node.js backend

### 2. **Database Security**
- ✅ PDO prepared statements prevent SQL injection
- ✅ Parameterized queries for all user inputs
- ✅ Database credentials in excluded config file
- ✅ Error messages sanitized (no stack traces in production)

### 3. **Authentication & Authorization**
- ✅ HMAC hashing for voter IDs (privacy protection)
- ✅ Role-based access control (User, Admin, Super Admin)
- ✅ Session-based authentication
- ✅ Permission checks on all sensitive endpoints

### 4. **Input Validation**
- ✅ All POST data sanitized with `htmlspecialchars()`
- ✅ File upload validation (allowed extensions, size limits)
- ✅ Type casting on numeric inputs
- ✅ CORS headers configured on API endpoints

### 5. **Blockchain Security**
- ✅ Vote immutability via Hedera Consensus Service
- ✅ Public auditability via Mirror Nodes
- ✅ Duplicate vote prevention (historical message check)
- ✅ Cryptographic timestamping of all votes

## Known Limitations (Testnet)

⚠️ **Testnet Deployment Considerations:**
- Private keys in `.env` are for Testnet only (no real value)
- Database configuration is local development setup
- Not hardened for production deployment yet

⚠️ **Future Enhancements Needed for Mainnet:**
- [ ] Multi-signature requirements for admin actions
- [ ] Hardware Security Module (HSM) for key storage
- [ ] Rate limiting on API endpoints
- [ ] DDoS protection
- [ ] Penetration testing and security audit
- [ ] Encrypted database columns for sensitive data
- [ ] Two-factor authentication (2FA)

## Reporting a Vulnerability

### How to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, please email security reports to:
- **Email**: security@voty.app (or contact info from DoraHacks submission)
- **Subject**: [SECURITY] Brief description
- **PGP Key**: [If available, add PGP key for encrypted communication]

### What to Include

1. **Description**: Detailed explanation of the vulnerability
2. **Impact**: Potential consequences if exploited
3. **Reproduction Steps**: How to reproduce the issue
4. **Proof of Concept**: Code or screenshots (if applicable)
5. **Suggested Fix**: If you have recommendations
6. **Your Contact Info**: For follow-up questions

### Response Timeline

| Step | Timeline |
|------|----------|
| **Initial Response** | Within 48 hours |
| **Triage & Validation** | Within 1 week |
| **Fix Development** | Varies by severity |
| **Patch Release** | Critical: 1-3 days<br>High: 1-2 weeks<br>Medium: 2-4 weeks<br>Low: Next release |
| **Public Disclosure** | 90 days after patch (or earlier if mutually agreed) |

### Severity Levels

**Critical (CVSS 9.0-10.0)**
- Remote code execution
- Authentication bypass
- Private key exposure

**High (CVSS 7.0-8.9)**
- SQL injection
- Cross-site scripting (XSS)
- Privilege escalation

**Medium (CVSS 4.0-6.9)**
- Information disclosure
- Denial of Service (DoS)
- Session hijacking

**Low (CVSS 0.1-3.9)**
- Minor information leaks
- UI/UX issues with security implications

## Security Best Practices for Developers

### When Contributing

1. **Never commit secrets**
   ```bash
   # Always check before committing:
   git diff --cached
   
   # If you accidentally committed a secret:
   git reset HEAD~1  # Undo commit (before push)
   ```

2. **Use environment variables**
   ```javascript
   // ❌ BAD
   const apiKey = '3030020100300706...';
   
   // ✅ GOOD
   const apiKey = process.env.OPERATOR_KEY_PRIVATE;
   ```

3. **Sanitize all inputs**
   ```php
   // ❌ BAD
   $query = "SELECT * FROM users WHERE id = {$_GET['id']}";
   
   // ✅ GOOD
   $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
   $stmt->execute([$_GET['id']]);
   ```

4. **Validate file uploads**
   ```php
   // ✅ GOOD
   $allowed = ['jpg', 'jpeg', 'png'];
   $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
   if (!in_array($ext, $allowed)) {
       throw new Exception('Invalid file type');
   }
   ```

### For Production Deployment

Before deploying to Mainnet:

- [ ] Rotate all keys and credentials
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Enable database encryption at rest
- [ ] Implement rate limiting
- [ ] Set up automated backups
- [ ] Configure Content Security Policy (CSP)
- [ ] Enable HTTP Strict Transport Security (HSTS)
- [ ] Regular security audits

## Security Updates

Subscribe to security updates:
- **GitHub Security Advisories**: Watch this repository
- **Email List**: [security-announce@voty.app]
- **Discord**: #security-alerts channel

## Acknowledgments

We appreciate responsible disclosure. Security researchers who report valid vulnerabilities will be:
- Listed in our Hall of Fame (with permission)
- Mentioned in release notes
- Eligible for bounty rewards (future program)

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Hedera Security Best Practices](https://docs.hedera.com/guides/core-concepts/keys-and-signatures)
- [PHP Security Guide](https://phpsecurity.readthedocs.io/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0
