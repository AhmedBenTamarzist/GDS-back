const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Get all bons de livraison
router.get('/', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT bons_de_livraison.id, bons_de_livraison.ref, bons_de_livraison.date, bons_de_livraison.id_client, bons_de_livraison.prix_total, clients.nom 
      FROM bons_de_livraison 
      LEFT JOIN clients ON clients.id = bons_de_livraison.id_client
    `);
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

// Get bon de livraison by ID
router.get('/ref/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const [results] = await pool.execute('SELECT * FROM bons_de_livraison WHERE ref = ?', [ref]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Add a new bon de livraison
router.post('/', async (req, res) => {
  console.log( req.body)
  const { date, id_client, prix_total,personVente } = req.body;
  try {
    const [result] = await pool.execute('INSERT INTO bons_de_livraison (date, id_client, prix_total,personVente,Montant_paye,paye) VALUES (?, ?, ?,?,0,false)',
      [date, id_client, prix_total,personVente]
    );
    const factureId = result.insertId;

    // Generate the reference and update the facture
    const year = new Date().getFullYear().toString().slice(-2);

      // Query to get the highest existing reference for the current year
      const [rows] = await connection.query(
        'SELECT ref FROM bons_de_livraison WHERE ref LIKE ? ORDER BY ref DESC LIMIT 1',
        [`BL%|${year}`]
      );

      // Extract the numeric part and increment
      let nextNumber = 1; // Default to 1 if no existing references found
      if (rows.length > 0) {
        const lastRef = rows[0].ref;
        const lastNumber = parseInt(lastRef.match(/BL(\d+)\|\d{2}/)[1], 10);
        nextNumber = lastNumber + 1;
      }

      // Generate the new reference with leading zeros
      const refBL = `BL${String(nextNumber).padStart(4, '0')}|${year}`;

      console.log(refBL)
      await connection.query(
        'UPDATE bons_de_livraison SET ref = ? WHERE id = ?',
        [refBL, factureId]
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


// Get bons_de_livraison by client_id
router.get('/client/:id_client', async (req, res) => {
  const { id_client } = req.params;
  try {
    const [results] = await pool.execute(
      'SELECT * FROM bons_de_livraison WHERE id_client = ?', 
      [id_client]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.post('/addBL', async (req, res) => {
  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      const BLData = req.body;
      const [result] = await connection.query('INSERT INTO bons_de_livraison (date, id_client, prix_total,personVente,Montant_paye,paye) VALUES (?, ?, ?,?,0,false)',
        [BLData.date, BLData.id_client, BLData.prix_total,BLData.personVente]
      );

      const factureId = result.insertId;

    // Generate the reference and update the facture
    

    const year = new Date().getFullYear().toString().slice(-2);

      // Query to get the highest existing reference for the current year
      const [rows] = await connection.query(
        'SELECT ref FROM bons_de_livraison WHERE ref LIKE ? ORDER BY ref DESC LIMIT 1',
        [`BL%|${year}`]
      );

      // Extract the numeric part and increment
      let nextNumber = 1; // Default to 1 if no existing references found
      if (rows.length > 0) {
        const lastRef = rows[0].ref;
        const lastNumber = parseInt(lastRef.match(/BL(\d+)\|\d{2}/)[1], 10);
        nextNumber = lastNumber + 1;
      }

      // Generate the new reference with leading zeros
      const refBL = `BL${String(nextNumber).padStart(4, '0')}|${year}`;

      console.log(refBL)
      await connection.query(
        'UPDATE bons_de_livraison SET ref = ? WHERE id = ?',
        [refBL, factureId]
      );
    

      // Process articles (this logic might be in another function)
      const articles = BLData.articles; // Assume articles are sent with the request
      for (const article of articles) {
          if (article.id) {
              
              await connection.query('UPDATE articles SET quantite = quantite - ? WHERE id = ?', [article.quantite, article.id]);
              await connection.query('INSERT INTO articles_vendu SET ?', {
                  id_article: article.id,
                  ref_bon_de_livraison: refBL,
                  quantite: article.quantite,
                  prix_vente: article.prix_vente_ttc,
                  remise:article.remise
              });
          } else {
              const [newArticleResult] = await connection.query(`INSERT INTO articles (nom, quantite, prix_vente_ttc ) 
              VALUES (?, ?, ?)`, [article.nom,-1,article.prix_vente_ttc,]);

              const newArticleId = newArticleResult.insertId;
              await connection.query('INSERT INTO articles_vendu SET ?', {
                  id_article: newArticleId,
                  ref_bon_de_livraison: refBL,
                  quantite: article.quantite,
                  prix_vente: article.prix_vente_ttc,
                  remise:article.remise
              });
          }
      }

      await connection.commit();
      res.status(201).json({ ref: refBL });
  } catch (error) {
      await connection.rollback();
      console.error('Transaction Failed and Rolled Back:', error);
      res.status(500).json({ message: 'Error processing Bon de livraison' });
  } finally {
      connection.release();
  }
});

module.exports = router;
