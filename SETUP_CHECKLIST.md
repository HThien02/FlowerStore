# Flower Shop Setup Checklist

Complete this checklist to get your flower shop up and running.

## Phase 1: Prerequisites Setup

- [ ] Create Supabase account at https://supabase.com
- [ ] Create Stripe account at https://stripe.com
- [ ] Have Node.js 18+ installed
- [ ] Have Git installed

## Phase 2: Supabase Configuration

### Database Setup
- [ ] Create new Supabase project
- [ ] Copy Supabase URL and API keys
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Copy contents of `scripts/setup-db.sql`
- [ ] Run the SQL script to create tables
- [ ] Verify all tables are created (categories, products, orders, etc.)

### Enable Authentication
- [ ] Go to Authentication > Providers
- [ ] Ensure Email/Password provider is enabled
- [ ] Configure email templates if needed
- [ ] Copy JWT Secret from Authentication Settings

## Phase 3: Environment Variables

- [ ] Create `.env.local` file in project root
- [ ] Add all Supabase variables from dashboard:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] SUPABASE_JWT_SECRET
  - [ ] POSTGRES_URL
  - [ ] POSTGRES_URL_NON_POOLING
  - [ ] POSTGRES_USER
  - [ ] POSTGRES_PASSWORD
  - [ ] POSTGRES_DATABASE
  - [ ] POSTGRES_HOST

- [ ] Add Stripe variables:
  - [ ] STRIPE_SECRET_KEY (from Stripe Dashboard)
  - [ ] STRIPE_WEBHOOK_SECRET (will be generated)
  - [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

## Phase 4: Stripe Configuration

- [ ] Go to Stripe Dashboard > API Keys
- [ ] Copy Secret Key and Publishable Key
- [ ] Go to Developers > Webhooks
- [ ] Create new endpoint pointing to `https://your-domain/api/webhooks/stripe`
- [ ] Copy Webhook Signing Secret
- [ ] Enable events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Phase 5: Initial Data Setup

### Create Sample Data

- [ ] Insert sample categories via Supabase SQL:
  ```sql
  INSERT INTO categories (name, name_vi, slug) VALUES
  ('Roses', 'Hoa Hồng', 'roses'),
  ('Tulips', 'Hoa Tulip', 'tulips'),
  ('Sunflowers', 'Hoa Hướng Dương', 'sunflowers'),
  ('Orchids', 'Hoa Lan', 'orchids');
  ```

- [ ] Insert sample products
- [ ] Insert delivery options with pricing

## Phase 6: Testing

### Local Development
- [ ] Run `pnpm install` to install dependencies
- [ ] Run `pnpm dev` to start dev server
- [ ] Visit http://localhost:3000
- [ ] Test home page loads correctly
- [ ] Test language switching (English/Vietnamese)

### Authentication Testing
- [ ] Go to `/signup` and create test account
- [ ] Verify email confirmation (if enabled)
- [ ] Go to `/login` and login with test account
- [ ] Verify account dashboard loads
- [ ] Test logout

### Shopping Flow Testing
- [ ] Go to `/shop` and browse products
- [ ] Click on product to view details
- [ ] Add product to cart
- [ ] Go to `/cart` and verify item appears
- [ ] Proceed to checkout
- [ ] Fill delivery information
- [ ] Select delivery method
- [ ] Select payment method
- [ ] Review order details

### Stripe Payment Testing (Sandbox Mode)
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify order is created in Supabase
- [ ] Check webhook was received (Stripe Dashboard > Webhooks)

## Phase 7: Production Preparation

### Code Quality
- [ ] Fix TypeScript errors (if any)
- [ ] Test all routes work correctly
- [ ] Test mobile responsiveness
- [ ] Clear console errors

### Environment Configuration
- [ ] Create production Supabase project (or use separate db)
- [ ] Create production Stripe account/keys
- [ ] Update environment variables for production

### Deployment
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Connect GitHub repo to Vercel
- [ ] Add production environment variables to Vercel
- [ ] Deploy to production
- [ ] Update Stripe webhook URL to production domain
- [ ] Test full payment flow in production

## Phase 8: Post-Launch

### Monitoring
- [ ] Set up error tracking (optional: Sentry)
- [ ] Monitor Stripe webhooks for failures
- [ ] Check database for any issues
- [ ] Monitor application performance

### Content
- [ ] Add real product images
- [ ] Update product descriptions
- [ ] Add company information
- [ ] Update contact information
- [ ] Customize email templates

### Features
- [ ] Consider adding admin panel
- [ ] Set up email notifications
- [ ] Add analytics tracking
- [ ] Implement inventory management

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify POSTGRES_URL is correct
- Check database is accessible from your network
- Verify credentials are correct

**Stripe Webhook Not Working**
- Verify webhook URL is correct and accessible
- Check webhook signing secret matches STRIPE_WEBHOOK_SECRET
- Verify events are properly enabled

**Authentication Not Working**
- Verify NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are correct
- Check authentication is enabled in Supabase
- Verify JWT_SECRET is set

**Multi-Language Not Working**
- Clear browser cache
- Verify messages/en.json and messages/vi.json exist
- Check middleware.ts is properly configured

## Getting Help

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Stripe Docs: https://stripe.com/docs
- Project Repository Issues: (your GitHub repo)

## Completed!

Once all items are checked, your flower shop is ready to go live!

Last Updated: 2024
