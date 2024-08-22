// src/index.js (or wherever your Express server is defined)

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5430;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'iamremote-cms',
  password: '3125mhow',
  port: 5432,
});

app.use(cors());
app.use(express.json());

// Create a new job
app.post('/api/jobs', async (req, res) => {
  try {
    const {
      title,
      tags,
      salary,
      image,
      description,
      company,
      time,
      location,
      applyLink,
      classification,
      isRemote,
      applyCount,
    } = req.body;

    const tagsJSON = JSON.stringify(tags);
    const publishedAt = new Date(); // Set publishedAt to current timestamp
    
    const newJob = await pool.query(
      `INSERT INTO jobs (title, tags, salary, image, description, company, time, location, applyLink, classification, isRemote, applyCount, publishedAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [title, tagsJSON, salary, image, description, company, time, location, applyLink, classification, isRemote, applyCount, publishedAt]
    );
    res.json(newJob.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const allJobs = await pool.query('SELECT * FROM jobs');
    res.json(allJobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    res.json(job.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      tags,
      salary,
      image,
      description,
      company,
      time,
      location,
      applyLink,
      classification,
      isRemote,
      applyCount,
    } = req.body;
    
    const tagsJSON = JSON.stringify(tags);
    const publishedAt = new Date(); // Set publishedAt to current timestamp
    
    await pool.query(
      `UPDATE jobs SET title = $1, tags = $2, salary = $3, image = $4, description = $5, company = $6, 
        time = $7, location = $8, applyLink = $9, classification = $10, isRemote = $11, applyCount = $12, publishedAt = $13
       WHERE id = $14`,
      [title, tagsJSON, salary, image, description, company, time, location, applyLink, classification, isRemote, applyCount, publishedAt, id]
    );
    res.json({ message: 'Job was updated!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job was deleted!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Increment apply count endpoint
app.post('/api/jobs/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await pool.query('SELECT applyCount FROM jobs WHERE id = $1', [id]);
    
    if (!job.rows.length) {
      return res.status(404).send('Job not found');
    }

    const applyCount = job.rows[0].applycount + 1;

    await pool.query('UPDATE jobs SET applyCount = $1 WHERE id = $2', [applyCount, id]);

    res.json({ applyCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
