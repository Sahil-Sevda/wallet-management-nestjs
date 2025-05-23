#  NestJS Wallet App

A modular, secure wallet management backend built with **NestJS**, **Prisma ORM**, and **PostgreSQL**. It handles user registration, wallet creation, authentication, role-based access control, and transaction management (deposit, withdraw, transfer) with full transaction history.

---

##  Features

-  User registration and login with JWT authentication
-  Role-based access control (`user`, `admin`)
-  Wallet creation on user signup
-  Deposit, Withdraw, and Transfer funds
-  View transaction history with filtering and pagination
-  Prisma + PostgreSQL integration

---

##  Tech Stack

- **Backend:** NestJS (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** class-validator
- **Auth:** JWT
- **Environment Management:** dotenv

---

##  Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Sahil-Sevda/wallet-management-nestjs
cd wallet-management-nestjs

### 2. Install dependencies
npm install

### 3. Configure .env
Create a .env file based on .env.example

### 4. Setup database and Prisma
npx prisma generate
npx prisma migrate dev --name init

### 5. Start the server
npm run start:dev

### Live swagger link( deployed on render)
https://wallet-management-nestjs.onrender.com/swagger-doc