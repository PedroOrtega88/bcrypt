// 1. Configuración del Servidor y Sesión

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const PORT = 3000;

const users = [
  { id: 1, username: 'usuario1', password: 'contraseña1', name: 'Usuario Uno' },
  { id: 2, username: 'usuario2', password: 'contraseña2', name: 'Usuario Dos' },
  { id: 3, username: 'usuario3', password: 'contraseña3', name: 'Usuario Tres' },
  { id: 4, username: 'usuario4', password: 'contraseña4', name: 'Usuario Cuatro' },
];

// Middleware para manejar datos de formulario y JSON

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesión

app.use(
  session({
    secret: 'tu_clave_secreta', // Clave secreta para firmar el token (debería ser segura, preferiblemente generada con crypto)
    resave: false, // No guardar cambios en la sesión siempre, solo cuando se realice algún cambio
    saveUninitialized: true, // Se guarda la inicialización de la sesión
    cookie: { secure: false }, // Cambia a 'true' si estás utilizando HTTPS
  })
);

// Función de autorización

function autorizacion(req, res, next) {
    if (req.session.token) {
          // Usuario autenticado, redirige al dashboard
          res.redirect('/dashboard');
    } else {
          // Usuario no autenticado, continúa con la siguiente ruta
          next();
    }
}

// Página de Inicio

app.get('/', autorizacion, (req, res) => {
    const formularioInicio = `
      <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
  
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password" required><br>
  
        <button type="submit">Iniciar sesión</button>
      </form>
      <a href="/dashboard">dashboard</a>
    `;
  
    res.send(formularioInicio);
});

// Generación de Tokens

function generarToken(usuario) {
  return jwt.sign({ usuario: usuario.id }, 'tu_clave_secreta', { expiresIn: '1h' });
}

// Ruta de Inicio de Sesión

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const usuario = users.find(
    (u) => u.username === username && u.password === password
  );

  if (usuario) {
    const token = generarToken(usuario);
    req.session.token = token;
    res.redirect('/dashboard');
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

// Verificación de Tokens

function verificarToken(req, res, next) {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, 'tu_clave_secreta', (err, decodificado) => {
    if (err) {
      return res
        .status(401)
        .json({ message: 'Token inválido', error: err.message });
    }

    req.usuario = decodificado.usuario;
    next();
  });
}

// Dashboard

app.get('/dashboard', verificarToken, (req, res) => {
  const idUsuario = req.usuario;
  const usuario = users.find((u) => u.id === idUsuario);

  if (usuario) {
    res.send(
      ` <h1>Bienvenido, ${usuario.name}!</h1> <p>ID: ${usuario.id}</p> <p>Usuario: ${usuario.username}</p> <br> <form action="/logout" method="post"> <button type="submit">Cerrar sesión</button> </form> <a href="/">Inicio</a> `
    );
  } else {
    res.status(401).json({ message: 'Usuario no encontrado' });
  }
});

// Cierre de Sesión

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Iniciar el Servidor

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
