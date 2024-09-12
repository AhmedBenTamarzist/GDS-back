const pool = require('../models/db'); // Adjust the path as needed

const transactionHandler = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    await callback(connection);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = transactionHandler;
