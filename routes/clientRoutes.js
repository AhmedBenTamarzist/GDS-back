const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // Assuming db.js exports the mysql2/promise pool

// Get all clients
router.get('/', async (req, res) => {
  try {
    const [results, fields] = await pool.execute('SELECT * FROM clients');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result, fields] = await pool.execute('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new client
router.post('/', async (req, res) => {
  const { nom, tel1, tel2, adresse } = req.body;
  try {
    const [result, fields] = await pool.execute('INSERT INTO clients (nom, tel1, tel2, adresse) VALUES (?, ?, ?, ?)', [nom, tel1, tel2, adresse]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { nom, tel1, tel2, adresse } = req.body;
  try {
    const [result, fields] = await pool.execute('UPDATE clients SET nom = ?, tel1 = ?, tel2 = ?, adresse = ? WHERE id = ?', [nom, tel1, tel2, adresse, id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result, fields] = await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
