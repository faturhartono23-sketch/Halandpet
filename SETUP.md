# Halandpet - Setup & Usage Guide

## Project Overview

Halandpet is a comprehensive veterinary clinic and petshop management system built with Next.js 16, Supabase, and React. It integrates POS functionality, medical records management, customer/pet databases, and owner-controlled pricing with automatic audit trails.

## Prerequisites

- Node.js 18.17+ and npm/pnpm installed
- Supabase project with database configured
- Environment variables properly set in `.env.development.local`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

The database schema has been migrated automatically. To verify the setup:

```bash
# Check database tables via Supabase dashboard
# Tables: profiles, customers, pets, products, services, transactions, transaction_items, visits, price_history, product_categories
```

### 3. Seed Test Data

Create users and sample data for testing:

```bash
npm run seed:auth      # Creates: owner@example.com, dokter@example.com, staff@example.com, customer@example.com
npm run seed:data      # Creates: products, services, customers, pets, categories
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Login Credentials

After seeding, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@example.com | Owner123! |
| Dokter | dokter@example.com | Dokter123! |
| Staff | staff@example.com | Staff123! |
| Customer | customer@example.com | Customer123! |

## Module Overview

### 1. Dashboard (`/dashboard`)
- Overview of active products, services, and transactions
- Quick links to all major modules
- Real-time statistics from database

### 2. Product Management (`/products`)
- View active products with stock status
- Create new products with categories
- Adjust stock quantities with reason tracking
- Manage product categories
- Color-coded stock alerts (Green=OK, Yellow=Low, Red=Critical)

### 3. Services Management (`/clinic/services`)
- Create and manage clinic services
- Set service pricing and duration
- Service list with pricing details

### 4. Customer & Pet Management
- `/customers` - Add customers and view their pet count
- `/pets` - Add pets to customers with species, breed, birth date
- View recent medical history per pet
- Click customer card for detailed profile

### 5. Clinic Module
- `/clinic/visits` - Record medical visits for pets
- Save diagnosis, treatment notes, weight, and next visit recommendation
- Visit status tracking (ongoing/completed)
- Integrated medical history by pet

### 6. POS (Point of Sale) Module

#### Main POS (`/pos`)
- Shopping cart interface
- Load products and services dynamically from database
- Discount management

#### Checkout (`/pos/checkout`)
- Select items from products and services
- Choose customer (or walk-in anonymous)
- Assign pet for services
- Select payment method (cash/transfer/other)
- Snapshot pricing - prices are locked at transaction time
- Auto-generate transaction number
- Stock auto-decrement on transaction completion

#### Transaction List (`/pos/list`)
- View all transactions with customer names
- Expand transactions to see itemized details
- Filter by status and payment status

#### Void Transaction (`/pos/void`)
- Owner-only function to cancel transactions
- Record void reason for audit trail
- Updates transaction status to 'void'

### 7. Pricing Control (`/owner/pricing`)
**Owner-only module**
- Update product and service prices
- Full audit trail of price changes (old price → new price)
- Price changes recorded in `price_history` table
- Historical transactions preserve snapshot prices
- Future transactions use new prices

### 8. Reports (`/reports`)
- Transaction count and total revenue
- Active products and services count
- Real-time data from all transactions

## Database Schema

### Core Tables

**profiles** - User accounts from Supabase Auth
- id (UUID) - References auth.users
- full_name, role (owner/dokter/staff/customer)
- phone, is_active

**customers** - Pet owner records
- id, full_name, phone, address
- created_by (staff/owner who created the record)

**pets** - Individual animal records
- id, customer_id, name, species, breed, sex
- birth_date, weight_kg, notes, photo_url

**products** - Inventory items
- id, name, category_id, sku, price, cost_price
- stock_qty, unit, min_stock_alert, is_active

**services** - Clinic services
- id, name, description, price, duration_minutes, is_active

**transactions** - POS transactions
- id, transaction_number (unique)
- customer_id (nullable for walk-in)
- cashier_id (staff/owner who processed)
- subtotal, discount, total
- payment_method, payment_status, status (completed/void)
- voided_by, voided_reason (if voided)

**transaction_items** - Line items per transaction
- id, transaction_id, item_type (product/service)
- item_id, item_name_snapshot, price_at_transaction, qty, line_total, pet_id

**visits** - Medical visit records
- id, pet_id, handled_by (dokter/owner)
- visit_type, diagnosis, treatment_notes, weight_kg
- next_visit_recommendation, status (ongoing/completed)
- transaction_id (if linked to paid service)

**price_history** - Audit trail for price changes
- id, item_type (product/service), item_id
- old_price, new_price, changed_by, changed_at

**product_categories** - Category lookup
- id, name (unique)

## Authorization & RLS

Row-Level Security (RLS) enforces all permissions at database level:

- **Owner**: Full access to all modules, pricing control, transaction voiding
- **Dokter**: Can view/create clinic visits, see customer/pet data
- **Staff**: Can create transactions, manage products, adjust stock
- **Customer**: Can only see their own pet data and transactions

Access is controlled through role checks in `lib/domain/auth/permissions.ts` and RLS policies in Supabase.

## Key Features Implemented

### Snapshot Pricing
When a transaction is created, prices are locked from the product/service price at that moment. Historical transactions preserve those snapshot prices even if prices change later.

### Stock Management
- Stock automatically decrements when products are added to completed transactions
- Stock adjustment forms allow manual adjustments with reason tracking
- Min stock alert threshold triggers visual warnings

### Audit Trail
- Price changes recorded in `price_history` with old→new values
- Transaction voiding records who voided and why
- All creation/update timestamps tracked

### Role-Based Access
Menu visibility and module access controlled by user role. Owner-only modules like pricing control are inaccessible to other roles.

### Form Validation
Input normalization functions in `lib/domain/` validate and clean all form data before database insertion.

## Project Structure

```
app/
├── (auth)/login/              # Login form and authentication
├── (dashboard)/               # Main app routes
│   ├── dashboard/             # Home page
│   ├── products/              # Product CRUD
│   ├── customers/             # Customer management
│   ├── pets/                  # Pet profiles
│   ├── pos/                   # Point of sale
│   ├── clinic/                # Medical records
│   ├── owner/pricing/         # Price control (owner-only)
│   └── reports/               # Analytics
├── components/                # Reusable UI components
├── page.tsx                   # Landing page
└── layout.tsx                 # Root layout

lib/
├── supabase/                  # Supabase client
├── domain/                    # Business logic
│   ├── auth/                  # Permission checks, profile
│   ├── products/              # Product validation, stock
│   ├── customers/             # Customer data normalization
│   ├── pets/                  # Pet data validation
│   ├── pos/                   # Cart, checkout logic
│   ├── clinic/                # Visit records
│   ├── pricing/               # Price history, updates
│   ├── services/              # Service validation
│   └── transactions/          # Transaction building
└── styles/                    # Global styles

scripts/
├── seed-auth-users.js         # Create auth users
└── seed-full-data.js          # Populate test data
```

## Testing Workflows

### 1. Test POS Transaction
1. Go to `/pos/checkout`
2. Select a customer or leave as walk-in
3. Add products and services
4. Click "Simpan Transaksi"
5. Verify stock decremented in `/products`
6. Check transaction in `/pos/list`

### 2. Test Price Update (Owner)
1. Login as owner
2. Go to `/owner/pricing`
3. Select a product and enter new price
4. Click "Simpan perubahan harga"
5. Verify price changed in `/products`
6. Verify audit entry in price history table

### 3. Test Medical Visit (Dokter)
1. Login as dokter
2. Go to `/clinic/visits`
3. Select a pet and fill visit details
4. Click "Simpan Visit"
5. Verify visit appears in `/pets` for that pet

### 4. Test Void Transaction (Owner)
1. Login as owner
2. Go to `/pos/void`
3. Enter transaction number from `/pos/list`
4. Enter void reason
5. Click "Simpan Void"
6. Verify status changed to "void" in transaction list

## Performance Considerations

- Supabase client is singleton-initialized to prevent multiple connections
- Server-side data fetching in page components reduces client-side bundle size
- RLS policies enforce security at database level, not in application code
- Transaction items are batch-inserted for efficiency

## Troubleshooting

### Issue: "Supabase is not configured"
**Solution**: Verify `.env.development.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: Cannot create transactions
**Solution**: Ensure you're logged in as owner/staff and database has products/services

### Issue: Stock not decrementing
**Solution**: Transaction must complete successfully and be saved with status "completed"

### Issue: Owner can't access pricing module
**Solution**: Verify profile role is set to 'owner' in the database profiles table

## Deployment

### To Vercel
```bash
git push origin main
# Vercel automatically detects Next.js and deploys
```

### Environment Variables
Set these in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## Support

For issues or questions:
1. Check the PRD.md for detailed feature specifications
2. Review database schema in Supabase dashboard
3. Check RLS policies in Supabase → Authentication → Policies

---

**Last Updated**: July 14, 2026
**Version**: 1.0.0
