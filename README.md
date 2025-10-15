# CodigoDelSur Backend API

API REST desarrollada con Node.js + Express + TypeScript + SQLite para la evaluación técnica de CodigoDelSur. Sistema de autenticación JWT, búsqueda de películas vía TheMovieDB API y gestión de favoritos.

## 🚀 Características

- Registro y autenticación de usuarios con JWT + token blacklist (logout)
- Búsqueda de películas desde TheMovieDB API
- Gestión de películas favoritas por usuario
- Arquitectura limpia con principios SOLID/GRASP
- Documentación automática con Swagger
- Tests unitarios con Jest
- SQLite con migraciones automáticas

## 🛠 Stack Tecnológico

**Backend:** Node.js 18 • Express • TypeScript  
**Base de Datos:** SQLite3  
**Autenticación:** JWT • bcrypt  
**Documentación:** Swagger  
**Testing:** Jest  
**Containerización:** Docker

## ⚡ Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# Clonar repositorio
git clone <repository-url>
cd NodejsCDS

# Iniciar con Docker
docker compose up --build -d

# Ver logs
docker compose logs -f app
```

**API disponible en:** http://localhost:8000  
**Documentación:** http://localhost:8000/api-docs

### Opción 2: Local

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/register` - Registrar usuario
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión (invalidar token)

### Películas
- `GET /api/movies?keyword=fight` - Buscar películas

### Favoritos (requieren autenticación)
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/:movieId` - Eliminar favorito

## 🧪 Prueba Rápida

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","password":"Test123!"}'

# 2. Login (guardar el token)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# 3. Buscar películas (reemplazar YOUR_TOKEN)
curl -X GET "http://localhost:8000/api/movies?keyword=matrix" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Logout
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧰 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Servidor producción
npm test             # Ejecutar tests
npm run lint         # Verificar código
npm run lint:fix     # Corregir errores
```

## 📋 Variables de Entorno

Archivo `.env` (ya incluido):

```env
PORT=8000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
TMDB_API_KEY=eyJhbGci...  # Token de TheMovieDB
TMDB_API_URL=https://api.themoviedb.org/3
DB_PATH=./src/db/database.sqlite
```

## 🏗 Arquitectura

- **Patrón Repository** para acceso a datos
- **Inyección de Dependencias** en servicios
- **Separación en capas:** Controllers → Services → Repositories
- **Principios SOLID** aplicados en toda la estructura
- **Clean Code** con TypeScript strict mode

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests específicos
npm test -- AuthService.test.ts
```

**Cobertura:** 11 tests unitarios (AuthService + CryptoUtil)

## 📚 Documentación Adicional

- [LOGOUT_TESTING.md](./LOGOUT_TESTING.md) - Guía completa de pruebas de logout
- [Swagger UI](http://localhost:8000/api-docs) - Documentación interactiva
- [OpenAPI JSON](http://localhost:8000/api-docs.json) - Especificación OpenAPI

## 👤 Autor

**Stefano Caiafa**  
Proyecto desarrollado para evaluación técnica de **CodigoDelSur**
