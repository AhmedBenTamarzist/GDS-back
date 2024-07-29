const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Import routes
const clientsRoutes = require('./routes/clientRoutes');
const articlesRoutes = require('./routes/articles');
const factureRoutes = require('./routes/factureRoutes');
const bonLivraisonRoutes = require('./routes/bonLivraisonRoutes');
const articlesVenduRoutes = require('./routes/articles_vendu');

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:4200', // Change this to your Angular application's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Database connection
const pool = require('./models/db');
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
  connection.release();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use routes
app.use('/api/clients', clientsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/bons-de-livraison', bonLivraisonRoutes);
app.use('/api/articles_vendu', articlesVenduRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
