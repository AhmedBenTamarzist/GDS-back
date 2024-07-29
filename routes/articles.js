const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Get all articles
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.execute('SELECT * FROM articles');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new article
router.post('/', async (req, res) => {
  const { nom, quantite, marque, prix, prix_achat, description } = req.body;
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO articles (nom, quantite, marque, prix, prix_achat, description) VALUES (?, ?, ?, ?, ?, ?)',
      [nom || null, quantite || 0, marque || null, prix || 0, prix_achat || 0, description || null]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update an article
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prix } = req.body;
  try {
    const [result] = await pool.execute('UPDATE articles SET nom = ?, prix = ? WHERE id = ?', [nom, prix, id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new route to update stock
router.put('/updateStock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantite, prix,prix_achat } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE articles SET quantite = quantite + ? , prix = ? , prix_achat= ? WHERE id = ?',
      [quantite, prix,prix_achat, id]
    );
    res.json({ message: 'Stock updated successfully(add to stock)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Add a new route to update stock(sustraction)
router.put('/sustractioStock/:id', async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;

  try {
    // Fetch current quantite to ensure stock does not go negative
    const [currentArticle] = await pool.execute('SELECT quantite FROM articles WHERE id = ?', [id]);

    if (currentArticle.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const currentQuantite = currentArticle[0].quantite;

    if (currentQuantite < quantite) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update stock quantite
    const [result] = await pool.execute(
      'UPDATE articles SET quantite = quantite - ? WHERE id = ?',
      [quantite, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Optionally return the updated stock
    const [updatedArticle] = await pool.execute('SELECT quantite FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Stock updated successfully', newQuantite: updatedArticle[0].quantite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an article
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ changes: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
