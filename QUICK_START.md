# Zeta Data - Quick Start Guide

## ✅ What's Been Built

### 1. Admin Login Page (with fixed password visibility)
- Mobile-responsive design
- Form validation (email & password)
- Better visibility on password input
- Tested and working on http://localhost:3000/admin/login

### 2. Complete Database Schema
```
Models Created:
├── Admin (email, password)
├── Network (MTN, Airtel, Glo, 9mobile)
├── DataPackage (100MB → 20GB, prices 100₦ → 7000₦)
└── Order (customer phone, network, package, payment, status)
```

### 3. Seed Script
- Creates 4 networks
- Creates 28 data packages
- Creates admin account (admin@zetadata.com / password123)

## 🚀 To Get Started

### Step 1: Get a PostgreSQL Database (Choose One)

**Option A: Vercel Postgres (Recommended)**
```bash
# In Vercel dashboard:
# 1. Go to Storage → Create Database → Postgres
# 2. Copy connection string
# 3. Add to environment: DATABASE_URL=...
```

**Option B: Neon (Free Tier)**
- Visit https://neon.tech
- Create project
- Copy connection string

**Option C: Local PostgreSQL**
```bash
createdb zeta_data_bundles
# DATABASE_URL="postgresql://postgres:password@localhost:5432/zeta_data_bundles?schema=public"
```

### Step 2: Set Environment Variable

Create `.env.local` file:
```
DATABASE_URL="your_postgres_connection_string_here"
```

### Step 3: Push Schema & Seed Data

```bash
npm run db:push    # Creates tables
npm run db:seed    # Adds networks, packages, admin
```

### Step 4: View Database (Optional)

```bash
npm run db:studio  # Opens visual database editor
```

### Step 5: Test Login

```bash
npm run dev
# Visit: http://localhost:3000/admin/login
# Use: admin@zetadata.com / password123
```

## 📁 File Structure

```
zeta_data_bundles/
├── prisma/
│   ├── schema.prisma          ← Database models
│   ├── seed.ts                ← Initial data
│   └── .env
├── app/
│   ├── admin/
│   │   ├── login/page.tsx     ← Login page (fixed)
│   │   └── dashboard/page.tsx ← Admin dashboard
│   ├── api/auth/
│   │   └── login/route.ts     ← Login API
│   └── page.tsx               ← Home page
├── .env.local.example         ← Copy & rename to .env.local
├── DATABASE_SETUP.md          ← Detailed setup guide
├── DB_SUMMARY.md              ← Database overview
└── QUICK_START.md             ← This file
```

## 📊 Database Relationships

```
Admin ──┐
        │
        └─→ (Admin creates/manages)

Network (4)
    ├── MTN
    │   └── DataPackages (7) ──┐
    ├── Airtel               │
    │   └── DataPackages (7) ├──→ Orders
    ├── Glo                  │
    │   └── DataPackages (7) ├──→ Orders
    └── 9mobile              │
        └── DataPackages (7) ┘

Orders: NEVER DELETE (mark complete instead)
```

## 🎯 What's Ready to Build Next

1. **Shop Page** - Display networks & packages
   - Fetch from database
   - User selects package
   - Shows price

2. **Order Form** - Customer checkout
   - Input phone number (10+ digits validation)
   - Select network & package
   - Show price

3. **Payment** - Paystack integration
   - MoMo payment
   - Generate receipt
   - Save order to database

4. **Admin Dashboard** - Order management
   - View pending orders
   - See customer phone & package
   - Mark as completed
   - View order history (never deleted)

## 🔐 Security Notes

⚠️ **Before Production:**
- Change default admin password
- Use strong environment variables
- Enable SSL for database
- Set up proper backups
- Use NEXTAUTH_SECRET

## 📞 Admin Default Credentials

- Email: `admin@zetadata.com`
- Password: `password123`
- **Change these before going live!**

## 🐛 Troubleshooting

**"DATABASE_URL not found"**
→ Create `.env.local` file with your connection string

**"Relation does not exist"**
→ Run `npm run db:push` then `npm run db:seed`

**"Can't connect to database"**
→ Check connection string is correct
→ Ensure database is running (for local PostgreSQL)

## ✨ Next Phase

Ready to build the shop page? Let me know and I'll:
1. Create a page showing all networks
2. Create a page showing packages by network
3. Set up the order form with phone validation
4. Integrate Paystack for payments

---

**Status**: Database ready! 🎉 Just add your DATABASE_URL to .env.local and run:
```bash
npm run db:push
npm run db:seed
npm run dev
```
