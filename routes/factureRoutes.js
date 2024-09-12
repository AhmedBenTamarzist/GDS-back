const express = require('express');
const router = express.Router();
const pool = require('../models/db');

router.get('/', async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT factures.id, factures.ref, factures.date, factures.id_client, factures.prix_total, clients.nom 
      FROM factures 
      LEFT JOIN clients ON clients.id = factures.id_client
    `);
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


// Get facture by reference
router.get('/ref/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    const [results] = await pool.execute('SELECT * FROM factures WHERE ref = ?', [ref]);
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search by reference
// Search by reference and include client info
router.get('/searchFactBl/:ref', async (req, res) => {
  const { ref } = req.params;
  try {
    // Query for factures with client information
    const [factures] = await pool.execute(`
      SELECT 
        factures.id, 
        factures.ref, 
        factures.date, 
        factures.id_client, 
        factures.prix_total, 
        clients.nom AS client_nom, 
        clients.adresse AS client_adresse, 
        clients.tel1 AS client_tel1, 
        clients.tel2 AS client_tel2,
        clients.cin ,
        clients.code_tva,
        'facture' AS type
      FROM factures 
      LEFT JOIN clients ON clients.id = factures.id_client
      WHERE factures.ref LIKE ?
    `, [`%${ref}%`]);

    // Query for bons_de_livraison with client information
    const [bonsDeLivraison] = await pool.execute(`
      SELECT 
        bons_de_livraison.id, 
        bons_de_livraison.ref, 
        bons_de_livraison.date, 
        bons_de_livraison.id_client, 
        bons_de_livraison.prix_total, 
        clients.nom AS client_nom, 
        clients.adresse AS client_adresse, 
        clients.tel1 AS client_tel1, 
        clients.tel2 AS client_tel2,
        clients.cin ,
        clients.code_tva,
        'bl' AS type
      FROM bons_de_livraison 
      LEFT JOIN clients ON clients.id = bons_de_livraison.id_client
      WHERE bons_de_livraison.ref LIKE ?
    `, [`%${ref}%`]);
    
    // Combine the results from both tables
    const results = [...factures, ...bonsDeLivraison];
    
    res.json(results);
    

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
    const year = new Date().getFullYear().toString().slice(-2);

      // Query to get the highest existing reference for the current year
      const [rows] = await connection.query(
        'SELECT ref FROM factures WHERE ref LIKE ? ORDER BY ref DESC LIMIT 1',
        [`FACT%|${year}`]
      );
      // Extract the numeric part and increment
      let nextNumber = 1; // Default to 1 if no existing references found
      if (rows.length > 0) {
        const lastRef = rows[0].ref;
        const lastNumber = parseInt(lastRef.match(/FACT(\d+)\|\d{2}/)[1], 10);
        nextNumber = lastNumber + 1;
      }

      // Generate the new reference with leading zeros
      const refFacture = `FACT${String(nextNumber).padStart(4, '0')}|${year}`;


    // Generate the new reference with leading zeros

      console.log(refFacture)

      await connection.query(
        'UPDATE factures SET ref = ? WHERE id = ?',
        [refFacture, factureId]
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

// Get factures by client_id
router.get('/client/:id_client', async (req, res) => {
  const { id_client } = req.params;
  try {
    const [results] = await pool.execute(
      'SELECT * FROM factures WHERE id_client = ?', 
      [id_client]
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/addFacture', async (req, res) => {
  const connection = await pool.getConnection();
  try {
      await connection.beginTransaction();

      const factureData = req.body;
      const [result] = await connection.query(
        'INSERT INTO factures (date, id_client, prix_total,personVente) VALUES (?, ?, ?,?)',
        [factureData.date, factureData.id_client, factureData.prix_total,factureData.personVente]
      );

      const year = new Date().getFullYear().toString().slice(-2);

      // Query to get the highest existing reference for the current year
      const [rows] = await connection.query(
        'SELECT ref FROM factures WHERE ref LIKE ? ORDER BY ref DESC LIMIT 1',
        [`FACT%|${year}`]
      );
      // Extract the numeric part and increment
      let nextNumber = 1; // Default to 1 if no existing references found
      if (rows.length > 0) {
        const lastRef = rows[0].ref;
        const lastNumber = parseInt(lastRef.match(/FACT(\d+)\|\d{2}/)[1], 10);
        nextNumber = lastNumber + 1;
      }

      // Generate the new reference with leading zeros
      const refFacture = `FACT${String(nextNumber).padStart(4, '0')}|${year}`;

      console.log(refFacture)

      await connection.query(
        'UPDATE factures SET ref = ? WHERE id = ?',
        [refFacture, result.insertId]
      );
      
      // Process articles
      const articles = factureData.articles; // Assume articles are sent with the request
      for (const article of articles) {
          if (article.id) {
            
              await connection.query('UPDATE articles SET quantite = quantite - ? WHERE id = ?', [article.quantite, article.id]);
              await connection.query('INSERT INTO articles_vendu SET ?', {
                  id_article: article.id,
                  ref_facture: refFacture,
                  quantite: article.quantite,
                  prix_vente: article.prix_vente_ttc,
                  remise:article.remise
              });
          } else {
              const [newArticleResult] = await connection.query(`INSERT INTO articles (nom, quantite, prix_vente_ttc ) 
               VALUES (?, ?, ?)`, [article.nom,-1,article.prix]);
              const newArticleId = newArticleResult.insertId;
              await connection.query('INSERT INTO articles_vendu SET ?', {
                  id_article: newArticleId,
                  ref_facture: refFacture,
                  quantite: article.quantite,
                  prix_vente: article.prix_vente_ttc,
                  remise:article.remise
              });
          }
      }

      await connection.commit();
      res.status(201).json({ ref: refFacture });
  } catch (error) {
      await connection.rollback();
      console.error('Transaction Failed and Rolled Back:', error);
      res.status(500).json({ message: 'Error processing facture' });
  } finally {
      connection.release();
  }
});



module.exports = router;
