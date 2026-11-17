# SM BRAND — Backend Server & Setup Guide

**Phase:** Phase 2 (Core Backend & Database Seeding)  
**Runtime:** Node.js (v18+)  
**Framework:** Express.js 4.x + Mongoose 8.x + MongoDB Atlas  

---

## 1. Quick Start

### 1.1. Prerequisites
- Node.js (v18.0.0 or higher)
- Active MongoDB instance (MongoDB Atlas cluster URI or local MongoDB daemon)
- Cloudinary account credentials (for image uploads)

### 1.2. Environment Configuration
Copy the template configuration file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your connection credentials:

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sm_brand?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_cryptographic_random_string_32_chars_min
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5000
```

### 1.3. Install Dependencies
```bash
npm install
```

---

## 2. Database Seeding & Administrator Setup

### 2.1. Seed the Database (`npm run seed`)
Reads `assets/js/sm-data.js`, validates all 24 catalog products against the Mongoose schema, applies comparison matrix flags, seeds the singleton `Settings` document, and populates initial `Spare` parts:

```bash
npm run seed
```

The script prints a formatted diagnostic validation table to the console detailing every item's validation status.

### 2.2. Create Initial Administrator Account (`npm run create-admin`)
Interactive CLI command that prompts for admin name, email, and password (minimum 10 characters), encrypts the password with bcrypt (cost 12), and stores the user in MongoDB:

```bash
npm run create-admin
```

*(Note: There is no public registration endpoint; admin users can only be created via this command).*

---

## 3. Running the Server

### 3.1. Development Mode (with hot-reload)
```bash
npm run dev
```

### 3.2. Production Mode
```bash
npm start
```

Once running:
- **Public Website:** `http://localhost:5000/`
- **Admin Portal (Placeholder):** `http://localhost:5000/admin`
- **Health Check Endpoint:** `http://localhost:5000/api/health`
- **Products API:** `http://localhost:5000/api/products`

---

## 4. API Endpoints Quick Reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and health verification |
| `GET` | `/api/products` | Public | Active products catalog (supports `?category=`, `?tag=`, `?compared=true`) |
| `GET` | `/api/products/:slug` | Public | Single product details by slug or ID |
| `GET` | `/api/spares` | Public | Active replacement spare parts list |
| `GET` | `/api/settings` | Public | Global WhatsApp numbers, depot addresses, and operating hours |
| `POST` | `/api/leads` | Public | Submit quotation inquiry (rate-limited) |
| `POST` | `/api/auth/login` | Public | Admin login (rate-limited, returns HttpOnly cookie) |
| `POST` | `/api/auth/logout` | Admin | Clear session cookie |
| `GET` | `/api/auth/me` | Admin | Retrieve authenticated user payload |
| `GET` | `/api/admin/products` | Admin | List all products (including inactive) |
| `POST` | `/api/admin/products` | Admin | Create product |
| `PUT` | `/api/admin/products/:id` | Admin | Update product (slug is immutable) |
| `DELETE` | `/api/admin/products/:id` | Admin | Delete product |
| `GET` | `/api/admin/spares` | Admin | List all spare parts |
| `POST` | `/api/admin/spares` | Admin | Create spare part |
| `PUT` | `/api/admin/spares/:id` | Admin | Update spare part |
| `DELETE` | `/api/admin/spares/:id` | Admin | Delete spare part |
| `GET` | `/api/admin/settings` | Admin | Get full settings document |
| `PUT` | `/api/admin/settings` | Admin | Update settings document |
| `GET` | `/api/admin/leads` | Admin | Paginated inquiries (`?page=`, `?limit=`, `?status=`) |
| `PATCH` | `/api/admin/leads/:id` | Admin | Update lead status and sales notes |
| `POST` | `/api/admin/media/upload` | Admin | Upload image to Cloudinary (max 8MB, magic-byte checked) |
