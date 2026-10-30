# Tawa & Taste

Tawa & Taste is a restaurant management and customer ordering system created as a university and personal portfolio project. It demonstrates a database-backed Next.js application with customer authentication, menu browsing, ordering, table reservations, receipts, and a simulated payment workflow.

> **Academic project:** This application is for learning and demonstration. It is not a commercial production system, and its payment flow does not process real money.

## Features

- Customer signup, login, logout, bcrypt password hashing, and database-backed sessions
- Restaurant menu and category browsing
- Menu item customization
- Shopping cart and order placement
- Order history, cancellation, and receipt views
- Restaurant table availability and reservations
- Simulated online payment completion for demonstration purposes
- PostgreSQL persistence with Prisma 8 contracts and migrations
- Responsive interface built with Tailwind CSS

## Screenshots

Screenshots can be added here for portfolio presentation:

1. Menu and category browsing
2. Item customization and cart
3. Table reservation
4. Orders and receipt

## Technology stack

- Next.js 16 App Router
- React 19
- JavaScript and JSX
- Tailwind CSS 4
- Prisma 8 (Prisma contract-first PostgreSQL ORM)
- PostgreSQL 16
- Zod validation
- bcrypt password hashing

## Project structure

```text
app/             Next.js routes and server actions
components/      Reusable UI components
context/         Client-side cart state
lib/             Database access, authentication, and data mapping
prisma/          Prisma 8 contract and emitted artifacts
migrations/      Prisma migration history and snapshots
scripts/         Seed data and database seeding script
public/          Static assets
```

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 16 or a compatible PostgreSQL server

## Installation

```bash
npm install
```

Create a PostgreSQL database for the project, then copy the environment template:

```bash
cp .env.example .env.local
```

Update `DATABASE_URL` in `.env.local` with your local PostgreSQL connection string. Keep `.env`, `.env.local`, passwords, and other secret-bearing files out of GitHub.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/tawa_taste"
```

## Prisma and database setup

Prisma 8 uses `prisma/contract.prisma` as the source contract. The generated `prisma/contract.json` and `prisma/contract.d.ts` files are required by the application and are refreshed by the contract command.

Emit the contract:

```bash
npm run contract
```

Apply the checked-in migrations to your configured database using the Prisma 8 migration workflow appropriate for your environment. Seed the sample restaurant data:

```bash
npm run db:seed
```

The seed script creates sample roles, menu data, tables, and demonstration orders. Do not run it against a database containing private or production customer data.

## Run locally

Development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production-style verification:

```bash
npm run lint
npm run contract
npm run build
npm start
```

Database-backed pages are rendered at request time, so a valid `DATABASE_URL` and reachable PostgreSQL database are required when exercising those routes.

## Demo payment

The payment action is intentionally simulated for this academic project. It creates a local payment record and marks the demonstration bill as paid; it does not connect to Stripe, SSLCommerz, a bank, or any other real payment provider. No real money or payment card data should be entered.

## Academic disclaimer

This project is provided for educational and portfolio purposes. It has not been designed, audited, or operated as a commercial restaurant platform. Before any real deployment, payment, privacy, operational, and security requirements would need a separate production engineering review.
