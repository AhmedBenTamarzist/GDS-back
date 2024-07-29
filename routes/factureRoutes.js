const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Get all factures
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.execute('SELECT * FROM factures');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get facture by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.execute('SELECT * FROM factures WHERE id = ?', [id]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new facture
router.post('/', async (req, res) => {
  const { date, id_client, prix_total } = req.body;
  console.log(req.body);

  try {
    // Insert the new facture
    const [insertResult] = await pool.execute(
      'INSERT INTO factures (date, id_client, prix_total) VALUES (?, ?, ?)',
      [date, id_client, prix_total]
    );
    const factureId = insertResult.insertId;

    // Generate the reference and update the facture
    const factureRef = `FACT${factureId}`;
    await pool.execute(
      'UPDATE factures SET ref = ? WHERE id = ?',
      [factureRef, factureId]
    );

    res.json({ id: factureId, ref: factureRef });
  } catch (error) {
    console.error('Error adding new facture:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a facture
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, id_client, prix_total } = req.body;
  try {
    const [result] = await pool.execute('UPDATE factures SET date = ?, id_client = ?, prix_total = ? WHERE id = ?', [date, id_client, prix_total, id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a facture
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM factures WHERE id = ?', [id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
