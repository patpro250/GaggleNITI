# Library Management System - Backend

## Overview

The **Library Management System (LMS) Backend** is a Node.js-based API designed to manage the core functionalities of a library. It provides endpoints for book management, user authentication, borrowing and returning books, and library analytics.

## Features

- 📚 **Book Management**: CRUD operations for books.
- 👥 **User Authentication**: Secure JWT-based authentication.
- 🎫 **Membership Management**: User registration and role-based access.
- 🔄 **Borrow & Return System**: Tracks book lending and returns.
- 📊 **Dashboard & Reports**: Provides key insights into library usage.
- 🔐 **Role-Based Access Control**: Admin, librarian, and user roles.

## Tech Stack

- **Runtime**: Node.js (Express.js)
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: JWT & bcrypt
- **API Documentation**: Swagger
- **Validation**: Joi / Zod

## Installation & Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** (latest LTS version recommended)
- **PostgreSQL** (running locally or on a cloud provider)

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/library-management-backend.git
   ```
2. Navigate to the project directory:
   ```sh
   cd library-management-backend
   ```
3. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/library_db
   JWT_SECRET=your_secret_key
   PORT=5000
   ```
5. Run database migrations:
   ```sh
   npx prisma migrate dev
   ```
6. Start the development server:
   ```sh
   npm run dev  # or yarn dev
   ```

## API Endpoints

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | /api/books         | Get all books          |
| POST   | /api/books         | Add a new book         |
| GET    | /api/users         | Get all users          |
| POST   | /api/auth/login    | User login             |
| POST   | /api/auth/register | User registration      |
| POST   | /api/borrow        | Borrow a book          |
| POST   | /api/return        | Return a borrowed book |

## Folder Structure

```
📂 library-management-backend
├── 📁 src
│   ├── 📁 controllers  # Business logic
│   ├── 📁 models       # Database models (Prisma)
│   ├── 📁 routes       # API endpoints
│   ├── 📁 middleware   # Auth & validation middleware
│   ├── 📁 config       # Configuration files
├── 📄 .env             # Environment variables
├── 📄 package.json     # Project dependencies
├── 📄 README.md        # Project documentation
```

## Deployment

To deploy the backend, follow these steps:

1. Build the project:
   ```sh
   npm run build
   ```
2. Start the production server:
   ```sh
   npm start
   ```

Alternatively, deploy on **Railway**, **Render**, or **DigitalOcean**.

## License

MIT License © 2025 Gaggleniti Group Company
