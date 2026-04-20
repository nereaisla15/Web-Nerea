// Permitir CORS para que el frontend pueda acceder al backend
const cors = require('cors');
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { libros, categorias, prestamos } = require('./models');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Ruta de bienvenida para evitar 'Cannot GET /'
app.get('/', (req, res) => {
  res.send('<h2>Backend Biblioteca Online</h2><p>API REST funcionando. Usa /api/libros, /api/prestamos, etc.</p>');
});

// --- CRUD Préstamos ---
// Obtener todos los préstamos
app.get('/api/prestamos', (req, res) => {
  res.json(prestamos);
});

// Crear un préstamo (con reglas especiales)
app.post('/api/prestamos', (req, res) => {
  const { libroId, usuario, fecha } = req.body;
  // Reglas especiales: Si el libro es restringido, comprobar requisitos (simulado)
  const libro = libros.find(l => l.id === libroId);
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
  if (libro.restringido && (!req.body.mayorEdad)) {
    return res.status(403).json({ error: 'No cumples los requisitos para este libro' });
  }
  // Regla: Si el usuario ha leído más de 10 libros este mes, puede tener más tiempo
  const prestamosUsuario = prestamos.filter(p => p.usuario === usuario && p.fecha.startsWith(fecha.slice(0,7)));
  let diasPrestamo = 15;
  if (prestamosUsuario.length > 10) diasPrestamo = 30;
  const id = prestamos.length ? prestamos[prestamos.length - 1].id + 1 : 1;
  const prestamo = { id, libroId, usuario, fecha, diasPrestamo, devuelto: false };
  prestamos.push(prestamo);
  res.status(201).json(prestamo);
});

// Devolver un libro
app.put('/api/prestamos/:id/devolver', (req, res) => {
  const prestamo = prestamos.find(p => p.id === parseInt(req.params.id));
  if (!prestamo) return res.status(404).json({ error: 'Préstamo no encontrado' });
  prestamo.devuelto = true;
  res.json(prestamo);
});

// Eliminar un préstamo
app.delete('/api/prestamos/:id', (req, res) => {
  const idx = prestamos.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Préstamo no encontrado' });
  prestamos.splice(idx, 1);
  res.status(204).end();
});

// Middleware para extraer usuario autenticado de OAuth2 y asignar roles/atributos
app.use((req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.profile) {
    // Ejemplo: asignar rol y edad según email (ajustar según tu lógica real)
    const email = req.user.profile.emails && req.user.profile.emails[0].value;
    let rol = 'user';
    let edad = 18;
    if (email && email.endsWith('@admin.com')) rol = 'admin';
    if (email && email.startsWith('adulto')) edad = 25;
    if (email && email.startsWith('menor')) edad = 17;
    req.usuario = { email, rol, edad };
  }
  next();
});


// Middleware RBAC: solo admin
function soloAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') return res.status(403).json({ error: 'Solo admin' });
  next();
}

// Middleware ABAC: solo mayores de edad para libros restringidos

function mayorEdad(req, res, next) {
  if (req.body.restringido && (!req.usuario || req.usuario.edad < 18)) {
    return res.status(403).json({ error: 'Debes ser mayor de edad para esta acción' });
  }
  next();
}

app.use(express.json());

// Configuración de sesión (ajustar secret en producción)
app.use(session({ secret: process.env.SESSION_SECRET || 'biblioteca-secret', resave: false, saveUninitialized: true }));


// Configuración de Passport para Google OAuth2
passport.use(new GoogleStrategy({
  clientID: process.env.OAUTH2_CLIENT_ID,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET,
  callbackURL: process.env.OAUTH2_CALLBACK_URL
},
(accessToken, refreshToken, profile, cb) => {
  // Aquí deberías buscar o crear el usuario en la base de datos
  return cb(null, { profile, accessToken });
}
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());


// Rutas de autenticación con Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

// Ruta protegida de ejemplo
app.get('/api/protegido', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'No autenticado' });
  res.json({ mensaje: 'Acceso concedido', usuario: req.user });
});

// --- CRUD Libros ---
app.get('/api/libros', (req, res) => {
  res.json(libros);
});

// Solo admin puede crear libros, y solo mayores de edad pueden crear libros restringidos
app.post('/api/libros', soloAdmin, mayorEdad, (req, res) => {
  const { titulo, categoria, restringido } = req.body;
  const id = libros.length ? libros[libros.length - 1].id + 1 : 1;
  const libro = { id, titulo, categoria, restringido: !!restringido };
  libros.push(libro);
  res.status(201).json(libro);
});

app.put('/api/libros/:id', (req, res) => {
  const libro = libros.find(l => l.id === parseInt(req.params.id));
  if (!libro) return res.status(404).json({ error: 'Libro no encontrado' });
  Object.assign(libro, req.body);
  res.json(libro);
});

// Solo admin puede borrar libros
app.delete('/api/libros/:id', soloAdmin, (req, res) => {
  const idx = libros.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Libro no encontrado' });
  libros.splice(idx, 1);
  res.status(204).end();
});

// --- CRUD Categorías ---
app.get('/api/categorias', (req, res) => {
  res.json(categorias);
});

// Solo admin puede crear categorías
app.post('/api/categorias', soloAdmin, (req, res) => {
  const { nombre } = req.body;
  const id = categorias.length ? categorias[categorias.length - 1].id + 1 : 1;
  const categoria = { id, nombre };
  categorias.push(categoria);
  res.status(201).json(categoria);
});

app.put('/api/categorias/:id', (req, res) => {
  const categoria = categorias.find(c => c.id === parseInt(req.params.id));
  if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
  Object.assign(categoria, req.body);
  res.json(categoria);
});

// Solo admin puede borrar categorías
app.delete('/api/categorias/:id', soloAdmin, (req, res) => {
  const idx = categorias.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Categoría no encontrada' });
  categorias.splice(idx, 1);
  res.status(204).end();
});

// Inicio
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
