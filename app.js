//1. Configuración del Servidor y Sesión

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const secret = require('express-session');
const hashedSecret = require('express session');


const app = express();
const PORT = 3000;


const users = [
  { id: 1, username: 'usuario1', password: 'contraseña1', name: 'Usuario Uno' },
  { id: 2, username: 'usuario2', password: 'contraseña2', name: 'Usuario Dos' },
  { id: 1, username: 'usuario3', password: 'contraseña3', name: 'Usuario Uno' },
  { id: 2, username: 'usuario4', password: 'contraseña4', name: 'Usuario Dos' },
];


//- Middleware para manejar datos de formulario y JSON

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//- Configuración de sesión

app.use(
  session({
    secret: 'secret', // Clave secreta para firmar el token (debería ser segura, preferiblemente generada con crypto)
    resave: false, // No guardar cambios en la sesión siempre, solo cuando se realice algún cambio
    saveUninitialized: true, // Se guarda la inicialización de la sesión
    cookie: { secure: false }, // Cambia a 'true' si estás utilizando HTTPS
  })
);

//- Express: Se importa y se configura para crear el servidor web.
//- JWT: Se utiliza para generar y verificar tokens JWT.
//- express-session: Se utiliza para manejar sesiones en Express.


// function autorizat


function autorization(req, res, next) {
    if (req.session.token) {
          // Usuario autenticado, redirige al dashboard
          res.redirect('/dashboard');
    } else {
          // Usuario no autenticado, continúa con la siguiente ruta
          next();
    }
}




//2 Página de Inicio
app.get('/', autorization, (req, res) => {
    const loginForm = `
      <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
  
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password" required><br>
  
        <button type="submit">Iniciar sesión</button>
      </form>
      <a href="/dashboard">dashboard</a>
    `;
  
    res.send(loginForm);
  });
//3. Generación de Tokens

//- Función para generar un token JWT utilizando la información del usuario.

function generateToken(user) {
  return jwt.sign({ user: user.id }, 'tu_secreto_secreto', { expiresIn: '1h' });
}

//4. Ruta de Inicio de Sesión

//- Ruta que maneja la autenticación del usuario, genera un token y lo almacena en la sesión.

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = generateToken(user);
    req.session.token = token;
    res.redirect('/dashboard');
  } else {
    res.status(401).json({ message: 'Credenciales incorrectas' });
  }
});

//5. Verificación de Tokens

//- Middleware que verifica la validez del token almacenado en la sesión.

function verifyToken(req, res, next) {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, 'tu_secreto_secreto', (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: 'Token inválido', error: err.message });
    }

    req.user = decoded.user;
    next();
  });
}




//6. Dashboard

//- Ruta protegida que solo se puede acceder con un token válido. Muestra el panel de control con información del usuario.

app.get('/dashboard', verifyToken, (req, res) => {
  const userId = req.user;
  const user = users.find((u) => u.id === userId);

  if (user) {
    res.send(
      ` <h1>Bienvenido, ${user.name}!</h1> <p>ID: ${user.id}</p> <p>Usuario: ${user.username}</p> <br> <form action="/logout" method="post"> <button type="submit">Cerrar sesión</button> </form> <a href="/">home</a> `
    );
  } else {
    res.status(401).json({ message: 'Usuario no encontrado' });
  }
});

//7. Cierre de Sesión

//- Ruta que destruye la sesión y redirige al usuario a la página de inicio.

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

//8. Iniciar el Servidor

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
