# ResuMatch AI

Full-stack ATS resume keyword scorer and job application tracker built with React, TypeScript, Vite, Tailwind CSS, Node.js, Hono, and PostgreSQL (Neon).

## Features
- **ATS Keyword Matcher:** Extracts technical and domain keywords from a resume and job description to calculate a match score along with matched and missing keywords.
- **Application Tracker:** Persists scans in PostgreSQL and lets you filter by status (`Scanned`, `Applied`, `Interview`, `Offer`, `Rejected`), search by role/company/resume, update status, or delete records.

## Tech Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Lucide React
- **Backend:** Node.js, Hono, TypeScript (`tsx`)
- **Database:** PostgreSQL (Neon)
