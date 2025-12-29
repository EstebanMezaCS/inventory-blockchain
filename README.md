# Inventory Blockchain - Supply Chain Transfer Platform

A full-stack supply chain management system with blockchain verification. Built with Spring Boot, React, PostgreSQL, and Ethereum smart contracts.

![Tech Stack](https://img.shields.io/badge/Java-21-orange) ![Tech Stack](https://img.shields.io/badge/Spring%20Boot-3.3.5-green) ![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/Solidity-0.8.20-purple) ![Tech Stack](https://img.shields.io/badge/PostgreSQL-14+-blue)

## Overview

This platform demonstrates a hybrid off-chain/on-chain architecture for supply chain management:

- **Off-chain (PostgreSQL)**: Stores complete transfer details, optimized for queries and reporting
- **On-chain (Ethereum)**: Stores cryptographic proof (hash) for immutable audit trail

This pattern is used by enterprise systems like IBM Food Trust and pharmaceutical track-and-trace platforms.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend      │────▶│   PostgreSQL    │
│   React + Vite  │     │  Spring Boot 3   │     │   (Off-chain)   │
│   Port: 3000    │     │   Port: 8080     │     │   Port: 5432    │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 │ web3j
                                 ▼
                        ┌──────────────────┐
                        │    Blockchain    │
                        │  Hardhat (Local) │
                        │    Port: 8545    │
                        └──────────────────┘
```

## Features

### Transfer Status Workflow
```
REQUESTED → CONFIRMED → IN_TRANSIT → DELIVERED
                ↓            ↓
            CANCELLED    CANCELLED
```

### Real-World SKU Catalog
- **Electronics**: TVs, Laptops, Phones, Tablets
- **Furniture**: Office chairs, Desks, Shelves
- **Apparel**: Shirts, Pants, Shoes (with sizes)
- **Food & Beverage**: Packaged goods, Beverages
- **Pharmaceuticals**: Vitamins, Medical supplies
- **Automotive**: Motor oil, Brake pads, Batteries
- **Office Supplies**: Paper, Pens, Folders

### Blockchain Verification
- Every transfer recorded on Ethereum
- Immutable audit trail with transaction hash
- Deterministic item hashing (Keccak256)
- Tamper-evident proof of transfer integrity

## Project Structure

```
inventory-blockchain/
├── backend/                 # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/inventory/blockchain/
│       │   ├── config/      # Web3, CORS configuration
│       │   ├── controller/  # REST endpoints
│       │   ├── dto/         # Request/Response objects
│       │   ├── entity/      # JPA entities
│       │   ├── exception/   # Error handling
│       │   ├── repository/  # Data access
│       │   ├── service/     # Business logic
│       │   └── util/        # Hash utilities
│       └── resources/
│           └── application.yml
├── frontend/                # React Dashboard
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx          # Main dashboard
│       └── main.jsx
└── blockchain/              # Smart Contracts
    ├── package.json
    ├── hardhat.config.js
    ├── contracts/
    │   └── TransferLedger.sol
    └── scripts/
        └── deploy.js
```

## Prerequisites

- **Java 21** or later
- **Maven 3.8+**
- **Node.js 18+** and npm
- **PostgreSQL 14+**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Zag009/inventory-blockchain.git
cd inventory-blockchain
```

### 2. Database Setup

```bash
psql -U postgres -c "CREATE DATABASE inventory_db;"
```

### 3. Start Blockchain (Terminal 1)

```bash
cd blockchain
npm install
npx hardhat node
```

### 4. Deploy Smart Contract (Terminal 2)

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Note the contract address and update `backend/src/main/resources/application.yml` if needed.

### 5. Start Backend (Terminal 3)

```bash
cd backend
mvn spring-boot:run
```

### 6. Start Frontend (Terminal 4)

```bash
cd frontend
npm install
npm run dev
```

### 7. Open Browser

Navigate to: **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transfers` | List all transfers |
| POST | `/api/transfers` | Create new transfer |
| GET | `/api/transfers/{id}` | Get transfer by ID |
| PUT | `/api/transfers/{id}/status` | Update transfer status |
| GET | `/actuator/health` | Health check |

### Example: Create Transfer

```bash
curl -X POST http://localhost:8080/api/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "transferId": "TRF-001",
    "fromLocation": "WAREHOUSE-NORTH-01",
    "toLocation": "STORE-DOWNTOWN-001",
    "items": [
      {"sku": "ELEC-TV-55-4K", "qty": 10},
      {"sku": "ELEC-LAPTOP-PRO", "qty": 5}
    ]
  }'
```

### Example: Update Status

```bash
curl -X PUT http://localhost:8080/api/transfers/TRF-001/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_TRANSIT"}'
```

## Environment Variables

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/inventory_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password

# Blockchain
HARDHAT_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
SENDER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CHAIN_ID=31337
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, CSS-in-JS |
| Backend | Spring Boot 3.3, Java 21, Maven |
| Database | PostgreSQL 14+, Spring Data JPA |
| Blockchain | Ethereum, Solidity 0.8.20, Hardhat |
| Web3 Integration | web3j 4.12.2 |
| Validation | Jakarta Bean Validation |

## How It Works

### Two-Phase Commit Pattern

1. **Phase 1 - Database**: Create transfer record with `REQUESTED` status
2. **Phase 2 - Blockchain**: Send transaction, wait for confirmation
3. **Phase 3 - Update**: Update record with `txHash`, `blockNumber`, set `CONFIRMED`

This pattern prevents holding database connections during blockchain confirmation (which can take seconds).

### Deterministic Hashing

Items are hashed using a canonical JSON format:
1. Sort items by SKU
2. Sort object keys alphabetically
3. Remove whitespace
4. Apply Keccak256 hash

This ensures the same items always produce the same hash, enabling verification.

## Screenshots

### Dashboard
- View all transfers with status indicators
- Filter by status (Requested, In Transit, Delivered)
- Real-time statistics

### Create Transfer
- SKU selector with 40+ products
- Location presets (Warehouses, Stores)
- Multiple items per transfer

### Transfer Details
- Status timeline visualization
- Complete blockchain proof
- One-click status updates

## License

MIT License - Built for portfolio demonstration

## Author

Built as a full-stack blockchain portfolio project demonstrating enterprise integration patterns.
