# Roxiler – Assignment

Full-stack application with:
- Frontend (React + React Router)
- Backend (Node/Express API)
- Database schema (MySQL)

## Project Structure

- `frontend/` – React UI (login, registration, dashboards, stores, ratings)
- `backend/` – Express API (auth, admin, owner, user, stores, ratings)
- `db/schema.sql` – Database schema (`users`, `stores`, `ratings`)

## Database

- Database name: `store_rating_app`
- Schema file: `db/schema.sql`

Tables:
- `users` – all users (admins, owners, normal users)
- `stores` – stores linked to owners
- `ratings` – user ratings for stores (1–5)

## Test Accounts

Use these accounts to log in and test different roles.

### Normal User
- **Email:** `test1@example.com`
- **Password:** `test1@example.com`
- **Role:** `USER`
- **Access:**
  - View stores
  - Submit ratings
  - Access user-facing features

### Store Owner
- **Name:** Priya Sharma  
- **Email:** `priya.storeowner@example.com`
- **Password:** `OwnerPassword@12`
- **Role:** `OWNER`
- **Access:**
  - Owner dashboard at `/owner/dashboard`
  - View stores owned
  - View ratings received for those stores

### System Admin
- **Email:** `admin@storeapp.com`
- **Password:** `Admin@123`
- **Role:** `ADMIN`
- **Access:**
  - Admin dashboard at `/admin/dashboard`
  - Overview statistics (users, stores, ratings)
  - List and filter users and stores
  - Add new users (including store owners)
  - Add new stores under existing owners

## Setup Instructions

1. **Install dependencies**

   ```bash
   cd frontend
   npm install

   cd ../backend
   npm install
   ```

2. **Configure database connection**

   - Create a MySQL database: `store_rating_app`
   - Import the schema from `db/schema.sql`
   - Configure your DB connection in the backend (e.g., `.env` file)

3. **Run database schema**

   ```bash
   mysql -u root -p < db/schema.sql
   ```

4. **Start the servers**

   From the project root (or in separate terminals):

   ```bash
   cd frontend
   npm run dev

   cd ../backend
   npm start
   ```

5. **Open the app**

   - Frontend: usually `http://localhost:5173`
   - Backend API: usually `http://localhost:5000`

   - Login page: `http://localhost:5173/login`
   - Register: `http://localhost:5173/register`
