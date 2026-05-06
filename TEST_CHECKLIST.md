# Flower Shop - Local Testing Checklist

## Server Status
- [ ] Dev server starts without errors: `pnpm dev`
- [ ] No compilation errors in terminal
- [ ] Server ready on http://localhost:3000

## Page Rendering Tests

### Home Page
- [ ] Homepage loads at `/en`
- [ ] Hero section displays
- [ ] Featured products section shows products
- [ ] Categories section displays flower categories
- [ ] Testimonials section shows customer reviews
- [ ] Footer displays contact information

### Navigation
- [ ] Navigation bar appears on all pages
- [ ] Language switcher works (EN/VI toggle)
- [ ] Navigation links work correctly
- [ ] Cart icon displays item count
- [ ] User menu appears when logged out

### Shop Page
- [ ] Shop page loads at `/en/shop`
- [ ] Product grid displays multiple flowers
- [ ] Product cards show image, name, price
- [ ] Search/filter functionality works
- [ ] "Add to Cart" buttons are clickable
- [ ] Products responsive on mobile

### Product Detail
- [ ] Product detail page loads at `/en/shop/[slug]`
- [ ] Product images display correctly
- [ ] Product details (name, price, description) show
- [ ] Quantity selector works (increment/decrement)
- [ ] "Add to Cart" button adds items correctly
- [ ] Related products section displays

### Shopping Cart
- [ ] Cart page loads at `/en/cart`
- [ ] Added items appear in cart
- [ ] Cart item count updates in navigation
- [ ] Quantity can be edited
- [ ] Items can be removed
- [ ] Cart total calculates correctly
- [ ] "Proceed to Checkout" button works

### Checkout Flow
- [ ] Checkout page loads at `/en/checkout`
- [ ] Step 1 (Delivery): Address form displays and validates
- [ ] Step 2 (Delivery Method): Shows 3 delivery options with pricing
- [ ] Step 3 (Payment): Shows payment method options
- [ ] Step 4 (Review): Displays order summary correctly
- [ ] Navigation between steps works (Next/Previous buttons)
- [ ] Progress indicator shows current step

### Authentication
- [ ] Login page loads at `/en/login`
- [ ] Signup page loads at `/en/signup`
- [ ] Forms validate input (email, password)
- [ ] Error messages display for invalid input

### Account Dashboard
- [ ] Account page loads at `/en/account` (when logged in)
- [ ] User profile information displays
- [ ] Orders list shows order history
- [ ] Order details can be viewed

## Functionality Tests

### Cart System
- [ ] Add items to cart from product cards
- [ ] Add items with quantity from product detail page
- [ ] Cart persists on page reload
- [ ] Quantity updates work
- [ ] Item removal works
- [ ] Clear cart works

### Internationalization (i18n)
- [ ] English version loads at `/en/...`
- [ ] Vietnamese version loads at `/vi/...`
- [ ] Language switcher changes URL correctly
- [ ] All UI text translates properly
- [ ] Translations are consistent

### Checkout Delivery Quotes
- [ ] Delivery methods show correct pricing
- [ ] Delivery cost updates checkout total
- [ ] Address validation works
- [ ] Phone number validation works

### UI/UX
- [ ] All buttons are clickable
- [ ] Forms are responsive on mobile
- [ ] No console errors in browser DevTools
- [ ] No broken images or missing icons
- [ ] Loading states display when needed
- [ ] Toast notifications appear for actions

## Browser Console Check
- [ ] No JavaScript errors in console
- [ ] No TypeScript errors in terminal
- [ ] No warnings about missing dependencies
- [ ] All API calls are defined

## Responsive Design
- [ ] Mobile view (375px) - all elements visible
- [ ] Tablet view (768px) - layout looks good
- [ ] Desktop view (1920px) - spacing is balanced

## Performance
- [ ] Initial page load time < 5s
- [ ] Navigation between pages is smooth
- [ ] No lag when adding items to cart
- [ ] Images load quickly

## Integration Points (Manual)
- [ ] Stripe webhook URL configured in Supabase
- [ ] Environment variables set in `.env.local`
- [ ] Database schema initialized
- [ ] Sample products added to database

## Known Limitations (Document Here)
- [ ] List any known issues not yet fixed
- [ ] Features that are WIP (Work in Progress)

---

## Test Execution Log
Date: ___________
Tester: ___________
Results: PASS / FAIL / PARTIAL

### Issues Found:
1. 
2. 
3. 

### Notes:
