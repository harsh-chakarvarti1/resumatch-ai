import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pool } from './db.js';
import { analyzeResume } from './matcher.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.use('/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.post('/api/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const { resumeTitle, targetRole, companyName, resumeText, jobDescription } = body;

    if (!resumeText || !jobDescription) {
      return c.json({ error: 'Resume text and job description are required.' }, 400);
    }

    const { score, matchedKeywords, missingKeywords } = analyzeResume(resumeText, jobDescription);

    const result = await pool.query(
      `INSERT INTO scans (resume_title, target_role, company_name, ats_score, matched_keywords, missing_keywords)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        resumeTitle || 'Untitled Resume',
        targetRole || 'Software Engineer',
        companyName || 'Target Company',
        score,
        matchedKeywords,
        missingKeywords,
      ]
    );

    return c.json(result.rows[0], 201);
  } catch (err) {
    console.error('Error analyzing resume:', err);
    return c.json({ error: 'Failed to analyze and store scan.' }, 500);
  }
});

app.get('/api/scans', async (c) => {
  try {
    const status = c.req.query('status');
    const search = c.req.query('search');

    let query = 'SELECT * FROM scans WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (target_role ILIKE $${params.length} OR company_name ILIKE $${params.length} OR resume_title ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    return c.json(result.rows);
  } catch (err) {
    console.error('Error fetching scans:', err);
    return c.json({ error: 'Failed to fetch scan history.' }, 500);
  }
});

app.patch('/api/scans/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();

    const result = await pool.query(
      'UPDATE scans SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return c.json({ error: 'Scan not found' }, 404);
    }

    return c.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating status:', err);
    return c.json({ error: 'Failed to update status.' }, 500);
  }
});

app.delete('/api/scans/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await pool.query('DELETE FROM scans WHERE id = $1', [id]);
    return c.json({ deleted: true });
  } catch (err) {
    return c.json({ error: 'Failed to delete scan.' }, 500);
  }
});

const port = Number(process.env.PORT) || 4000;
console.log(`ResuMatch Hono API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
