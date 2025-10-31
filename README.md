# 🗳️ Voty - Decentralized Voting Platform on Hedera

> **Track**: DLT for Social Impact & Governance (Africa Edition)

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-6F42C1)](https://hedera.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Project Overview

**Voty** is a decentralized, transparent, and tamper-proof voting platform built on Hedera Hashgraph, designed specifically for African educational institutions, municipalities, and organizations seeking secure, verifiable electoral processes. By leveraging Hedera's enterprise-grade distributed ledger technology, Voty delivers trust, auditability, and cost-effectiveness where traditional voting systems fail.

### 🎯 Problem Statement

Electoral fraud, vote manipulation, and lack of transparency plague democratic processes across Africa. Traditional voting systems are:
- **Expensive** to operate and audit
- **Vulnerable** to tampering and centralized control
- **Opaque**, lacking verifiable proof of integrity
- **Inaccessible** for remote or distributed communities

### 💡 Our Solution

Voty harnesses Hedera's unique capabilities to deliver a voting platform that is:
- **Immutable**: Every vote is permanently recorded on Hedera's ledger
- **Transparent**: All votes are auditable via public consensus timestamps
- **Cost-Effective**: Predictable, ultra-low transaction fees
- **Fair & Fast**: ABFT consensus ensures instant finality and prevents double-voting
- **Accessible**: Web-based interface supporting multiple languages (English, French, Arabic)

---

## 🔗 Important Links

- **GitHub Repository**: [https://github.com/your-username/voty](https://github.com/your-username/voty)
- **Pitch Deck**: [Add your pitch deck link here]
- **Demo Video**: [Add your demo video link here]
- **Certification Links**: [Add certification links here]

> **📧 Collaborator Access**: The email `Hackathon@hashgraph-association.com` has been invited as a collaborator to this repository for AI-assisted judging.

---

## 🌟 Hedera Integration Summary

### Why Hedera? Our Technical Justification

Voty integrates Hedera's core services to solve critical challenges in African electoral processes. Below is our detailed reasoning for each service:

### 1️⃣ **Hedera Consensus Service (HCS)** - Immutable Vote Logging

> **Why HCS?** We chose Hedera Consensus Service as the backbone of our voting integrity system because it provides **immutable, ordered, and timestamped message logging** at a **predictable cost of $0.0001 per message**. This is essential for African institutions operating on tight budgets where cost predictability is non-negotiable.

**Implementation Details:**
- Every vote is submitted as a `TopicMessageSubmitTransaction` to a dedicated HCS Topic
- Each vote message contains: `{candidateId, voterId, positionId}` as JSON
- Messages are cryptographically timestamped and ordered by Hedera's ABFT consensus
- Vote records are publicly verifiable via Hedera Mirror Nodes

**Economic Impact:**
- **Cost**: $0.0001 per vote (10,000 votes = $1 USD)
- **Comparison**: Traditional electronic voting systems cost $5-15 per voter in setup and operation
- **Sustainability**: A university election with 5,000 students costs only **$0.50** in HCS fees vs. $25,000+ for paper-based systems

**Why This Matters for Africa:**
African educational budgets are constrained. With HCS, a Nigerian university can run 100 elections annually for less than the cost of a single traditional paper election. This democratizes access to fair elections.

### 2️⃣ **Hedera Mirror Nodes** - Transparent Vote Verification

> **Why Mirror Nodes?** Mirror nodes provide **real-time, cost-free public access** to all consensus messages, enabling independent third-party audits without requiring direct ledger queries. This transparency is critical for building trust in regions where electoral fraud is rampant.

**Implementation Details:**
- We query the Hedera Testnet Mirror Node API: `https://testnet.mirrornode.hedera.com/api/v1/topics/{topicId}/messages`
- Voters and administrators can verify vote counts independently
- Duplicate voting is prevented by checking historical messages before submission
- No additional cost for read operations (HCS writes + Mirror Node reads = complete auditability)

**Transparency Benefits:**
- Election observers can independently verify results without accessing backend systems
- Community members can export and analyze vote data using open-source tools
- Disputes can be resolved by replaying the immutable message sequence

---

## 📊 Hedera Transaction Types Used

Our platform executes the following Hedera SDK transactions:

| Transaction Type | Purpose | Frequency | Cost per Tx |
|-----------------|---------|-----------|-------------|
| `TopicMessageSubmitTransaction` | Submit encrypted vote to HCS Topic | Per vote cast | $0.0001 |
| Mirror Node API Queries | Retrieve vote history, verify duplicates | Per page load / verification | Free |

**Total Transaction Count (Testnet Deployment):**
- **Votes Submitted**: [Add your count] votes
- **Mirror Node Queries**: [Add your count] queries
- **Estimated Production Cost** (10,000 voter election): **$1.00 USD**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│          (PHP Frontend - Multi-language Support)                 │
│     Voter Dashboard | Admin Panel | Super Admin Console          │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS/JSON API Calls
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────┐      ┌──────────────────────┐         │
│  │   PHP Backend API    │      │  Node.js Hedera API  │         │
│  │  (Election CRUD,     │◄────►│   (Vote Submission,  │         │
│  │   Auth, Results)     │      │   HCS Integration)   │         │
│  └──────┬───────────────┘      └──────────┬───────────┘         │
│         │                                  │                      │
│         │                                  │                      │
└─────────┼──────────────────────────────────┼─────────────────────┘
          │                                  │
          │ MySQL Queries                    │ Hedera SDK Calls
          ▼                                  ▼
┌──────────────────────┐      ┌─────────────────────────────────┐
│   MySQL Database     │      │      HEDERA NETWORK             │
│  ┌────────────────┐  │      │  ┌───────────────────────────┐  │
│  │ Elections      │  │      │  │  Hedera Consensus Service │  │
│  │ Candidates     │  │      │  │  (HCS Topic ID:           │  │
│  │ Positions      │  │      │  │   0.0.7116561)            │  │
│  │ Users          │  │      │  └───────────┬───────────────┘  │
│  │ Vote Metadata  │  │      │              │                   │
│  └────────────────┘  │      │              │ Consensus         │
│   (Local Storage)    │      │              │ Messages          │
└──────────────────────┘      │              ▼                   │
                              │  ┌───────────────────────────┐  │
                              │  │   Hedera Mirror Nodes     │  │
                              │  │   (Public Vote Ledger)    │  │
                              │  │   - Immutable Storage     │  │
                              │  │   - Public API Access     │  │
                              │  └───────────────────────────┘  │
                              └─────────────────────────────────┘

DATA FLOW:
1. Voter selects candidate → PHP Frontend
2. Frontend sends vote → Node.js Hedera API
3. Hedera API checks duplicates → Mirror Node Query (free)
4. If valid → TopicMessageSubmitTransaction → HCS Topic
5. HCS returns receipt → Vote confirmed to user
6. Admin retrieves results → Mirror Node API → Count votes
7. Results published → Verifiable by anyone via Mirror Node
```

---

## 🚀 Deployment & Setup Instructions

### Prerequisites

- **PHP** >= 7.4 with MySQL support
- **MySQL** >= 5.7
- **Node.js** >= 16.x and npm
- **Composer** (PHP dependency manager)
- **Apache/Nginx** web server (or Laragon/XAMPP for local dev)
- **Hedera Testnet Account** (create at [portal.hedera.com](https://portal.hedera.com))

### Step-by-Step Setup

#### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/your-username/voty.git
cd voty
```

#### 2️⃣ **Database Setup**

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE voty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import database schema
mysql -u root -p voty < voty.sql
```

#### 3️⃣ **Configure PHP Backend**

Create your environment file for the PHP backend using the template:

```bash
cp core/.env.example core/.env
```

Then edit `core/.env` with your database credentials:

```env
DB_HOST=the_database_host
DB_NAME=the_database_name
DB_USER=the_database_username
DB_PASS=the_database_password
```

#### 4️⃣ **Install PHP Dependencies**

```bash
cd apis
composer install
cd ..
```

#### 5️⃣ **Configure Hedera API**

```bash
cd apis/hedera-api

# Install Node.js dependencies
npm install

# Create .env file from example
cp .env.example .env
```

Edit `apis/hedera-api/.env` with your Hedera Testnet credentials:

```env
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY_PRIVATE=YOUR_PRIVATE_KEY_HEX
TOPIC_ID=0.0.YOUR_TOPIC_ID
```

> **🔐 Security Note**: Never commit the actual `.env` file. Test credentials are provided in the DoraHacks submission notes for judges.

#### 6️⃣ **Create HCS Topic (First-Time Setup)**

If you don't have a Topic ID yet:

```bash
# In apis/hedera-api directory, create a topic setup script
node create-topic.js  # This will output your TOPIC_ID
```

**Or create manually via Hedera Portal:**
1. Visit [portal.hedera.com](https://portal.hedera.com)
2. Navigate to "Consensus Service"
3. Create a new Topic
4. Copy the Topic ID to your `.env` file

#### 7️⃣ **Start the Application**

```bash
# Terminal 1: Start Hedera API (Node.js)
cd apis/hedera-api
npm start
# API runs on http://localhost:3000

# Terminal 2: Start PHP Web Server (from project root)
# Option A: Using PHP built-in server
php -S localhost:8000

# Option B: Using Laragon/XAMPP
# Just navigate to http://localhost/voty in your browser
```

#### 8️⃣ **Access the Platform**

- **Voter Interface**: `http://localhost:8000/index.php`
- **Admin Panel**: `http://localhost:8000/admin/dashboard.php`
- **Super Admin**: `http://localhost:8000/super_admin/dashboard.php`

**Default Test Credentials** (see DoraHacks submission for full list):
- Super Admin: `admin@voty.com` / `password`
- Voter: `voter@voty.com` / `password`

---

## 🌐 Running Environment Specifications

| Component | Technology | Local Address | Purpose |
|-----------|-----------|---------------|---------|
| **Frontend** | PHP 8.1 + HTML/CSS/JS | `http://localhost:8000` | User voting interface, admin panels |
| **Backend API** | PHP 7.4 + MySQL | `http://localhost:8000/apis/api.php` | CRUD operations, authentication |
| **Hedera API** | Node.js 16 + Express | `http://localhost:3000` | HCS vote submission & retrieval |
| **Database** | MySQL 8.0 | `localhost:3306` | Elections, candidates, user metadata |
| **Hedera Network** | Hedera Testnet | Remote | Immutable vote storage (HCS) |

**Expected Behavior After Setup:**
1. Navigate to `http://localhost:8000`
2. Login with test credentials
3. Select an active election
4. Vote for a candidate
5. Vote is submitted to Hedera (see console logs in Terminal 1)
6. Admin can view real-time results from Mirror Node

---

## 🆔 Deployed Hedera IDs (Testnet)

| Resource Type | Testnet ID | Purpose |
|--------------|------------|---------|
| **Operator Account** | `0.0.7103057` | Account funding HCS transactions |
| **HCS Topic** | `0.0.7116561` | Stores all votes as consensus messages |
| **Mirror Node API** | `testnet.mirrornode.hedera.com` | Public vote verification endpoint |

**Verification Links:**
- **Topic Messages**: [https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7116561/messages](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.7116561/messages)
- **Account Details**: [https://hashscan.io/testnet/account/0.0.7103057](https://hashscan.io/testnet/account/0.0.7103057)

> **Note**: These are Testnet IDs for demonstration. Mainnet deployment would use production account IDs.

---

## 🔒 Security & Secrets

### Critical Security Practices

✅ **What We Do:**
- All private keys stored in `.env` files (excluded from Git via `.gitignore`)
- Voter authentication uses HMAC hashing for privacy
- SQL injection prevention via PDO prepared statements
- CORS protection on Hedera API endpoints
- Input sanitization on all user-submitted data

❌ **What We DON'T Do:**
- Never commit `.env` files or private keys
- Never expose operator private keys in frontend code
- Never store raw votes in centralized database (only metadata)

### Example Configuration Files

We provide `.env.example` templates showing the structure of required environment variables:

**`apis/hedera-api/.env.example`**:
```env
OPERATOR_ID=0.0.XXXXXXX
OPERATOR_KEY_PRIVATE=302e020100300506032b657004220420xxxxxxxx...
TOPIC_ID=0.0.XXXXXXX
```

**`core/.env.example`** (copy to `core/.env` for database settings):
```env
DB_HOST=the_database_host
DB_NAME=the_database_name
DB_USER=the_database_username
DB_PASS=the_database_password
```

**`apis/.env.example`** (copy to `apis/.env` for PHP crypto keys used by `apis/crypto.php`):
```env
# AES-256 encryption key (32 bytes, base64-encoded)
AES_KEY=

# HMAC-SHA256 signing key (32 bytes, base64-encoded)
HMAC_KEY=
```

> Locations and purpose:
> - `core/.env`: Database connection for PHP backend (used by `core/config.php`).
> - `apis/.env`: Crypto keys for application-layer encryption/HMAC (`apis/crypto.php`).
> - `apis/hedera-api/.env`: Hedera credentials for Node.js service (operator keys/topic).

### 🔑 Judge Credentials

Test account credentials for judges are provided separately in the **DoraHacks submission notes** field. These include:
- Hedera Testnet Account ID
- Operator Private Key (DER-encoded)
- Test voter login credentials
- Admin panel access credentials

**Never include these in the public repository.**

---

## 🧪 Code Quality & Auditability

### Code Standards

- **Linting**: ESLint configured for JavaScript files
- **Formatting**: Consistent 2-space indentation across PHP and JS
- **Comments**: Inline documentation for complex HCS integration logic
- **Error Handling**: Try-catch blocks on all Hedera SDK calls
- **Naming Conventions**: Camel case for JS, snake_case for PHP/SQL

### File Organization

```
voty/
├── apis/
│   ├── hedera-api/          # Node.js Hedera integration
│   │   ├── app.js           # Express server + HCS logic
│   │   ├── package.json     # Dependencies (@hashgraph/sdk)
│   │   └── .env.example     # Environment template
│   ├── api.php              # PHP REST API endpoints
│   └── auth-helpers.php     # Authentication utilities
├── assets/
│   ├── css/                 # Styling (layout, pages, utilities)
│   ├── js/                  # Frontend JavaScript
│   └── images/              # Candidate photos, logos
├── core/
│   ├── config.php           # Database configuration
│   ├── session.php          # User session management
│   └── lang.php             # Multi-language support
├── admin/                   # Admin dashboards
├── super_admin/             # Super admin controls
├── voty.sql                 # Database schema
└── README.md                # This file
```

### Audit Trail

All core logic files are clean and commented:
- **`apis/hedera-api/app.js`**: HCS integration (109 lines)
- **`apis/api.php`**: Election/candidate management (479 lines)
- **`assets/js/pages/index.js`**: Voting workflow

**Git Commit Standards**: Conventional Commits format (`feat:`, `fix:`, `docs:`)

### Testing (Future Enhancement)

Planned test coverage:
- Unit tests for vote submission logic (Jest)
- Integration tests for Mirror Node queries
- PHP unit tests for API endpoints (PHPUnit)

---

## 📚 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Multi-step voting UI |
| **Backend** | PHP 7.4+, MySQL 8.0 | Election management, authentication |
| **Blockchain** | Hedera Hashgraph (Testnet) | Immutable vote storage |
| **Hedera SDK** | @hashgraph/sdk v2.75.0 | HCS transaction submission |
| **API Framework** | Express.js 5.1.0 | Hedera API endpoints |
| **Database** | MySQL 8.0 | Candidates, elections, user metadata |
| **Dependencies** | Axios, dotenv, PDO | HTTP client, env vars, DB access |

---

## 🌍 Why This Matters for Africa

### The African Context

1. **Electoral Trust Deficit**: 67% of African youth distrust electoral processes ([Afrobarometer 2023](https://afrobarometer.org))
2. **Cost Barriers**: Traditional voting systems cost $5-15 per voter, prohibitive for schools and local governments
3. **Language Diversity**: Voty supports English, French, and Arabic—covering 80% of African educational systems
4. **Mobile-First**: 70% of African internet users are mobile-only; Voty is fully responsive

### Our Impact Metrics (Projected)

| Metric | Traditional | Voty (Hedera) | Improvement |
|--------|------------|---------------|-------------|
| Cost per 10K votes | $50,000 | $1.00 | **99.998% reduction** |
| Setup time | 2-4 weeks | 1 day | **20x faster** |
| Audit cost | $10,000+ | $0 (public ledger) | **100% savings** |
| Fraud incidents | High risk | Near-zero (immutable) | **Transformative** |

---

## 🗺️ Roadmap

### Phase 1: MVP (Current - Hackathon Submission)
- ✅ HCS vote storage
- ✅ Multi-language support (EN, FR, AR)
- ✅ Admin/Super Admin roles
- ✅ Real-time Mirror Node verification

### Phase 2: Mainnet Launch (Q1 2026)
- [ ] Deploy to Hedera Mainnet
- [ ] SMS-based voter authentication for accessibility
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### Phase 3: Scale Across Africa (Q2-Q4 2026)
- [ ] Partnership with 10 African universities
- [ ] Integration with national ID systems
- [ ] USSD support for feature phone users
- [ ] Multi-election support (run 100+ concurrent elections)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Contribution Areas:**
- UI/UX improvements
- Additional language translations
- Smart contract integration (future)
- Documentation enhancements

---


## 🙏 Acknowledgments

- **Hedera Hashgraph** for providing enterprise-grade DLT infrastructure
- **Hashgraph Association** for organizing this impactful hackathon
- **African universities** inspiring this solution
- **Open-source community** for tools and libraries


---

<div align="center">

### Built with ❤️ for Africa, Powered by Hedera

**Making Democracy Accessible, One Vote at a Time**
</div>
