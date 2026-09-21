# ProductIQ — AI Product Assistant

ProductIQ is a chat assistant for Amazon products.

- **Add products:** paste an Amazon product link and the app fetches the product details.
- **Get answers:** ask questions about the product, or compare several products, and get an answer from AI.

## Tech stack

### Frontend

- React
- Vite
- Tailwind CSS
- react-markdown

### Backend

- Node.js and Express
- MySQL with TypeORM
- Playwright (product scraping)
- Google Gemini API

## Run locally

**You need:** Node.js, MySQL, and a [Gemini API key](https://aistudio.google.com/apikey).

**1. Install**

```bash
cd backend
npm install
npx playwright install chromium

cd ../frontend
npm install
```

**2. Create the database**

```sql
CREATE DATABASE ai_product_assistant;
```

**3. Set up the environment files**

```bash
cp backend/.env.sample backend/.env
cp frontend/.env.sample frontend/.env
```

In `backend/.env`, set `PORT=5000`, your `GEMINI_API_KEY`, and your MySQL `DB_PASSWORD`.
In `frontend/.env`, set `VITE_API_URL=http://localhost:5000/api`.

**4. Create the tables**

```bash
cd backend
npm run migration:run
```

**5. Start the app**

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Open http://localhost:5173.
