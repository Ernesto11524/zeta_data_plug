# Database Setup Guide for Zeta Data

## Database Schema Overview

The database is structured with 4 main models:

### 1. **Admin** 
- Stores admin user credentials
- Email (unique)
- Hashed password

### 2. **Network** 
- Represents mobile networks
- Examples: MTN, Airtel, Glo, 9mobile
- Each network can have multiple data packages

### 3. **DataPackage** 
- Data packages offered by each network
- Examples: 100MB, 500MB, 1GB, 2GB, 5GB, 10GB, 20GB
- Each package has a price in Naira (NGN)
- Links to a Network

### 4. **Order** 
- Customer orders for data packages
- Stores customer phone number (10+ digits)
- Payment reference from Paystack
- Order status (pending, processing, completed)
- **Important**: Orders are NEVER deleted, only marked complete

## Setup Instructions

### Option 1: Vercel Postgres (Recommended for Vercel)

1. **Create Vercel Postgres Database**
   ```bash
   # In your Vercel dashboard, add a PostgreSQL database
   # Copy the connection string from "Connecting to a Postgres Client"
   ```

2. **Add to `.env.local`**
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?schema=public&sslmode=require"
   ```

3. **Push schema to database**
   ```bash
   npm run db:push
   ```

4. **Seed initial data (networks and packages)**
   ```bash
   npm run db:seed
   ```

### Option 2: Neon (Alternative PostgreSQL Provider)

1. **Create Neon Project**
   - Visit https://neon.tech
   - Create a new project
   - Copy connection string

2. **Add to `.env.local`**
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?schema=public&sslmode=require"
   ```

3. **Push and seed**
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Option 3: Local PostgreSQL (Development)

1. **Install PostgreSQL locally**

2. **Create database**
   ```bash
   createdb zeta_data_bundles
   ```

3. **Update `.env.local`**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/zeta_data_bundles?schema=public"
   ```

4. **Push and seed**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## Available npm Scripts

- `npm run db:push` — Push schema changes to database
- `npm run db:migrate` — Create a migration and push
- `npm run db:seed` — Seed networks and packages
- `npm run db:studio` — Open Prisma Studio (visual DB editor)

## Database Structure

```
Networks (4 records)
├── MTN
│   ├── 100MB - ₦100
│   ├── 500MB - ₦500
│   ├── 1GB - ₦1,000
│   ├── 2GB - ₦1,500
│   ├── 5GB - ₦2,500
│   ├── 10GB - ₦4,000
│   └── 20GB - ₦7,000
├── Airtel
│   └── [Same 7 packages]
├── Glo
│   └── [Same 7 packages]
└── 9mobile
    └── [Same 7 packages]

Total: 4 networks × 7 packages = 28 data packages
```

## Seeding Data

The `prisma/seed.ts` file creates:

1. **Default Admin Account**
   - Email: `admin@zetadata.com`
   - Password: `password123` (change in production!)

2. **4 Networks**
   - MTN, Airtel, Glo, 9mobile

3. **28 Data Packages**
   - 7 packages per network (100MB to 20GB)
   - Prices range from ₦100 to ₦7,000

## Making Changes to Schema

If you need to add new fields or models:

1. **Edit** `prisma/schema.prisma`
2. **Create migration** (for production):
   ```bash
   npm run db:migrate
   ```
3. **Or push directly** (for development):
   ```bash
   npm run db:push
   ```

## Database Relationships

```
Admin (1) ──────────── (many) ← Not directly linked

Network (1) ──────────── (many) DataPackage
Network (1) ──────────── (many) Order
DataPackage (1) ──────────── (many) Order
```

## Important Notes for Production

✅ **What's Safe**
- Orders are never deleted (only mark as completed)
- All data is immutable once created
- Indexes are set up for fast queries

⚠️ **Before Going Live**
1. Change default admin password
2. Use strong secrets in environment variables
3. Enable SSL mode for database connection
4. Set up automated backups
5. Use environment variables for sensitive data
6. Never commit `.env.local` to git

## Vercel Deployment

Once set up:

1. **Push code to GitHub**
2. **Connect to Vercel**
3. **Add `DATABASE_URL` to Vercel environment variables**
4. **Deploy** — Vercel automatically runs migrations

The database will work seamlessly with Vercel's infrastructure!

## Troubleshooting

**"Can't reach database server"**
- Check DATABASE_URL is correct
- Ensure network/firewall allows connections
- For Vercel Postgres, check the connection string format

**"Relation does not exist"**
- Run `npm run db:push` to create tables
- Run `npm run db:seed` to add initial data

**"Foreign key constraint failed"**
- Ensure networks are created before adding packages
- Seed script handles this automatically

---

**Ready?** Run:
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```
