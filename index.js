const express = require('express');
const session = require('express-session');
const app = express();
const { router: 
  userRoutes, 
  forgotPassword,
  verifyResetToken,
  changePassword
} = require('./api/user');
const scoreRoutes = require('./api/score');

app.use(express.json());

app.use(session({
  secret: 'ASO%44m815FRps$v*',
  resave: false,
  saveUninitialized: true,
}));

// Rota inicial
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Rotas relacionadas ao login/registro/listagem de usuário
app.use('/api/auth', userRoutes);

// Rota de recuperação de senha
app.post('/api/forgot-password', forgotPassword);

// Rota para verificar o token de recuperação de senha
app.post('/api/verify-reset-token', verifyResetToken);

// Rota para alterar a senha
app.post('/api/change-password', changePassword);

// Rotas relacionadas às pontuações dos usuários
app.use('/api/scores', scoreRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
