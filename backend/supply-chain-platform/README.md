# Supply Chain Transfer Platform

A portfolio-grade supply chain audit system demonstrating hybrid off-chain/on-chain architecture. The platform records inventory transfer state in PostgreSQL while maintaining an immutable audit trail on Ethereum, providing cryptographic proof of transfer integrity.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Why This Pattern Matters](#why-this-pattern-matters)
- [Technical Stack](#technical-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Setup and Installation](#setup-and-installation)
  - [Database Setup](#database-setup)
  - [Hardhat Setup](#hardhat-setup)
  - [Smart Contract Deployment](#smart-contract-deployment)
  - [Spring Boot Application](#spring-boot-application)
- [API Reference](#api-reference)
- [Example Workflow](#example-workflow)
- [Deterministic Hashing](#deterministic-hashing)
- [Two-Phase Transfer Workflow](#two-phase-transfer-workflow)
- [Portfolio Demo Checklist](#portfolio-demo-checklist)

---

## Architecture Overview
```
                                    SUPPLY CHAIN TRANSFER PLATFORM
                                    
    +------------------+          +----------------------+          +------------------+
    |                  |   REST   |                      |   JPA    |                  |
    |   REST Client    |--------->|   Spring Boot API    |--------->|   PostgreSQL     |
    |   (curl/Postman) |<---------|   (Java 21)          |<---------|   (Off-chain)    |
    |                  |   JSON   |                      |          |                  |
    +------------------+          +----------+-----------+          +------------------+
                                             |
                                             | web3j (JSON-RPC)
                                             v
                                  +----------------------+
                                  |                      |
                                  |   Hardhat Network    |
                                  |   (Local Ethereum)   |
                                  |                      |
                                  |   TransferLedger     |
                                  |   Smart Contract     |
                                  |   (On-chain Proof)   |
                                  |                      |
                                  +----------------------+
```

The system implements a dual-storage pattern:

- **Off-chain (PostgreSQL)**: Stores complete transfer details including locations, item quantities, timestamps, and blockchain transaction references. Optimized for queries, reporting, and operational workflows.

- **On-chain (Ethereum)**: Stores only the transfer identifier and a cryptographic hash of the items. Provides immutable, tamper-evident proof that a specific transfer with specific contents was recorded at a specific point in time.

---

## Why This Pattern Matters

This hybrid architecture reflects real-world enterprise blockchain implementations used by major supply chain platforms. The pattern addresses several critical challenges:

**Cost Efficiency**: Storing complete inventory data on-chain would be prohibitively expensive. By storing only a 32-byte hash, gas costs remain predictable and minimal regardless of transfer size.

**Privacy**: Sensitive business data (supplier relationships, pricing, quantities) remains in the private database. Only a non-reversible hash is public.

**Performance**: PostgreSQL handles high-throughput queries and complex reporting. Blockchain confirmation times do not impact operational workflows.

**Auditability**: The on-chain hash serves as a cryptographic anchor. If database records are altered, the hash mismatch provides tamper evidence. Auditors can independently verify that the current database state matches the blockchain record.

**Regulatory Compliance**: Industries like pharmaceuticals, food safety, and automotive require immutable audit trails. This pattern satisfies regulatory requirements while maintaining operational flexibility.

Real-world implementations of this pattern include IBM Food Trust, Walmart's food traceability system, and pharmaceutical track-and-trace platforms mandated by the Drug Supply Chain Security Act (DSCSA).

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| API | Spring Boot 3.3.5 | REST endpoints, validation, dependency injection |
| Language | Java 21 | Modern language features, virtual threads ready |
| Database | PostgreSQL | Off-chain state, transactional integrity |
| ORM | Spring Data JPA / Hibernate | Entity mapping, repository abstraction |
| Blockchain | Ethereum (Hardhat) | Immutable audit ledger |
| Web3 | web3j 4.12.2 | Java-Ethereum integration, transaction signing |
| Build | Maven | Dependency management, compilation |

---

## Prerequisites

Before running this project, ensure you have the following installed:

- **Java 21** (or later with `--release 21` target)
```bash
  java -version
  # Expected: openjdk version "21.x.x" or later
```

- **Maven 3.8+**
```bash
  mvn -version
```

- **PostgreSQL 14+**
```bash
  psql --version
```

- **Node.js 18+ and npm** (for Hardhat)
```bash
  node -v
  npm -v
```

- **Git** (for version control)

---

## Project Structure
```
supply-chain-platform/
├── pom.xml
├── README.md
├── src/
│   └── main/
│       ├── java/com/inventory/blockchain/
│       │   ├── SupplyChainApplication.java
│       │   ├── config/
│       │   │   ├── BlockchainProperties.java
│       │   │   └── Web3Config.java
│       │   ├── controller/
│       │   │   └── TransferController.java
│       │   ├── dto/
│       │   │   ├── TransferItem.java
│       │   │   ├── TransferRequest.java
│       │   │   └── TransferResponse.java
│       │   ├── entity/
│       │   │   └── Transfer.java
│       │   ├── exception/
│       │   │   ├── BlockchainTransactionException.java
│       │   │   ├── ErrorResponse.java
│       │   │   ├── GlobalExceptionHandler.java
│       │   │   ├── TransferAlreadyExistsException.java
│       │   │   └── TransferNotFoundException.java
│       │   ├── repository/
│       │   │   └── TransferRepository.java
│       │   ├── service/
│       │   │   ├── BlockchainService.java
│       │   │   └── TransferService.java
│       │   └── util/
│       │       └── ItemsHashUtil.java
│       └── resources/
│           └── application.yml
└── contracts/                    # Separate Hardhat project
    ├── contracts/
    │   └── TransferLedger.sol
    ├── scripts/
    │   └── deploy.js
    ├── hardhat.config.js
    └── package.json
```

---

## Environment Variables

The application uses environment variables for configuration. Set these before running:
```bash
# Database Configuration
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/supply_chain_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=your_password_here

# Blockchain Configuration
export HARDHAT_RPC_URL=http://127.0.0.1:8545
export CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
export SENDER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export CHAIN_ID=31337

# Optional: Gas settings (defaults shown)
export GAS_PRICE=20000000000
export GAS_LIMIT=3000000
```

**Security Note**: The private key shown is Hardhat's default Account #0, intended for local development only. Never use this key on mainnet or with real funds.

---

## Setup and Installation

### Database Setup

1. Start PostgreSQL and create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE supply_chain_db;

# Exit
\q
```

2. The application uses Hibernate's `ddl-auto: update`, which automatically creates the schema on first run. Alternatively, create the table manually:
```sql
CREATE TABLE transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_id VARCHAR(100) NOT NULL UNIQUE,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    items_hash VARCHAR(66) NOT NULL,
    status VARCHAR(50) NOT NULL,
    contract_address VARCHAR(42),
    tx_hash VARCHAR(66),
    block_number BIGINT,
    error_message VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_transfers_transfer_id ON transfers(transfer_id);
CREATE INDEX idx_transfers_status ON transfers(status);
```

### Hardhat Setup

1. Create a separate directory for the Hardhat project:
```bash
mkdir hardhat-contracts
cd hardhat-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. Select "Create a JavaScript project" when prompted.

3. Create the smart contract at `contracts/TransferLedger.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TransferLedger {
    
    enum TransferStatus { None, Requested, InTransit, Delivered, Cancelled }
    
    struct TransferRecord {
        address requester;
        string from;
        string to;
        bytes32 itemsHash;
        TransferStatus status;
        uint256 timestamp;
    }
    
    mapping(string => TransferRecord) public transfers;
    
    event TransferRequested(
        string indexed transferId,
        address indexed requester,
        string from,
        string to,
        bytes32 itemsHash,
        uint256 timestamp
    );
    
    function requestTransfer(
        string calldata transferId,
        string calldata from,
        string calldata to,
        bytes32 itemsHash
    ) external {
        require(bytes(transferId).length > 0, "Transfer ID required");
        require(transfers[transferId].status == TransferStatus.None, "Transfer exists");
        
        transfers[transferId] = TransferRecord({
            requester: msg.sender,
            from: from,
            to: to,
            itemsHash: itemsHash,
            status: TransferStatus.Requested,
            timestamp: block.timestamp
        });
        
        emit TransferRequested(transferId, msg.sender, from, to, itemsHash, block.timestamp);
    }
    
    function getTransfer(string calldata transferId) external view returns (
        address requester,
        string memory from,
        string memory to,
        bytes32 itemsHash,
        TransferStatus status,
        uint256 timestamp
    ) {
        TransferRecord storage record = transfers[transferId];
        return (record.requester, record.from, record.to, record.itemsHash, record.status, record.timestamp);
    }
}
```

4. Create the deployment script at `scripts/deploy.js`:
```javascript
async function main() {
    const TransferLedger = await ethers.getContractFactory("TransferLedger");
    const ledger = await TransferLedger.deploy();
    await ledger.waitForDeployment();
    
    const address = await ledger.getAddress();
    console.log("TransferLedger deployed to:", address);
    console.log("Set this as CONTRACT_ADDRESS environment variable");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

5. Configure Hardhat in `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: "0.8.19",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        }
    }
};
```

### Smart Contract Deployment

1. Start the Hardhat local node (keep this terminal open):
```bash
cd chain
npx hardhat node
```

You will see output including 20 test accounts with their private keys. Account #0's private key is:
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

2. In a new terminal, deploy the contract:
```bash
cd chain
npx hardhat run scripts/deploy.js --network localhost
```

Expected output:
```
TransferLedger deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

3. Note the deployed address and set it as `CONTRACT_ADDRESS`.

### Spring Boot Application

1. Navigate to the Spring Boot project directory:
```bash
cd C:\Users\Usuario\Desktop\inventory-blockchain\backend\supply-chain-platform

```

2. Set environment variables (see Environment Variables section above).

3. Build and run:
```bash
# Build
mvn clean package -DskipTests

# Run
mvn spring-boot:run
```

The application starts on `http://localhost:8080`.

---

## API Reference

### POST /api/transfers

Creates a new transfer request, records it in the database, and writes an audit proof to the blockchain.

**Request Body:**
```json
{
    "transferId": "TRF-2024-001",
    "fromLocation": "WAREHOUSE-NORTH-01",
    "toLocation": "STORE-DOWNTOWN-15",
    "items": [
        {"sku": "ELEC-TV-55IN-4K", "qty": 10},
        {"sku": "ELEC-SOUND-BAR", "qty": 25},
        {"sku": "ELEC-HDMI-CABLE", "qty": 100}
    ]
}
```

**Response (201 Created):**
```json
{
    "transferId": "TRF-2024-001",
    "fromLocation": "WAREHOUSE-NORTH-01",
    "toLocation": "STORE-DOWNTOWN-15",
    "status": "CONFIRMED",
    "itemsHash": "0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b",
    "contractAddress": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "blockNumber": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `409 Conflict`: Transfer ID already exists
- `400 Bad Request`: Validation failed
- `500 Internal Server Error`: Blockchain transaction failed

### GET /api/transfers/{transferId}

Retrieves a transfer by its ID.

**Response (200 OK):**
```json
{
    "transferId": "TRF-2024-001",
    "fromLocation": "WAREHOUSE-NORTH-01",
    "toLocation": "STORE-DOWNTOWN-15",
    "status": "CONFIRMED",
    "itemsHash": "0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b",
    "contractAddress": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "blockNumber": 1,
    "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**

- `404 Not Found`: Transfer ID does not exist

---

## Example Workflow

The following curl commands demonstrate a complete workflow:

### 1. Create a Transfer from Warehouse to Store
```bash
curl -X POST http://localhost:8080/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "transferId": "TRF-2024-001",
    "fromLocation": "WAREHOUSE-NORTH-01",
    "toLocation": "STORE-DOWNTOWN-15",
    "items": [
        {"sku": "FURN-CHAIR-OFFICE", "qty": 20},
        {"sku": "FURN-DESK-STAND", "qty": 10}
    ]
  }'
```

### 2. Retrieve the Transfer
```bash
curl http://localhost:8080/api/transfers/TRF-2024-001
```

### 3. Attempt Duplicate (Expect 409)
```bash
curl -X POST http://localhost:8080/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "transferId": "TRF-2024-001",
    "fromLocation": "WAREHOUSE-SOUTH-02",
    "toLocation": "STORE-UPTOWN-22",
    "items": [{"sku": "OTHER-ITEM", "qty": 5}]
  }'
```

### 4. Create Another Transfer
```bash
curl -X POST http://localhost:8080/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "transferId": "TRF-2024-002",
    "fromLocation": "DISTRIBUTION-CENTER-EAST",
    "toLocation": "WAREHOUSE-NORTH-01",
    "items": [
        {"sku": "APRL-SHIRT-BLU-M", "qty": 50},
        {"sku": "APRL-SHIRT-BLU-L", "qty": 75},
        {"sku": "APRL-SHIRT-BLU-XL", "qty": 25}
    ]
  }'
```

### 5. Retrieve Non-Existent Transfer (Expect 404)
```bash
curl http://localhost:8080/api/transfers/DOES-NOT-EXIST
```

---

## Deterministic Hashing

The `itemsHash` is computed using a deterministic algorithm ensuring the same items always produce the same hash, regardless of input order:

### Algorithm

1. **Sort items** by SKU in ascending lexicographic order
2. **Sort object keys** alphabetically within each item (`qty` before `sku`)
3. **Serialize** to JSON with no whitespace
4. **Hash** the UTF-8 bytes using Keccak-256 (Ethereum's hash function)
5. **Format** as `0x` + 64 hexadecimal characters

### Example

**Input (unordered):**
```json
[
    {"sku": "ITEM-B", "qty": 10},
    {"sku": "ITEM-A", "qty": 5}
]
```

**Canonical form:**
```json
[{"qty":5,"sku":"ITEM-A"},{"qty":10,"sku":"ITEM-B"}]
```

**Hash:**
```
0x... (keccak256 of canonical JSON bytes)
```

This determinism enables verification: given the same items, anyone can independently compute the hash and compare it against the on-chain record.

---

## Two-Phase Transfer Workflow

The system uses a two-phase commit pattern to handle the asynchronous nature of blockchain transactions:

### Phase 1: Database Commit
```
1. Validate request
2. Check for duplicate transferId
3. Compute itemsHash
4. INSERT row with status = 'REQUESTED'
5. COMMIT transaction (releases database connection)
```

### Phase 2: Blockchain Commit
```
6. Encode contract function call
7. Sign transaction with private key
8. Send to Ethereum node
9. Wait for mining confirmation (can take seconds)
10. Verify transaction receipt status
```

### Phase 3: Database Update
```
11. UPDATE row with txHash, blockNumber
12. Set status = 'CONFIRMED' (or 'FAILED')
13. COMMIT transaction
```

### Why Two Phases?

**Connection Pool Exhaustion**: Holding a database transaction open during blockchain confirmation (1-15+ seconds) would exhaust connection pools under load.

**Partial Failure Handling**: If blockchain fails, the database row exists with `FAILED` status, enabling retry logic or manual intervention.

**Idempotency**: The initial duplicate check prevents double-submission even if the client retries.

---

## Portfolio Demo Checklist

Use this checklist when demonstrating the project to recruiters or during technical interviews:

### Setup Verification

- [ ] Hardhat node running with test accounts visible
- [ ] Contract deployed with address noted
- [ ] PostgreSQL running with empty `transfers` table
- [ ] Spring Boot application started without errors
- [ ] Environment variables correctly set

### Functional Demonstration

- [ ] Create first transfer via curl or Postman
- [ ] Show response includes `txHash` and `blockNumber`
- [ ] Query the transfer via GET endpoint
- [ ] Attempt duplicate transfer (show 409 response)
- [ ] Create second transfer with different items
- [ ] Show database records in PostgreSQL
- [ ] Show Hardhat console logging the transactions

### Architecture Discussion Points

- [ ] Explain why complete data is not stored on-chain (cost, privacy)
- [ ] Explain deterministic hashing and its importance for verification
- [ ] Explain two-phase commit and connection pool considerations
- [ ] Discuss how this pattern scales to production (multiple nodes, L2s)
- [ ] Mention real-world implementations (IBM Food Trust, pharma tracking)

### Code Quality Points

- [ ] Clean architecture: thin controller, service layer, repository
- [ ] Proper exception handling with `@ControllerAdvice`
- [ ] Constructor injection (no `@Autowired` on fields)
- [ ] Records for immutable DTOs
- [ ] Transaction propagation for two-phase workflow
- [ ] Comprehensive logging at appropriate levels

### Extension Discussion

- [ ] How would you add authentication? (Spring Security, JWT)
- [ ] How would you handle blockchain node failures? (retry, circuit breaker)
- [ ] How would you deploy to mainnet? (key management, gas estimation)
- [ ] How would you add transfer status updates? (additional contract functions)
- [ ] How would you implement batch transfers? (multicall pattern)

---

## License

This project is intended for educational and portfolio demonstration purposes.

---

## Author

Built as a portfolio project demonstrating enterprise blockchain integration patterns with Spring Boot.