# Documentación de Rutas y Endpoints - Tienda Moda API

Base URL local: `http://localhost:3000` (desarrollo). Prefijo de la API: `/api/v1`.

**Autenticación:** las rutas privadas requieren el encabezado `Authorization: Bearer <token>`, donde el token se obtiene en `POST /api/v1/auth/login`.
**Roles:** `user` (por defecto en el registro) y `admin` (se crea con `npm run seed:admin`).

## Resumen

| # | Método | Ruta | Acceso | Éxito |
|---|--------|------|--------|-------|
| 1 | GET | `/health` | Pública | 200 |
| 2 | POST | `/api/v1/auth/register` | Pública | 201 |
| 3 | POST | `/api/v1/auth/login` | Pública | 200 |
| 4 | GET | `/api/v1/products` | Pública | 200 |
| 5 | GET | `/api/v1/products/:id` | Pública | 200 / 404 |
| 6 | POST | `/api/v1/products` | **Privada: JWT + admin** | 201 |
| 7 | PUT | `/api/v1/products/:id` | **Privada: JWT + admin** | 200 / 404 |
| 8 | DELETE | `/api/v1/products/:id` | **Privada: JWT + admin** | 204 / 404 |
| 9 | POST | `/api/v1/orders` | **Privada: JWT** | 201 |
| 10 | GET | `/api/v1/orders` | **Privada: JWT** | 200 |
| 11 | GET | `/api/v1/orders/:id` | **Privada: JWT** | 200 / 404 |

## Códigos de error comunes

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos (validación, correo repetido, stock insuficiente, ID mal formado) |
| 401 | Sin token, token inválido/expirado, o credenciales incorrectas |
| 403 | Token válido pero sin el rol requerido (se requiere `admin`) |
| 404 | Recurso no encontrado |

## Monitoreo

### GET /health
Verifica que el servidor esté disponible.
```json
{ "status": "OK", "environment": "development", "timestamp": "2026-10-28T20:00:00.000Z" }
```

## Autenticación (`/api/v1/auth`)

### POST /api/v1/auth/register
Registra un usuario. La contraseña se guarda cifrada con Bcrypt. **El rol siempre es `user`**, aunque se envíe otro valor en el body.

Body:
```json
{ "name": "Kiwin Burbano", "email": "kiwin@example.com", "password": "Clave123*" }
```
Respuesta 201:
```json
{ "status": "success", "token": "<jwt>", "data": { "user": { "id": "...", "name": "Kiwin Burbano", "email": "kiwin@example.com", "role": "user" } } }
```
Errores: 400 (correo ya registrado o datos inválidos).

### POST /api/v1/auth/login
Autentica y entrega el token JWT (vigencia 24 h por defecto).

Body:
```json
{ "email": "kiwin@example.com", "password": "Clave123*" }
```
Respuesta 200: igual a la del registro. Errores: 400 (faltan campos), 401 (credenciales incorrectas).

## Productos (`/api/v1/products`)

Campos del producto: `name`, `description`, `price` (>= 0), `category` (`ropa`, `calzado`, `accesorios`), `size`, `stock`.

### GET /api/v1/products  (pública)
Respuesta 200:
```json
{ "status": "success", "results": 1, "data": { "products": [ { "_id": "...", "name": "Chaqueta Cuero", "price": 150000, "category": "ropa", "size": "L", "stock": 50 } ] } }
```

### GET /api/v1/products/:id  (pública)
Respuesta 200 con `data.product`. Errores: 404 (no existe), 400 (ID mal formado).

### POST /api/v1/products  (JWT + admin)
Headers: `Authorization: Bearer <token_admin>`
```json
{ "name": "Chaqueta Cuero", "description": "Chaqueta de cuero sintetico", "price": 150000, "category": "ropa", "size": "L", "stock": 50 }
```
Respuesta 201 con `data.product`. Errores: 401 (sin token), 403 (no es admin), 400 (validación).

### PUT /api/v1/products/:id  (JWT + admin)
Body con los campos a cambiar, por ejemplo `{ "price": 160000 }`. Respuesta 200. Errores: 401, 403, 404.

### DELETE /api/v1/products/:id  (JWT + admin)
Respuesta 204 sin contenido. Errores: 401, 403, 404.

## Órdenes (`/api/v1/orders`) — todas requieren JWT

### POST /api/v1/orders
Crea una orden del usuario autenticado, calcula el total y **descuenta el stock** de cada producto.
```json
{ "items": [ { "product": "<id_producto>", "quantity": 2 } ] }
```
Respuesta 201:
```json
{ "status": "success", "data": { "order": { "_id": "...", "user": "...", "items": [ { "product": "...", "quantity": 2, "price": 160000 } ], "total": 320000, "status": "pendiente" } } }
```
Errores: 400 (sin items, cantidad inválida o stock insuficiente), 401, 404 (producto inexistente).

### GET /api/v1/orders
Lista las órdenes del usuario autenticado. Respuesta 200 con `results` y `data.orders`.

### GET /api/v1/orders/:id
Devuelve una orden del usuario autenticado. Errores: 401, 404.
