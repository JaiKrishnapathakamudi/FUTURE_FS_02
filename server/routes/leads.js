const express = require('express');
const { createDbHelpers, getDatabase } = require('../config/db');
const authenticate = require('../middleware/auth');
const router = express.Router();

const formatLead = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    source: row.source,
    status: row.status,
    company: row.company,
    phone: row.phone,
    notes: row.notes ? JSON.parse(row.notes) : [],
    createdAt: row.createdAt,
  };
};

const getDb = () => createDbHelpers(getDatabase());

router.get('/', authenticate, async (req, res) => {
  try {
    const { all } = getDb();
    const rows = await all('SELECT * FROM leads ORDER BY datetime(createdAt) DESC');
    res.json(rows.map(formatLead));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load leads' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { get } = getDb();
    const row = await get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    const lead = formatLead(row);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load lead' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, source = 'Website Contact Form', status = 'new', company, phone } = req.body;
    const { run, get } = getDb();
    const notes = JSON.stringify([]);
    const result = await run(
      'INSERT INTO leads (name, email, source, status, company, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, source, status, company || '', phone || '', notes]
    );
    const row = await get('SELECT * FROM leads WHERE id = ?', [result.id]);
    res.status(201).json(formatLead(row));
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to create lead' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { get, run } = getDb();
    const row = await get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    const lead = formatLead(row);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const { name, email, source, status, company, phone, note } = req.body;
    const notes = note ? [...lead.notes, { text: note, createdAt: new Date().toISOString() }] : lead.notes;
    await run(
      'UPDATE leads SET name = ?, email = ?, source = ?, status = ?, company = ?, phone = ?, notes = ? WHERE id = ?',
      [
        name || lead.name,
        email || lead.email,
        source || lead.source,
        status || lead.status,
        company || lead.company,
        phone || lead.phone,
        JSON.stringify(notes),
        req.params.id,
      ]
    );
    const updatedRow = await get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    res.json(formatLead(updatedRow));
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to update lead' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { run, get } = getDb();
    const row = await get('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Lead not found' });
    await run('DELETE FROM leads WHERE id = ?', [req.params.id]);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
});

module.exports = router;
