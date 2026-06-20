# Setting Up Vercel Postgres

## Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Select Your Project**
   - If you haven't created a project yet, create one named "zeta-data-bundles"

3. **Add Postgres Database**
   - Click on "Storage" tab
   - Click "Create Database" or "Create"
   - Select "Postgres"
   - Choose a region (closest to your users)
   - Click "Create"

4. **Wait for Database Creation**
   - Takes about 1-2 minutes
   - You'll see the database in your Storage tab

## Step 2: Get Connection String

1. **Open the Postgres Database**
   - Click on your database in Storage
   - You'll see several connection strings

2. **Copy the Connection String**
   - Look for the section labeled ".env.local"
   - Copy the entire `POSTGRES_PRISMA_URL` value
   - Should look like: `postgresql://[user]:[password]@[host]/[database]?schema=public&sslmode=require`

3. **Alternative: Use the URL directly**
   - Or copy from "Connecting to a Postgres Client" section
   - Find the connection string that includes `schema=public&sslmode=require`

## Step 3: Add to .env.local

Replace the DATABASE_URL in `.env.local`:

```
# Delete the old line:
# DATABASE_URL="postgresql://postgres:ched%402024@localhost:5432/zeta_data_bundles?schema=public"

# Add the Vercel Postgres connection string:
DATABASE_URL="postgresql://[paste-your-vercel-postgres-url-here]"

NEXTAUTH_SECRET="zeta-data-bundles-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Test Connection & Push Schema

Run these commands in order:

```bash
# Test that Prisma can connect
npx prisma db execute --stdin < /dev/null

# If above works, push the schema
npm run db:push

# Seed the database with networks and packages
npm run db:seed
```

## Step 5: Verify Database

Open Prisma Studio to view your data:

```bash
npm run db:studio
# Opens at http://localhost:5555
```

You should see:
- ✅ 4 Networks (MTN, Airtel, Glo, 9mobile)
- ✅ 28 Data Packages
- ✅ 1 Admin account

## Step 6: Add to Vercel Environment

Once everything works locally:

1. **Go to Vercel Project Settings**
   - Project → Settings → Environment Variables

2. **Add DATABASE_URL**
   - Copy your Vercel Postgres connection string
   - Add variable: `DATABASE_URL` = `[your-connection-string]`
   - Save

3. **Deploy**
   ```bash
   git add .
   git commit -m "Add database setup with Vercel Postgres"
   git push
   ```

## Troubleshooting

**"Can't connect to database"**
- Check connection string is complete and correct
- Ensure `?schema=public&sslmode=require` is included
- Copy directly from Vercel dashboard (don't manually edit)

**"Relation does not exist after deploy"**
- Add build command to Vercel: `npm run db:push && npm run build`
- In Vercel Settings → Build & Development Settings
- Set Build Command to: `prisma db push && next build`

**"Seed not running in production"**
- That's okay! Seed is for development only
- We'll add seed data to Vercel manually if needed

## What You'll Have

✅ Vercel Postgres database (managed, backed up, secure)
✅ 4 networks with 28 data packages
✅ Admin account ready to use
✅ Automatic SSL/TLS encryption
✅ Automatic backups
✅ Ready for production deployment

---

**Next:** Once DATABASE_URL is in `.env.local`, run:
```bash
npm run db:push
npm run db:seed
npm run dev
```

Then test login at http://localhost:3000/admin/login
