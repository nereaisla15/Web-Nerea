
import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [page, setPage] = useState('inicio');
  const [libros, setLibros] = useState([]);
  const [loadingLibros, setLoadingLibros] = useState(false);
  const [errorLibros, setErrorLibros] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [errorUsuario, setErrorUsuario] = useState(null);

  // Cargar usuario autenticado al iniciar
  useEffect(() => {
    fetch('http://localhost:3001/api/protegido', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) return setUsuario(null);
        if (!res.ok) throw new Error('Error al cargar usuario');
        return res.json();
      })
      .then(data => setUsuario(data.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setLoadingUsuario(false));
  }, []);

  useEffect(() => {
    if (page === 'catalogo') {
      setLoadingLibros(true);
      setErrorLibros(null);
      fetch('http://localhost:3001/api/libros')
        .then(res => {
          if (!res.ok) throw new Error('Error al cargar libros');
          return res.json();
        })
        .then(data => setLibros(data))
        .catch(err => setErrorLibros(err.message))
        .finally(() => setLoadingLibros(false));
    }
  }, [page]);

  return (
    <div className="biblioteca-app">
      <header className="header">
        <h1>📚 Biblioteca Online</h1>
        <nav>
          <button onClick={() => setPage('inicio')}>Inicio</button>
          <button onClick={() => setPage('catalogo')}>Catálogo</button>
          {usuario ? (
            <>
              <span style={{ marginLeft: 10, fontWeight: 500 }}>👤 {usuario.nombre}</span>
              <button onClick={() => {
                fetch('http://localhost:3001/api/logout', { method: 'POST', credentials: 'include' })
                  .then(() => window.location.reload());
              }} style={{ marginLeft: 10 }}>Cerrar sesión</button>
            </>
          ) : (
            <a href="http://localhost:3001/auth/google" style={{ marginLeft: 10 }}>
              <button className="login-btn">Login con Google</button>
            </a>
          )}
        </nav>
      </header>

      <main className="main-content">
        {page === 'inicio' && (
          <section>
            <h2>Bienvenido a la Biblioteca</h2>
            <p>Explora nuestro catálogo, busca tus libros favoritos y gestiona tus préstamos de forma sencilla y segura.</p>
            <img src={heroImg} alt="Biblioteca" style={{ width: '180px', display: 'block', margin: '2rem auto' }} />
            <ul style={{marginTop:'2rem', fontSize:'1.1rem'}}>
              <li>🔍 Consulta el catálogo actualizado</li>
              <li>📝 Accede con Google para gestionar tus préstamos</li>
              <li>📦 Pronto: reserva y devolución online</li>
            </ul>
          </section>
        )}

        {page === 'catalogo' && (
          <section>
            <h2>Catálogo de Libros</h2>
            {loadingLibros && <div className="loader">Cargando libros...</div>}
            {errorLibros && (
              <div className="error-box">
                <strong>Error al cargar el catálogo:</strong>
                <div style={{marginTop:'0.5rem'}}>{errorLibros.includes('Failed to fetch') ? 'No se pudo conectar con el backend. ¿Está arrancado el servidor?' : errorLibros}</div>
              </div>
            )}
            {!loadingLibros && !errorLibros && (
              <table className="catalogo-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                  </tr>
                </thead>
                <tbody>
                  {libros.map(libro => (
                    <tr key={libro.id}>
                      <td>{libro.titulo}</td>
                      <td>{libro.autor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Biblioteca Online — Proyecto profesional
      </footer>
    </div>
  );
}

export default App;
