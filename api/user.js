const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const connection = require('./db');
const { authenticateToken } = require('./middleware/auth');
const { jwtSecret } = require('../config');
require('dotenv').config();
const { sendPasswordResetEmail } = require('./emailService'); // Adicionando o emailService
const { Console } = require('console');

const router = express.Router();


// Registrar usuário
router.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  connection.query(query, [username, hashedPassword, email], (err, results) => {
    if (err) {
      console.error('Erro ao registrar usuário:', err);
      return res.status(500).send('Erro ao registrar usuário.');
    }
    res.status(201).send('Usuário registrado com sucesso.');
  });
});

// Login de usuário
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (err, results) => {
    if (err || results.length === 0) {
      console.error('Usuário não encontrado:', err);
      return res.status(400).send('Usuário não encontrado.');
    }

    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send('Senha incorreta.');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Listar usuários
router.get('/users', authenticateToken, (req, res) => {
  const query = 'SELECT username, email FROM users';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao listar usuários:', err);
      return res.status(500).send('Erro ao listar usuários.');
    }
    res.json(results);
  });
});


let user;

// Recuperação de senha - Enviar email com token
const forgotPassword = (req, res) => {
  const { username, email } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND email = ?';
  connection.query(query, [username, email], (err, results) => {
    if (err || results.length === 0) {
      console.error('Usuário ou email não encontrado:', err);
      return res.status(400).send('Usuário ou email não encontrado.');
    }

    const user = results[0];
    req.session.user = user; 
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // Token válido por 10 minutos

    const updateQuery = 'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?';
    connection.query(updateQuery, [resetToken, resetTokenExpires, user.id], (err) => {
      if (err) {
        console.error('Erro ao salvar o token de recuperação:', err);
        return res.status(500).send('Erro ao salvar o token de recuperação.');
      }

      // Enviar email com o token de recuperação
      sendPasswordResetEmail(email, resetToken);

      res.send('Email de recuperação enviado com sucesso.');
    });
  });
};


const verifyResetToken = (req, res) => {
  const { token } = req.body;
  const user = req.session.user;

  const query = 'SELECT * FROM users WHERE email = ? AND resetPasswordToken = ?';
  connection.query(query, [user.email, token], (err, results) => {
    if (err || results.length === 0) {
      console.error('Token inválido ou e-mail não encontrado:', err);
      return res.status(400).send('Token inválido ou e-mail não encontrado.');
    }

    res.send('Token válido.');
  });
};


// Alterar senha de usuário
const changePassword = (req, res) => {
  const { newPassword } = req.body;

  const query = 'SELECT * FROM users WHERE resetPasswordToken = ?';
  connection.query(query, [req.headers.authorization.split(" ")[1]], (err, results) => {
    if (err || results.length === 0) {
      console.error('Token inválido:', err);
      return res.status(400).send('Token inválido.');
    }

    const user = results[0];
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    connection.query(updateQuery, [hashedNewPassword, user.id], (err) => {
      if (err) {
        console.error('Erro ao alterar senha:', err);
        return res.status(500).send('Erro ao alterar senha.');
      }
      res.send('Senha alterada com sucesso.');
    });
  });
};

module.exports = {
  router,
  forgotPassword,
  verifyResetToken,
  changePassword
};
