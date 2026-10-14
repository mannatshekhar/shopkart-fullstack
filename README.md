# ShopKart

A full-stack e-commerce application built with React, Node.js, Express and MongoDB. Customers can register, browse products, save items to a wishlist, manage a cart, pay with Razorpay (Test Mode) and view their order history.

## Features

- Register and login with JWT stored in an HttpOnly cookie
- Product catalog with debounced search, category filter and price sorting
- Product details page
- Wishlist
- Shopping cart with global state (Navbar count updates instantly)
- Checkout with shipping form validation
- Razorpay Test Mode payment with server-side signature verification
- Server-side stock check and total calculation
- Order history and order details, visible only to the order's owner

## Tech stack

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt
- **Payments:** Razorpay (Test Mode)

## Project structure

```
shopkart-fullstack/
├── backend/
│   ├── config/         razorpay.js
│   ├── controllers/    customer, product, cart, order
│   ├── models/         customer, product, order
│   ├── routes/
│   ├── middlewares/    auth.middleware.js
│   ├── utils/          generateToken.js
│   ├── index.js
│   ├── seed.js         populates sample products
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/       Register, Login, Home, Products, ProductDetails,
│       │                Wishlist, Cart, Checkout, Orders, OrderDetails
│       ├── components/  Navbar, ProductCard, SearchBar, CartItem
│       ├── context/     CartContext.jsx
│       ├── services/    api.js
│       └── App.jsx
└── postman/            API collection
```

## Prerequisites

- Node.js v18+
- MongoDB (local, or a free MongoDB Atlas cluster)
- A Razorpay account in Test Mode (for test API keys)

## Setup

### 1. Backend

```
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=some_long_random_string
COOKIE_EXPIRES_DAYS=7
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

Start the server (http://localhost:5000):

```
npm run dev
```

Optional: add sample products.

```
npm run seed
```

### 2. Frontend

In a second terminal:

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The backend must be running first.

## API overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /customers/register`, `POST /customers/login`, `GET /customers/me`, `POST /customers/logout` |
| Products | `POST /products`, `GET /products` (`?search=`, `?category=`, `?sort=price_asc\|price_desc`), `GET /products/:id` |
| Orders | `POST /orders/create-payment-order`, `POST /orders/verify-payment`, `GET /orders`, `GET /orders/:id` |

Cart and wishlist routes are also protected and use the same cookie authentication.

## Payment flow

1. The frontend sends only the shipping address. It never sends prices or totals.
2. The backend validates the cart and stock, calculates the total from current product prices, saves a `PENDING_PAYMENT` order with a snapshot of each item's name and price, and creates a Razorpay order.
3. Razorpay Checkout opens in the browser.
4. The frontend sends the payment id, order id and signature to the backend.
5. The backend verifies the HMAC signature using the stored Razorpay order id. Only then is the order marked `PAID` / `PLACED` and the cart cleared.

If the payment fails or the signature is invalid, the cart is kept.

## Security notes

- Passwords are hashed with bcrypt.
- The Razorpay secret stays on the backend and is never sent to the browser.
- `.env` is git-ignored. Use only Razorpay Test Mode keys.

## Test payments

Use Razorpay Test Mode only. No real money is charged. In the checkout popup, pick Netbanking and choose Success on the test bank page.
