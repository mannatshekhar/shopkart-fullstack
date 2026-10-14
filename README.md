# ShopKart — Full Stack Project

Customer authentication (Lab 01), the login/home frontend flow (Lab 02),
and the product catalog + discovery experience (Lab 03) — all in one
project.

```
shopkart-fullstack/
├── backend/
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   └── product.controller.js
│   ├── models/
│   │   ├── customer.model.js
│   │   └── product.model.js
│   ├── routes/
│   │   ├── customer.routes.js
│   │   └── product.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── public/              (a plain HTML/CSS/JS version of the auth UI)
│   ├── index.js
│   ├── seed.js               (populates sample products)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── .env.example
└── postman/
    └── ShopKart-Auth.postman_collection.json
```

## 1. Prerequisites

- Node.js v18+
- A MongoDB database (local `mongod`, or a free MongoDB Atlas cluster)

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
```
MONGO_URI=mongodb://127.0.0.1:27017/shopkart      # or your Atlas URI
JWT_SECRET=some_long_random_string
```

Start it:
```bash
npm start
```
You should see:
```
MongoDB connected successfully.
ShopKart auth server running on http://localhost:5000
```

Optional — populate sample products so the catalog isn't empty:
```bash
npm run seed
```

## 3. Set up the frontend

In a **second terminal**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open **http://localhost:5173**.

The backend must already be running — the frontend has no server of its
own, it only calls the backend's API.

## 4. What's in each lab

### Lab 01 — Authentication API (backend)
- `POST /customers/register`, `POST /customers/login`
- `GET /customers/me` (protected — JWT in an HttpOnly cookie)
- `POST /customers/logout`
- `PATCH /customers/change-password` (bonus)
- Passwords hashed with bcrypt, never stored or returned in plaintext

### Lab 02 — Auth frontend (React)
- `/register`, `/login` — controlled forms, validation, cookie-based login
- `/home` — protected page, fetches `/customers/me`, redirects to `/login`
  if not authenticated
- Navbar logout clears the cookie and redirects to `/login`

### Lab 03 — Product catalog (backend + frontend)

**Backend:**
- `POST /products` — create a product (`400` on missing field, price ≤ 0,
  or negative stock)
- `GET /products` — supports `?search=`, `?category=`, and `?sort=price_asc`
  / `?sort=price_desc` (bonus), all combinable; builds the MongoDB query
  dynamically instead of one endpoint per filter
- `GET /products/:id` — `400` for a malformed ID, `404` if not found

**Frontend:**
- `/products` — fetches the list, debounced search + category dropdown,
  handles loading / error / empty states, renders a responsive grid of
  `ProductCard`s (no hardcoded cards)
- `/products/:id` — fetches by URL parameter, shows the full product with
  an "Add to Cart" button (UI only, disabled when out of stock)

## 5. Testing with Postman

Import `postman/ShopKart-Auth.postman_collection.json` for the auth
endpoints. For products, test directly against `http://localhost:5000/products`
with the request bodies shown in the Lab 03 brief.

## 6. Notes on the implementation

- Both backend features follow MVC: `models/` → `controllers/` → `routes/`,
  with `middlewares/` for auth and `utils/` for the token helper.
- The frontend keeps all backend calls in `src/services/api.js` — no
  component talks to axios directly.
- A single Express server (`backend/index.js`) serves both `/customers/*`
  and `/products/*` under one process; the React app in `frontend/` is a
  separate process during development (`npm run dev`) that calls that API
  over CORS with credentials.
