# amazon-clone

A full-stack Amazon-style shopping experience with catalog browsing, category results, product details, cart management, OTP-verified signup, Stripe Test Mode checkout, and order history.

## Features

- OTP email verification before account creation
- JWT login with BCrypt password hashing
- Catalog import from `backend/data/raw/amazon_products_sales_data_cleaned.csv`
- Category normalization based on product names
- Search, category filters, price sorting, and category-specific filters
- Amazon-style dashboard, product detail, cart, coupons, customer service, and orders pages
- Stripe-hosted Test Mode Checkout
- Orders created only after Stripe reports a successful payment
- Cart cleared after successful order creation

## Stack

- Backend: Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA, SQLite
- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios
- Payments: Stripe Test Mode
- Email: Brevo SMTP for signup OTP delivery

## Environment variables

Set backend variables in the same PowerShell window used to start Spring Boot. Never commit these values.

```powershell
$env:STRIPE_SECRET_KEY = "sk_test_your_key"
$env:MAIL_HOST = "smtp-relay.brevo.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = "your-brevo-smtp-login"
$env:MAIL_PASSWORD = "your-brevo-smtp-key"
$env:MAIL_FROM = "your-verified-brevo-sender@example.com"
```

The frontend can use `frontend/.env` when the backend is not on port 8080:

```text
VITE_API_URL=http://localhost:8080
```

Do not commit Stripe secret keys, SMTP keys, Kaggle tokens, or `.env` files.

## Run locally

### Backend

```powershell
cd backend
mvn spring-boot:run
```

The backend runs at `http://localhost:8080`. SQLite creates `amazonclone.db` locally.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Catalog import

Place the cleaned CSV at `backend/data/raw/amazon_products_sales_data_cleaned.csv`. On startup, the backend imports up to 500 products and normalizes categories such as Phones, Laptops, Headphones, Cameras, Printers & Scanners, Storage, and Power & Batteries.

## Test payments

Use Stripe Checkout in Test Mode:

```text
Card: 4242 4242 4242 4242
Expiry: any future date
CVV: any three digits
```

After Stripe reports payment success, the backend creates the order and removes the items from the cart.

## API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/request-otp` | No | Send signup verification code |
| POST | `/api/auth/verify-otp` | No | Verify code and create account |
| POST | `/api/auth/login` | No | Sign in and return JWT |
| GET | `/api/products` | No | List/search/filter products |
| GET | `/api/products/{id}` | No | Get product details |
| GET | `/api/products/categories` | No | List catalog categories |
| GET | `/api/cart` | Yes | Get current user's cart |
| POST | `/api/cart` | Yes | Add item to cart |
| PUT | `/api/cart/{id}` | Yes | Update cart quantity |
| DELETE | `/api/cart/{id}` | Yes | Remove cart item |
| POST | `/api/payments/checkout-session` | Yes | Create Stripe Checkout session |
| POST | `/api/payments/checkout-session/{id}/complete` | Yes | Verify payment and create order |
| GET | `/api/orders` | Yes | List current user's orders |

## Deployment notes

- Use environment variables for all secrets.
- Set `FRONTEND_URL` to the deployed frontend origin for Stripe redirects.
- Configure CORS with the deployed frontend origin instead of `*`.
- Use Stripe webhooks for production-grade payment confirmation.
