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