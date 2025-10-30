# 🏗️ Technical Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Hedera Integration Deep Dive](#hedera-integration-deep-dive)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security Architecture](#security-architecture)
7. [Performance & Scalability](#performance--scalability)
8. [Cost Analysis](#cost-analysis)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Voter UI     │  │ Admin Panel  │  │ Super Admin Dashboard    │  │
│  │ (index.php)  │  │ (admin/)     │  │ (super_admin/)           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                  │                     │                   │
│         └──────────────────┴─────────────────────┘                   │
│                            │                                          │
│                            │ HTTPS (JSON)                             │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                    APPLICATION LAYER                                  │
│                            │                                          │
│    ┌───────────────────────▼───────────────────────┐                 │
│    │     PHP Backend API (apis/api.php)            │                 │
│    │  - Election CRUD                              │                 │
│    │  - Candidate Management                       │                 │
│    │  - Authentication & Session                   │                 │
│    │  - Role-Based Access Control                  │                 │
│    └────────────┬──────────────────┬───────────────┘                 │
│                 │                  │                                  │
│                 │                  │                                  │
│    ┌────────────▼──────────┐  ┌───▼─────────────────────────┐        │
│    │  MySQL Database       │  │ Node.js Hedera API          │        │
│    │  ┌─────────────────┐  │  │ (apis/hedera-api/app.js)    │        │
│    │  │ elections       │  │  │                             │        │
│    │  │ candidates      │  │  │ - Vote Submission           │        │
│    │  │ positions       │  │  │ - Duplicate Detection       │        │
│    │  │ users           │  │  │ - Mirror Node Queries       │        │
│    │  │ election_admins │  │  └─────────────┬───────────────┘        │
│    │  │ users_election  │  │                │                        │
│    │  └─────────────────┘  │                │ Hedera SDK             │
│    └───────────────────────┘                │                        │
└─────────────────────────────────────────────┼────────────────────────┘
                                              │
                                              │
┌─────────────────────────────────────────────▼────────────────────────┐
│                        HEDERA NETWORK LAYER                           │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │          Hedera Consensus Service (HCS)                        │  │
│  │                                                                │  │
│  │  Topic ID: 0.0.7116561                                        │  │
│  │  Memo: "Voty - Decentralized Voting Platform"                 │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │  Consensus Messages (Immutable Vote Records)         │    │  │
│  │  │                                                      │    │  │
│  │  │  Message Format:                                     │    │  │
│  │  │  {                                                   │    │  │
│  │  │    "candidateId": 19,                                │    │  │
│  │  │    "voterId": "abc123def456...",  // HMAC hash      │    │  │
│  │  │    "positionId": 30                                  │    │  │
│  │  │  }                                                   │    │  │
│  │  │                                                      │    │  │
│  │  │  Encoding: JSON → UTF-8 → Base64 → HCS              │    │  │
│  │  │  Cost: $0.0001 per message                          │    │  │
│  │  │  Finality: ~3 seconds (ABFT)                        │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  │                          │                                     │  │
│  │                          │ Consensus Stream                    │  │
│  │                          ▼                                     │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │        Hedera Mirror Nodes (Public Archive)          │    │  │
│  │  │                                                      │    │  │
│  │  │  Endpoint: testnet.mirrornode.hedera.com            │    │  │
│  │  │  Path: /api/v1/topics/0.0.7116561/messages          │    │  │
│  │  │                                                      │    │  │
│  │  │  Features:                                           │    │  │
│  │  │  ✅ Public REST API (no authentication)             │    │  │
│  │  │  ✅ Free queries (no HBAR cost)                     │    │  │
│  │  │  ✅ ~5 second latency from consensus                │    │  │
│  │  │  ✅ Permanent storage                               │    │  │
│  │  │  ✅ Paginated results                               │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Operator Account: 0.0.7103057                                       │
│  Network: Hedera Testnet                                             │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Hedera Integration Deep Dive

### Why Hedera Consensus Service?

| Requirement | Traditional Solution | Hedera HCS Solution |
|-------------|---------------------|---------------------|
| **Immutability** | Centralized database (can be altered) | ABFT consensus, mathematically proven |
| **Transparency** | Closed audit logs | Public Mirror Node API |
| **Cost** | $5-15 per voter | $0.0001 per vote |
| **Finality** | Minutes to hours (manual counting) | ~3 seconds (consensus) |
| **Trust** | Requires trusted authority | Decentralized, no single point of control |
| **Auditability** | Expensive third-party audits | Free, anyone can verify |

### Transaction Flow: Vote Submission

```
┌──────────┐                                                ┌──────────┐
│  Voter   │                                                │  Hedera  │
│  Browser │                                                │  Network │
└────┬─────┘                                                └─────▲────┘
     │                                                            │
     │ 1. User selects candidate                                 │
     │    Clicks "Submit Vote"                                   │
     │                                                            │
     │ POST /index.php                                           │
     ▼                                                            │
┌─────────────────────────────────────┐                          │
│  PHP Backend (assets/js/pages/)     │                          │
│  - Validates user session           │                          │
│  - Prepares vote data                │                          │
│  - Calls Node.js API                 │                          │
└────────────┬────────────────────────┘                          │
             │                                                    │
             │ 2. POST /api/receive-vote                         │
             │    Body: {candidateId, voterId, positionId}       │
             ▼                                                    │
┌─────────────────────────────────────────────────────────┐      │
│  Node.js Hedera API (apis/hedera-api/app.js)            │      │
│                                                          │      │
│  Step A: Duplicate Detection                            │      │
│  ┌───────────────────────────────────────────────────┐  │      │
│  │ const votes = await fetchTopicMessages();         │  │      │
│  │ // Queries Mirror Node (free)                     │  │      │
│  │                                                    │  │      │
│  │ const alreadyVoted = votes.some(                  │  │      │
│  │   v => v.voterId === voterId &&                   │  │      │
│  │        v.positionId === positionId                │  │      │
│  │ );                                                │  │      │
│  └───────────────────────────────────────────────────┘  │      │
│                                                          │      │
│  If alreadyVoted: return error ❌                        │      │
│  Else: Continue to Step B ✅                             │      │
│                                                          │      │
│  Step B: HCS Submission                                  │      │
│  ┌───────────────────────────────────────────────────┐  │      │
│  │ const tx = new TopicMessageSubmitTransaction({   │  │──────┘
│  │   topicId: '0.0.7116561',                        │  │ 3. Submit to HCS
│  │   message: JSON.stringify({                       │  │    Cost: $0.0001
│  │     candidateId, voterId, positionId             │  │
│  │   })                                              │  │
│  │ });                                               │  │
│  │                                                   │  │
│  │ const response = await tx.execute(client);        │  │
│  │ const receipt = await response.getReceipt(client);│  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Step C: Verify Success                                  │
│  if (receipt.status === 'SUCCESS') {                     │
│    return { status: 'success' } ✅                       │
│  }                                                       │
└──────────────────────────────────────────────────────────┘
             │
             │ 4. Return success to frontend
             ▼
┌─────────────────────────────────────┐
│  Voter Browser                      │
│  - Show confirmation ✅             │
│  - Display blockchain receipt       │
│  - Voter can verify on Mirror Node  │
└─────────────────────────────────────┘
```

### HCS Message Structure

**On-Chain Format (stored on Hedera):**
```json
{
  "candidateId": 19,
  "voterId": "e8b7f6c3a2d1...",
  "positionId": 30
}
```

**Encoding Pipeline:**
```
JavaScript Object
    ↓ JSON.stringify()
Plain Text JSON
    ↓ Buffer.from(..., 'utf-8')
UTF-8 Bytes
    ↓ toString('base64')
Base64 String
    ↓ TopicMessageSubmitTransaction
HCS Consensus Message (Immutable)
```

**Decoding Pipeline (Mirror Node Retrieval):**
```
Mirror Node API Response
    ↓ response.data.messages[i].message
Base64 String
    ↓ Buffer.from(..., 'base64')
UTF-8 Bytes
    ↓ toString('utf-8')
Plain Text JSON
    ↓ JSON.parse()
JavaScript Object
```

---

## Data Flow Diagrams

### Vote Verification Flow

```
Admin Dashboard Requests Results
              ↓
┌──────────────────────────────────────┐
│ GET /api/get-votes                   │
│ (apis/hedera-api/app.js)             │
└─────────────┬────────────────────────┘
              │
              │ axios.get(mirrorNodeURL)
              ↓
┌──────────────────────────────────────────────────────┐
│ Hedera Mirror Node API                               │
│ https://testnet.mirrornode.hedera.com/api/v1/...     │
│                                                      │
│ Returns: All consensus messages from Topic          │
└─────────────┬────────────────────────────────────────┘
              │
              │ Parse base64 → JSON
              ↓
┌──────────────────────────────────────┐
│ Vote Data Array                      │
│ [                                    │
│   {candidateId: 19, voterId: "...", positionId: 30},│
│   {candidateId: 21, voterId: "...", positionId: 28},│
│   ...                                │
│ ]                                    │
└─────────────┬────────────────────────┘
              │
              │ Group by candidateId
              ↓
┌──────────────────────────────────────┐
│ Vote Counts                          │
│ {                                    │
│   "19": 45 votes,                    │
│   "21": 32 votes,                    │
│   "22": 18 votes                     │
│ }                                    │
└─────────────┬────────────────────────┘
              │
              │ Render Results
              ↓
┌──────────────────────────────────────┐
│ Admin Dashboard                      │
│ - Candidate A: 45 votes (47%)        │
│ - Candidate B: 32 votes (34%)        │
│ - Candidate C: 18 votes (19%)        │
│                                      │
│ ✅ Verified on Hedera Ledger         │
└──────────────────────────────────────┘
```

---

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     users       │         │    election      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │    ┌───▶│ id (PK)          │
│ username        │    │    │ en_organizer     │
│ password_hash   │    │    │ fr_organizer     │
│ id_hmac         │    │    │ ar_organizer     │
│ role (ENUM)     │    │    │ election_type    │
│ created_at      │    │    │ year             │
└────────┬────────┘    │    │ start_date       │
         │             │    │ end_date         │
         │             │    │ results (ENUM)   │
         │             │    │ status           │
         │             │    │ created_by (FK)  │
         │             │    └────────┬─────────┘
         │             │             │
         │             │             │
         ▼             │             ▼
┌─────────────────────────────────────────────┐
│         users_election                      │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ user_id_hmac (FK → users.id_hmac)          │
│ id_election (FK → election.id)             │
└─────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│ election_admins │         │    position      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │    ┌───▶│ id (PK)          │
│ admin_user_id(FK)   │    │ en_name          │
│ election_id (FK)│    │    │ fr_name          │
└─────────────────┘    │    │ ar_name          │
                       │    │ id_election (FK) │
                       │    │ created_by (FK)  │
                       │    └────────┬─────────┘
                       │             │
                       │             │
                       │             ▼
                       │    ┌──────────────────┐
                       │    │   candidates     │
                       │    ├──────────────────┤
                       └────│ id (PK)          │
                            │ name             │
                            │ ar_name          │
                            │ photo_path       │
                            │ en_description   │
                            │ fr_description   │
                            │ ar_description   │
                            │ nominated_at     │
                            │ Supporting_party │
                            │ path_supporting..│
                            │ id_position (FK) │
                            │ created_by (FK)  │
                            └──────────────────┘

🔗 Hedera HCS Vote Storage (Off-Chain DB):
   - candidateId → candidates.id
   - voterId → users.id_hmac
   - positionId → position.id
```

### Key Relationships

1. **Users → Elections (Many-to-Many)**
   - `users_election` join table
   - Voter can participate in multiple elections

2. **Elections → Admins (Many-to-Many)**
   - `election_admins` join table
   - Admin can manage multiple elections

3. **Elections → Positions (One-to-Many)**
   - Each election has multiple positions (President, VP, etc.)

4. **Positions → Candidates (One-to-Many)**
   - Each position has multiple candidates

5. **Votes (Hedera HCS, not in MySQL)**
   - Stored on-chain as consensus messages
   - Referenced by: `candidateId`, `voterId`, `positionId`

---

## API Endpoints

### PHP Backend API (`apis/api.php`)

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api.php?action=getActiveElections` | GET | ✅ User | Get elections user can vote in |
| `/api.php?action=getAllElections` | GET | ✅ Admin | Get all elections (admin scope) |
| `/api.php?action=getPositionByElection&id_election=X` | GET | ✅ User | Get positions for election |
| `/api.php?action=getCandidatesByPosition&id_position=X` | GET | ✅ User | Get candidates for position |
| `/api.php?action=addElection` | POST | ✅ Super Admin | Create new election |
| `/api.php?action=editElection` | POST | ✅ Super Admin | Update election details |
| `/api.php?action=stopElection` | POST | ✅ Super Admin | Deactivate election |
| `/api.php?action=addPosition` | POST | ✅ Admin | Create position |
| `/api.php?action=deletePosition` | POST | ✅ Admin | Remove position |
| `/api.php?action=addCandidate` | POST | ✅ Admin | Add candidate with photo |
| `/api.php?action=publishResults` | POST | ✅ Admin/Super Admin | Make results public |

### Node.js Hedera API (`apis/hedera-api/app.js`)

| Endpoint | Method | Auth Required | Description | Cost |
|----------|--------|---------------|-------------|------|
| `/api/receive-vote` | POST | ❌ Public | Submit vote to HCS | $0.0001 |
| `/api/get-votes` | POST | ❌ Public | Get all votes from Mirror Node | Free |

**Vote Submission Request:**
```json
POST /api/receive-vote
{
  "candidateId": 19,
  "voterId": "e8b7f6c3a2d1...",
  "positionId": 30
}
```

**Vote Submission Response:**
```json
// Success
{
  "status": "success"
}

// Duplicate Vote
{
  "status": "alreadyVoted",
  "message": "already_voted_for_the_position"
}

// Error
{
  "status": "error",
  "message": "Insufficient HBAR balance"
}
```

---

## Security Architecture

### Authentication Flow

```
1. User Login (auth.php)
      ↓
2. Verify credentials (MySQL)
      ↓
3. Create PHP session
      ↓
4. Generate HMAC voter ID
      ↓
5. Store in $_SESSION['user_id_hmac']
      ↓
6. All API requests check session
      ↓
7. Role-based access control (RBAC)
```

### Role-Based Access Control Matrix

| Feature | Voter | Admin | Super Admin |
|---------|-------|-------|-------------|
| Cast Vote | ✅ | ✅ | ✅ |
| View Results (if published) | ✅ | ✅ | ✅ |
| Manage Candidates | ❌ | ✅ (assigned elections) | ✅ |
| Manage Positions | ❌ | ✅ (assigned elections) | ✅ |
| Create Elections | ❌ | ❌ | ✅ |
| Assign Admins | ❌ | ❌ | ✅ |
| Publish Results | ❌ | ✅ (assigned elections) | ✅ |
| Stop Elections | ❌ | ❌ | ✅ |

### Privacy Protection: HMAC Voter IDs

**Why HMAC?**
- Votes are public on Hedera (transparency)
- Voter identity must remain private (anonymity)
- Solution: Hash voter IDs before storing on-chain

**Implementation:**
```php
// PHP Backend (core/session.php)
$voter_hmac = hash_hmac('sha256', $user_id, 'SECRET_KEY');
$_SESSION['user_id_hmac'] = $voter_hmac;

// Sent to Hedera API
POST /api/receive-vote
{
  "voterId": "e8b7f6c3a2d1..."  // HMAC hash, not real user ID
}
```

**Result:**
- ✅ Duplicate prevention (same hash can't vote twice)
- ✅ Voter privacy (real identity not exposed)
- ✅ Auditability (can verify vote counts)
- ❌ Cannot reverse-engineer voter identity from hash

---

## Performance & Scalability

### Current Limitations (Testnet)

| Metric | Current | Bottleneck | Solution |
|--------|---------|------------|----------|
| **Votes/Second** | ~5 | HCS throughput | Batch messages |
| **Vote Retrieval** | O(n) | Mirror Node pagination | Cache results |
| **Database Queries** | No caching | MySQL | Redis cache |
| **API Latency** | ~500ms | Network | CDN for static assets |

### Scalability Plan (Mainnet)

**Phase 1: Optimize Queries**
- Implement Redis caching for Mirror Node results
- Index MySQL tables on foreign keys
- Use pagination for large candidate lists

**Phase 2: Distributed Architecture**
- Load balancer for Node.js API
- Read replicas for MySQL
- CDN for images and static files

**Phase 3: Batch Processing**
- Aggregate multiple votes into single HCS message
- Cost reduction: 10 votes = $0.0001 (vs. $0.001)

---

## Cost Analysis

### Testnet Deployment (Free)

| Resource | Cost |
|----------|------|
| Hedera Account Creation | $0 |
| Topic Creation | $0 |
| Vote Submissions | $0 |
| Mirror Node Queries | $0 |

### Mainnet Projection (10,000 Voter Election)

| Item | Quantity | Unit Cost | Total |
|------|----------|-----------|-------|
| **Topic Creation** | 1 | $0.01 | $0.01 |
| **Vote Submissions** | 10,000 | $0.0001 | $1.00 |
| **Mirror Node Queries** | Unlimited | $0 | $0.00 |
| **Operator Account Funding** | 1 | $10 | $10.00 |
| **Total** | - | - | **$11.01** |

**Comparison to Traditional Voting:**
- Paper ballots: $50,000 (printing, logistics, manual counting)
- E-voting systems: $75,000+ (licensing, hardware, audits)
- **Voty (Hedera)**: $11.01 ✅

**Cost Savings: 99.98%**

---

## Deployment Architecture (Production)

```
                    ┌──────────────┐
                    │   Cloudflare │
                    │   (CDN/WAF)  │
                    └───────┬──────┘
                            │
                ┌───────────▼───────────┐
                │   Load Balancer       │
                └───────┬───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌─────────┐     ┌─────────┐     ┌─────────┐
  │ PHP App │     │ PHP App │     │ PHP App │
  │ Server 1│     │ Server 2│     │ Server 3│
  └────┬────┘     └────┬────┘     └────┬────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
           ┌───────────▼────────────┐
           │  MySQL Primary         │
           │  (Read/Write)          │
           └───────────┬────────────┘
                       │ Replication
           ┌───────────▼────────────┐
           │  MySQL Read Replicas   │
           │  (Read-only)           │
           └────────────────────────┘

  ┌──────────────────────────────────────┐
  │  Hedera API (Node.js)                │
  │  - Auto-scaling group                │
  │  - Rate limiting: 100 req/min        │
  │  - Health checks                     │
  └──────────────┬───────────────────────┘
                 │
                 ▼
  ┌──────────────────────────────────────┐
  │  Hedera Mainnet                      │
  │  - HCS Topic (production)            │
  │  - Mirror Nodes (global CDN)         │
  └──────────────────────────────────────┘
```

---

**Document Version**: 1.0.0  
**Last Updated**: October 30, 2025  
**Author**: Voty Development Team
