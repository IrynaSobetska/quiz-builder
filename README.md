# Quiz Builder

Full-stack Quiz Builder application built with Express, TypeScript, PostgreSQL, Prisma, Next.js, and Tailwind CSS.

Users can create quizzes with Boolean, Input, and Checkbox questions, view all quizzes, open quiz details, and delete quizzes.

## Project Structure

```text
quiz-builder/
|-- backend/
|   |-- prisma/
|   `-- src/
|-- frontend/
|   |-- pages/
|   |-- components/
|   `-- services/
`-- README.md
```

## Backend Setup

1. Open the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/quiz_builder"
PORT=4000
```

Change the username, password, host, port, or database name if your PostgreSQL setup is different.

4. Start the backend:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

## Database Setup

1. Open pgAdmin 4.
2. Create a PostgreSQL database named `quiz_builder`.
3. Make sure the password in `backend/.env` matches your PostgreSQL user password.
4. Run Prisma migration from the `backend` folder:

```bash
npx prisma migrate dev
```

5. Generate Prisma Client if needed:

```bash
npx prisma generate
```

## Create Sample Quiz

From the `backend` folder, run:

```bash
npm run seed
```

This creates a sample quiz named `Frontend Fundamentals` with Boolean, Input, and Checkbox questions.

## Frontend Setup

1. Open the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3000
```
