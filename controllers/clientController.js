const pool = require('../models/db');

exports.getAllClients = (req, res) => {
  pool.query('SELECT * FROM clients', (error, results) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
};

exports.getClientById = (req, res) => {
  const id = req.params.id;
  pool.query('SELECT * FROM clients WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(result[0]);
    }
  });
};

exports.addClient = (req, res) => {
  const { nom, tel1, tel2, adresse } = req.body;
  pool.query('INSERT INTO clients (nom, tel1, tel2, adresse) VALUES (?, ?, ?, ?)', [nom, tel1, tel2, adresse], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ id: result.insertId });
    }
  });
};

exports.updateClient = (req, res) => {
  const id = req.params.id;
  const { nom, tel1, tel2, adresse } = req.body;
  pool.query('UPDATE clients SET nom = ?, tel1 = ?, tel2 = ?, adresse = ? WHERE id = ?', [nom, tel1, tel2, adresse, id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ changes: result.changedRows });
    }
  });
};

exports.deleteClient = (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM clients WHERE id = ?', [id], (error, result) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ changes: result.affectedRows });
    }
  });
};
