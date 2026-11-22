Full-stack ATS resume keyword scorer and job application tracker built with React, TypeScript, Vite, Tailwind CSS, Node.js, Hono, and PostgreSQL (Neon).

## Live Links
- **Frontend (Vercel):** https://resumatch-ai-three.vercel.app/
- **Backend API (Render):** https://resumatch-ai-meof.onrender.com/api/health

## Key Features
- **ATS Keyword Matcher:** Extracts keywords from a pasted resume and job description to compute an ATS match score along with matched and missing keywords.
- **Persistent Application Tracker:** Stores scans in PostgreSQL and supports status updates (`Scanned`, `Applied`, `Interview`, `Offer`, `Rejected`), status/text filtering, and deletion.
- **Production Routing:** Uses Vercel rewrites to proxy `/api/*` requests to the Hono backend while keeping database credentials isolated on the server.

## Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend:** Node.js, Hono, TypeScript
- **Database:** PostgreSQL (Neon)

## Have a look at Resumatch-AI

<img width="2564" height="1728" alt="image" src="https://github.com/user-attachments/assets/02d4dc7b-ffc1-4765-b736-992d4ed2bd39" />
