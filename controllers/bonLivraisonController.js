const pool = require('../models/db');

exports.getAllBonsDeLivraison = (req, res) => {
    pool.query('SELECT * FROM bons_de_livraison', (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(results);
        }
    });
};

exports.getBonDeLivraisonById = (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM bons_de_livraison WHERE id = ?', [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(result[0]);
        }
    });
};

exports.addBonDeLivraison = (req, res) => {
    const { date, id_client } = req.body;
    pool.query('INSERT INTO bons_de_livraison (date, id_client) VALUES (?, ?)', [date, id_client], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            const insertId = result.insertId;
            pool.query('SELECT ref FROM bons_de_livraison WHERE id = ?', [insertId], (error, results) => {
                if (error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.json({ id: insertId, ref: results[0].ref });
                }
            });
        }
    });
};

exports.updateBonDeLivraison = (req, res) => {
    const id = req.params.id;
    const { date, id_client } = req.body;
    pool.query('UPDATE bons_de_livraison SET date = ?, id_client = ? WHERE id = ?', [date, id_client, id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ changes: result.changedRows });
        }
    });
};

exports.deleteBonDeLivraison = (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM bons_de_livraison WHERE id = ?', [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json({ changes: result.affectedRows });
        }
    });
};
