const express = require('express');
const connection = require('../api/db');
const { authenticateToken } = require('../api/middleware/auth');

const router = express.Router();

// Salvar pontuação do usuário (requer autenticação)
router.post('/', authenticateToken, (req, res) => {
  const { score } = req.body;
  const userId = req.user.id;

  // Verifica se o usuário já tem um score na tabela scores
  const querySelect = 'SELECT * FROM scores WHERE user_id = ?';
  connection.query(querySelect, [userId], (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao salvar pontuação.');
    }

    // Se o usuário já tem um score, atualiza o registro existente
    if (results.length > 0) {
      const queryUpdate = 'UPDATE scores SET score = ? WHERE user_id = ?';
      connection.query(queryUpdate, [score, userId], (err, results) => {
        if (err) {
          return res.status(500).send('Erro ao salvar pontuação.');
        }
        res.send('Pontuação atualizada com sucesso.');
      });
    } else {
      // Se o usuário não tem um score, insere um novo registro na tabela scores
      const queryInsert = 'INSERT INTO scores (score, user_id) VALUES (?, ?)';
      connection.query(queryInsert, [score, userId], (err, results) => {
        if (err) {
          return res.status(500).send('Erro ao salvar pontuação.');
        }
        res.send('Pontuação salva com sucesso.');
      });
    }
  });
});

// Ler pontuação do usuário (pode ser acessado por qualquer um)
router.get('/:id', (req, res) => {
  const userId = req.params.id;

  const query = 'SELECT score FROM scores WHERE user_id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Erro ao obter pontuação.');
    }
    res.json({ score: results[0].score });
  });
});

// Listar todos os usuários com suas pontuações
router.get('/', (req, res) => {
  const query = `
    SELECT users.username, scores.score
    FROM users
    INNER JOIN scores ON users.id = scores.user_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Erro ao listar usuários e pontuações.');
    }
    res.json({ userScores: results });
  });
});

module.exports = router;
