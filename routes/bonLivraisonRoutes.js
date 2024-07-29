const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Get all bons de livraison
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.execute('SELECT * FROM bons_de_livraison');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bon de livraison by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.execute('SELECT * FROM bons_de_livraison WHERE id = ?', [id]);
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
// Add a new bon de livraison
router.post('/', async (req, res) => {
  const { date, id_client, prix_total } = req.body;
  try {
    const [result] = await pool.execute('INSERT INTO bons_de_livraison (date, id_client, prix_total) VALUES (?, ?, ?)',
      [date, id_client, prix_total]
    );
    const factureId = insertResult.insertId;

    // Generate the reference and update the facture
    const factureRef = `BL${factureId}`;
    await pool.execute(
      'UPDATE bons_de_livraison SET ref = ? WHERE id = ?',
      [factureRef, factureId]
    );

    res.json({ id: factureId, ref: factureRef });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a bon de livraison
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { date, id_client } = req.body;
  try {
    const [result] = await pool.execute('UPDATE bons_de_livraison SET date = ?, id_client = ? WHERE id = ?', [date, id_client, id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a bon de livraison
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM bons_de_livraison WHERE id = ?', [id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
