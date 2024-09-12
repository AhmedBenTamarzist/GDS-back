const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Create a new article vendu
router.post('/', async (req, res) => {
  console.log(req.body);
  const { id_article, ref_facture, ref_bon_de_livraison, quantite, prix_vente } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO articles_vendu (id_article, ref_facture, ref_bon_de_livraison, quantite, prix_vente) VALUES (?, ?, ?, ?, ?)',
      [id_article, ref_facture, ref_bon_de_livraison, quantite, prix_vente]
    );
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all articles vendu
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM articles_vendu');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific article vendu by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM articles_vendu WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article vendu not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an article vendu
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { id_article, ref_facture, ref_bon_de_livraison, quantite, prix_vente } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE articles_vendu SET id_article = ?, ref_facture = ?, ref_bon_de_livraison = ?, quantite = ?, prix_vente = ? WHERE id = ?',
      [id_article, ref_facture, ref_bon_de_livraison, quantite, prix_vente, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article vendu not found' });
    }
    res.json({ message: 'Article vendu updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an article vendu
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM articles_vendu WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article vendu not found' });
    }
    res.json({ message: 'Article vendu deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get articles by reference facture
router.get('/facture/:ref_facture', async (req, res) => {
  const { ref_facture } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        av.*, 
        a.nom, 
        a.marque, 
        a.prix_vente_ttc, 
        a.prix_vente_ht, 
        a.tva
      FROM 
        articles_vendu av
      JOIN 
        articles a ON av.id_article = a.id
      WHERE 
        av.ref_facture = ?
    `, [ref_facture]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Get articles by reference bon de livraison
router.get('/bon_de_livraison/:ref_bon_de_livraison', async (req, res) => {
  const { ref_bon_de_livraison } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        av.*, 
        a.nom, 
        a.marque, 
        a.prix_vente_ttc, 
        a.prix_vente_ht, 
        a.tva
      FROM 
        articles_vendu av
      JOIN 
        articles a ON av.id_article = a.id
      WHERE 
        av.ref_bon_de_livraison = ?
    `, [ref_bon_de_livraison]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
