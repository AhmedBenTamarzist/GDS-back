const pool = require('../models/db');

exports.getAllArticles = (req, res) => {
  pool.query('SELECT * FROM articles', (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
};

exports.getArticleById = (req, res) => {
  const id = req.params.id;
  pool.query('SELECT * FROM articles WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(result[0]);
    }
  });
};

exports.addArticle = (req, res) => {
  const { nom, quantite, marque, prix, prixAchat, description } = req.body;
  pool.query('INSERT INTO articles (nom, quantite, marque, prix, prixAchat, description) VALUES (?, ?, ?, ?, ?, ?)', [nom, quantite, marque, prix, prixAchat, description], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ id: result.insertId });
    }
  });
};

exports.updateArticle = (req, res) => {
  const id = req.params.id;
  const { nom, quantite, marque, prix, prixAchat, description } = req.body;
  pool.query('UPDATE articles SET nom = ?, quantite = ?, marque = ?, prix = ?, prixAchat = ?, description = ? WHERE id = ?', [nom, quantite, marque, prix, prixAchat, description, id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ changes: result.changedRows });
    }
  });
};

exports.deleteArticle = (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM articles WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ changes: result.affectedRows });
    }
  });
};
