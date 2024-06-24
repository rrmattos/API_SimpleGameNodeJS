const mysql = require('mysql2');
const { db } = require('../config');

const connection = mysql.createConnection({
  host: db.host,
  user: db.user,
  password: db.password,
  database: db.database,
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

module.exports = connection;
