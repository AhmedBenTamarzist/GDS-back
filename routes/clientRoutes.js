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

// Get all clients
router.get('/recherche/:client', async (req, res) => {
  const { client } = req.params; 
  try {
    const searchTerm = `%${client}%`; 

    const [results, fields] = await pool.execute('SELECT * FROM clients WHERE id LIKE ? OR nom LIKE ?', [searchTerm, searchTerm]);
    
    res.json(results); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get devis
router.post('/devis/:id', async (req, res) => {

  const id_client = req.params.id; 
  const { dateDebut, dateFin, facture, bl } = req.body; 

  try {
    let results = [];
    if( facture && bl)
    {

       [results] = await pool.execute(
        `SELECT 
        articles.nom, 
        articles.prix_vente_ttc, 
        articles.prix_vente_ht, 
        articles.tva, 
        SUM(articles_vendu.quantite) AS total_quantite, 
        articles_vendu.prix_vente, 
        articles_vendu.remise 
      FROM 
        articles_vendu 
      JOIN 
        articles ON articles.id = articles_vendu.id_article 
      WHERE 
        articles_vendu.ref_bon_de_livraison IN (
          SELECT ref FROM bons_de_livraison 
          WHERE id_client = ? 
          AND date BETWEEN ? AND ?
        ) OR  articles_vendu.ref_facture IN (
              SELECT ref FROM factures 
              WHERE id_client = ? 
              AND date BETWEEN ? AND ?
            ) 
      GROUP BY 
        articles.nom, 
        articles.prix_vente_ttc, 
        articles.prix_vente_ht, 
        articles.tva, 
        articles_vendu.prix_vente, 
        articles_vendu.remise`,
        [id_client, dateDebut, dateFin,id_client, dateDebut, dateFin]
      );
    }else 
    {
        if (facture) {
           [results] = await pool.execute(
            `SELECT 
            articles.nom, 
            articles.prix_vente_ttc, 
            articles.prix_vente_ht, 
            articles.tva, 
            SUM(articles_vendu.quantite) AS total_quantite, 
            articles_vendu.prix_vente, 
            articles_vendu.remise 
          FROM 
            articles_vendu 
          JOIN 
            articles ON articles.id = articles_vendu.id_article 
          WHERE 
            articles_vendu.ref_facture IN (
              SELECT ref FROM factures 
              WHERE id_client = ? 
              AND date BETWEEN ? AND ?
            ) 
          GROUP BY 
            articles.nom, 
            articles.prix_vente_ttc, 
            articles.prix_vente_ht, 
            articles.tva, 
            articles_vendu.prix_vente, 
            articles_vendu.remise
          `,
            [id_client, dateDebut, dateFin]
          );
          
        }else {

            if (bl) {
               [results] = await pool.execute(
                `SELECT 
                articles.nom, 
                articles.prix_vente_ttc, 
                articles.prix_vente_ht, 
                articles.tva, 
                SUM(articles_vendu.quantite) AS total_quantite, 
                articles_vendu.prix_vente, 
                articles_vendu.remise 
              FROM 
                articles_vendu 
              JOIN 
                articles ON articles.id = articles_vendu.id_article 
              WHERE 
                articles_vendu.ref_bon_de_livraison IN (
                  SELECT ref FROM bons_de_livraison 
                  WHERE id_client = ? 
                  AND date BETWEEN ? AND ?
                ) 
              GROUP BY 
                articles.nom, 
                articles.prix_vente_ttc, 
                articles.prix_vente_ht, 
                articles.tva, 
                articles_vendu.prix_vente, 
                articles_vendu.remise`,
                [id_client, dateDebut, dateFin]
              );
              
            } 
          }
    }
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
  const { nom, tel1, tel2, adresse,cin,code_tva } = req.body;
  try {
    const [result, fields] = await pool.execute('INSERT INTO clients (nom, tel1, tel2, adresse,cin,code_tva) VALUES (?, ?, ?, ?, ?, ?)', [nom, tel1, tel2, adresse,cin,code_tva]);
    res.json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { nom, tel1, tel2, adresse,cin,code_tva } = req.body;
  try {
    const [result, fields] = await pool.execute('UPDATE clients SET nom = ?, tel1 = ?, tel2 = ?, adresse = ? ,cin = ? , code_tva = ? WHERE id = ?', [nom, tel1, tel2, adresse,cin,code_tva, id]);
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
