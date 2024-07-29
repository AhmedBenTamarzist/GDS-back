const pool = require('../models/db');

exports.getAllFactures = (req, res) => {
    pool.query('SELECT * FROM factures', (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(results);
        }
    });
};

exports.getFactureById = (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM factures WHERE id = ?', [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(result[0]);
        }
    });
};

exports.addFacture = (req, res) => {
    const { date, id_client, prix_total } = req.body;
    pool.query('INSERT INTO factures (date, id_client, prix_total) VALUES (?, ?, ?)', [date, id_client, prix_total], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            const insertId = result.insertId;
            pool.query('SELECT ref FROM factures WHERE id = ?', [insertId], (error, results) => {
                if (error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.json({ id: insertId, ref: results[0].ref });
                }
            });
        }
    });
};

exports.updateFacture = (req, res) => {
    const id = req.params.id;
    const { date, id_client, prix_total } = req.body;
    pool.query('UPDATE factures SET date = ?, id_client = ?, prix_total = ? WHERE id = ?', [date, id_client, prix_total, id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ changes: result.changedRows });
        }
    });
};

exports.deleteFacture = (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM factures WHERE id = ?', [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ changes: result.affectedRows });
        }
    });
};
