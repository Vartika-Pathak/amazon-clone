# amazon-clone

A scoped rebuild of Amazon.com's core shopping flow: browse, search/filter, product detail, cart, checkout, and order history.

## What's built

- **Auth**: signup/login with JWT, passwords hashed with BCrypt
- **Product catalog**: browse, keyword search, category filter, product detail page
- **Cart**: add/update/remove items, persisted per user
- **Checkout**: shipping address form, order placement (demo — no real payment processing)
- **Order history**: past orders with line items and status

## Deliberately left out (scope decisions)

- Reviews/ratings submission (ratings are seeded, not user-generated)
- Multiple sellers / marketplace listings
- Real payment processing (Stripe, etc.)
- Wishlist / saved items
- Recommendations engine
- Admin/seller dashboard

These were cut to keep the core buyer journey solid rather than spreading thin across features.

## Stack

- **Backend**: Java 17, Spring Boot 3, Spring Security + JWT, Spring Data JPA, SQLite
- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Axios

## Running locally

### Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`. Uses a local SQLite file (`amazonclone.db`), auto-created and seeded with sample products on first run.

### Frontend
```bash
cd frontend
cp .env.example .env   # point VITE_API_URL at your backend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

## Deployment notes

- Backend: deploy the Spring Boot app (e.g. Render, Railway, Fly.io). Set the `JWT_SECRET` env var to a long random string in production, and `PORT` if your platform requires it.
- Frontend: deploy the static build (e.g. Vercel, Netlify, Render static site). Set `VITE_API_URL` to your deployed backend's URL at build time.
- Update `CorsConfig.java`'s allowed origin from `*` to your deployed frontend's exact origin before going to production.

## API overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns JWT |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/products` | — | List/search/filter products (`q`, `category`, `minPrice`, `maxPrice`) |
| GET | `/api/products/{id}` | — | Product detail |
| GET | `/api/products/categories` | — | Distinct category list |
| GET | `/api/cart` | ✓ | Get current user's cart |
| POST | `/api/cart` | ✓ | Add item to cart |
| PUT | `/api/cart/{id}` | ✓ | Update item quantity |
| DELETE | `/api/cart/{id}` | ✓ | Remove item |
| POST | `/api/orders` | ✓ | Place order from cart |
| GET | `/api/orders` | ✓ | List current user's orders |
| GET | `/api/orders/{id}` | ✓ | Order detail |

## `.agent-logs/`

This repo includes AI-assisted work; agent capture logs live in `.agent-logs/` per the assignment's disclosure requirement.
