# StockFlow: Inventory Management System

StockFlow is a modern inventory management solution built with [Next.js](https://nextjs.org), designed to help businesses efficiently track inventory, warehouse operations, and staff roles. This project uses Next.js App Router, optimized Google fonts, and a robust authentication and role-based authorization system.

## Features

- **Role-Based Access Control**: Admin, Inventory Manager, and Warehouse Staff roles.
- **Email Verification & OTP Authentication**
- **Admin Dashboard**: Manage users, inventory, and oversee operations.
- **Modern UI**: Uses [Geist](https://vercel.com/font) and Plus Jakarta Sans for a sleek, readable design.
- **Optimized for Production**: Secure session handling, protected routes, and deploy-ready configuration.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/stockflow.git
cd stockflow
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and set up your variables (database URL, SMTP, session secret, etc).

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Default Admin Credentials

> **Note:** Use these credentials to access the admin dashboard in local development.

- **Email:** shivamdevofficial07@gmail.com
- **Password:** admin@gmail.com

> ⚠️ Change these credentials in production for security reasons!

## File Structure

- `app/`: Next.js App Router codebase
    - `app/(dashboard)/admin/`: Admin dashboard routes/layouts
- `lib/`: Shared utilities (authentication, session, etc.)
- `prisma/`: Database schema and migrations

## Technologies Used

- [Next.js](https://nextjs.org/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/) (or other supported DB)
- [Tailwind CSS](https://tailwindcss.com/)
- [Nodemailer](https://nodemailer.com/) (for emails)
- [JWT](https://jwt.io/) for secure sessions

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [StockFlow Wiki](https://github.com/your-org/stockflow/wiki) (coming soon!)

## License

MIT

---

_Questions, feedback, or contributions are always welcome!_

