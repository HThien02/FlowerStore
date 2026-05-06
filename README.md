# Flower Shop E-Commerce Website

A beautiful, feature-rich flower e-commerce platform built with Next.js 16, Supabase, Stripe, and multi-language support (English & Vietnamese).

## Features

### Core Features
- **Product Catalog** - Browse flowers by category with advanced filtering and search
- **Shopping Cart** - Add/remove items with persistent storage via localStorage
- **Multi-Step Checkout** - Intuitive 4-step checkout process with delivery quotes
- **User Authentication** - Sign up, login, and manage account with Supabase Auth
- **Order Management** - Track orders and view order history
- **Payment Processing** - Stripe integration supporting card, bank transfer, and Momo payments

### Technical Features
- **Multi-Language** - Full English & Vietnamese support with next-intl
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-Time Database** - Supabase PostgreSQL with Row Level Security
- **Type-Safe** - Full TypeScript support throughout the app
- **Performance Optimized** - Server components, caching, and optimized queries

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: Supabase (PostgreSQL) with RLS policies
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Internationalization**: next-intl
- **Notifications**: Sonner (toast notifications)

## Project Structure

```
/app                          # Next.js app directory
  /[locale]                   # Localized routes (en, vi)
    /page.tsx                 # Home page
    /shop                     # Product catalog
    /[slug]/page.tsx          # Product detail page
    /cart                     # Shopping cart
    /checkout                 # Multi-step checkout
    /account                  # User dashboard
    /login                    # Login page
    /signup                   # Sign up page
  /api                        # API routes
    /create-payment-intent    # Stripe payment intent
    /create-order             # Order creation
    /webhooks/stripe          # Stripe webhook handler

/components
  /home                       # Home page sections
  /shop                       # Shop page components
  /product                    # Product detail components
  /cart                       # Cart components
  /checkout                   # Checkout steps
  /account                    # Account/dashboard components
  /ui                         # shadcn/ui components
  /navigation.tsx             # Navigation bar
  /footer.tsx                 # Footer

/lib
  /supabase.ts               # Supabase client
  /auth.ts                   # Auth utilities
  /db.ts                     # Database queries
  /stripe.ts                 # Stripe instance
  /cart-context.tsx          # Cart context/state
  /checkout-context.tsx      # Checkout context/state
  /auth-context.tsx          # Auth context/state

/messages                    # Translation files
  /en.json                   # English translations
  /vi.json                   # Vietnamese translations

/scripts
  /setup-db.sql              # Database schema setup

/public                      # Static assets
```

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
POSTGRES_HOST=your_db_host

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Resend (for emails, optional)
RESEND_API_KEY=your_resend_api_key
```

### 2. Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the contents of `scripts/setup-db.sql`
3. This creates all necessary tables with RLS policies

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Configure Stripe

1. Create a Stripe account at https://stripe.com
2. Add your publishable and secret keys to environment variables
3. Set up webhook endpoint pointing to `/api/webhooks/stripe`

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Key Tables

- **categories** - Product categories
- **products** - Flower products with pricing and ratings
- **reviews** - Product reviews from customers
- **cart_items** - Shopping cart items per user
- **deliveries** - Delivery options and costs
- **orders** - Customer orders
- **order_items** - Items in each order
- **user_profiles** - Extended user profile data

All tables use Row Level Security (RLS) to ensure users only access their own data.

## Authentication

### User Authentication Flow

1. Users can sign up with email and password
2. Supabase Auth handles session management
3. Protected routes redirect unauthenticated users to login
4. User profile data is stored in `user_profiles` table

### Protected Routes

- `/account` - User dashboard (requires login)
- `/checkout` - Checkout process (requires cart items)

## Payment Processing

### Payment Methods

1. **Credit Card** - Stripe Checkout
2. **Bank Transfer** - Manual transfer with order details
3. **Momo** - Mobile wallet payment

### Payment Flow

1. User completes checkout form
2. Order is created in database
3. Stripe Payment Intent is created
4. User completes payment
5. Webhook updates order status
6. Email confirmation is sent

## Multi-Language Support

The app supports English and Vietnamese with language switching in the navigation:

- Routes are automatically localized: `/en/shop`, `/vi/shop`
- Language preference is stored in URL
- All translations are in `/messages` directory

## Customization

### Adding a New Page

1. Create route in `/app/[locale]/your-page/page.tsx`
2. Use `useTranslations()` hook for text
3. Add translations to `messages/en.json` and `messages/vi.json`

### Adding Products

Products can be added via Supabase dashboard:

1. Go to Supabase SQL Editor
2. Insert product data with category_id, pricing, and images
3. Products appear on shop page automatically

### Styling

- Customize colors in `app/globals.css` CSS variables
- Use Tailwind utility classes for component styling
- Modify theme in `tailwind.config.ts`

## Testing Credentials

### Stripe Test Mode

Use these test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy
```

### Important Notes

- Ensure Stripe webhook URL is updated for production
- Database must be accessible from Vercel
- Email service (Resend) should be configured for production

## Future Enhancements

- Admin panel for product management
- Inventory management system
- Email notifications with Resend
- Subscription/recurring orders
- Product recommendations with AI
- Customer reviews and ratings system
- Wishlist feature
- Advanced analytics dashboard

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- Stripe documentation: https://stripe.com/docs

## License

MIT License - Feel free to use this template for your projects.
