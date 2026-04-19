# Backend Biblioteca

## Descripción
Backend Node.js (Express) con autenticación OAuth2, RBAC/ABAC y conexión a Supabase.

## Primeros pasos

1. Copia `.env.example` a `.env` y configura tus variables.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor en desarrollo:
   ```bash
   npm run dev
   ```

## Scripts útiles
- `npm run dev`: Inicia con nodemon
- `npm start`: Inicia en modo producción

## Seguridad y despliegue
- Autenticación OAuth2
- Gestión de roles y atributos (RBAC/ABAC)
- Integración con Supabase
- Preparado para despliegue en render.com
- Gestión de secretos con `.env`

## Próximos pasos
- Añadir endpoints CRUD para libros, categorías y préstamos
- Implementar lógica de reglas especiales
- Añadir tests y análisis de seguridad
