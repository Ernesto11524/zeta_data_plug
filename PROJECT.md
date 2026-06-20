# Zeta Data - Mobile Data Sales Platform

A mobile-first web application for selling mobile data packages with admin order management.

## Tech Stack
- **Framework**: Next.js 14+ (React, TypeScript)
- **Styling**: Tailwind CSS (mobile-first responsive)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js (beta)
- **Password**: bcryptjs
- **HTTP**: Axios
- **Deployment**: Vercel

## Project Structure
```
app/
├── admin/
│   ├── login/              # Admin login page
│   ├── dashboard/          # Admin dashboard (orders, management)
│   ├── signup/             # Admin signup (to be created)
│   └── layout.tsx
├── api/
│   └── auth/
│       ├── login/          # POST /api/auth/login
│       └── signup/         # POST /api/auth/signup (to be created)
├── components/
│   └── admin/              # Admin-specific components
├── lib/                    # Utilities
├── types/                  # TypeScript types
├── page.tsx                # Home page (landing)
├── layout.tsx              # Root layout
└── globals.css             # Global styles

public/
└── images/                 # Static images
```

## Admin Credentials (Development Only)
- **Email**: admin@zetadata.com
- **Password**: password123

⚠️ Change these immediately before production deployment!

## Features to Build
1. ✅ Admin login page (mobile-responsive)
2. ✅ Admin dashboard stub
3. ⏳ Home page / Shop page
4. ⏳ Data package selection
5. ⏳ Phone number validation (10+ digits)
6. ⏳ Paystack payment integration (MoMo)
7. ⏳ Receipt generation
8. ⏳ Order management for admin
9. ⏳ Order history (never delete old orders)
10. ⏳ Admin order completion workflow

## Running Locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deployment to Vercel
```bash
# The project is ready for Vercel deployment
# Just push to GitHub and connect to Vercel
```

## Environment Variables (to be added)
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://yourdomain.com
```

## Mobile Responsiveness
All components are built with mobile-first approach:
- Responsive font sizes (text-sm on mobile, text-base+ on larger screens)
- Touch-friendly buttons (min-height: 44px on mobile)
- Full-width inputs and buttons on small screens
- Grid layouts that adapt from 1 column (mobile) to multiple columns (desktop)
- Proper viewport meta tag for mobile optimization

## Next Steps
1. Create shop page with data packages
2. Integrate Paystack payment gateway
3. Set up database (PostgreSQL + Prisma)
4. Implement order management features
5. Create admin features for marking orders complete
