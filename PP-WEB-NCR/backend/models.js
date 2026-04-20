// Modelos simulados en memoria para libros, categorías y préstamos


let categorias = [
  { id: 1, nombre: 'Novela' },
  { id: 2, nombre: 'Ciencia Ficción' },
  { id: 3, nombre: 'Historia' },
  { id: 4, nombre: 'Infantil' }
];

let libros = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', categoria: 'Novela', restringido: false },
  { id: 2, titulo: '1984', autor: 'George Orwell', categoria: 'Ciencia Ficción', restringido: false },
  { id: 3, titulo: 'Sapiens', autor: 'Yuval Noah Harari', categoria: 'Historia', restringido: false },
  { id: 4, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', categoria: 'Infantil', restringido: false },
  { id: 5, titulo: 'Lolita', autor: 'Vladimir Nabokov', categoria: 'Novela', restringido: true }
];

let prestamos = [
  // { id: 1, libroId: 1, usuario: 'usuario1', fecha: '2026-04-16', devuelto: false }
];

module.exports = { libros, categorias, prestamos };
