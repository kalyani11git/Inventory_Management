# API documentation

Base URL: `http://localhost:5000/api` (or your `PORT`)

Swagger UI: `http://localhost:5000/api/docs`

OpenAPI file: [swagger.yaml](swagger.yaml)

- JSON (when API is running): `http://localhost:5000/api/docs-json`
- YAML (when API is running): `http://localhost:5000/api/docs-yaml`

Auth header (for all routes except register/login):

```
Authorization: Bearer <accessToken>
```

Validation errors return **400** with `message` as a string or an array of strings.

---

## Auth

### POST `/auth/register`

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret1"
}
```

Response `201`:

```json
{
  "accessToken": "jwt...",
  "user": { "id": "...", "name": "Test User", "email": "test@example.com", "role": "owner" }
}
```

### POST `/auth/login`

Body:

```json
{
  "email": "test@example.com",
  "password": "secret1"
}
```

### GET `/auth/me`

Returns the current user.

### POST `/auth/logout`

Returns `{ "message": "Logged out" }`. Client should still delete the token.

---

## Categories

All routes need JWT.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/categories` | List categories |
| GET | `/categories/:id` | Category details |
| POST | `/categories` | Create |
| PATCH | `/categories/:id` | Update |
| DELETE | `/categories/:id` | Delete (blocked if products exist) |

Create body:

```json
{
  "name": "Electronics",
  "description": "Phones and accessories"
}
```

---

## Products

| Method | Path | Description |
| --- | --- | --- |
| GET | `/products` | List with search / filters / pagination |
| GET | `/products/:id` | Details |
| POST | `/products` | Create |
| PATCH | `/products/:id` | Update |
| DELETE | `/products/:id` | Delete |
| PATCH | `/products/:id/stock` | Increase or reduce stock |

### List query params

- `search` - name or SKU
- `categoryId`
- `status` - `In Stock` \| `Low Stock` \| `Out of Stock`
- `sortBy` - `name` \| `quantity` \| `unitPrice` \| `createdAt`
- `sortOrder` - `ASC` \| `DESC`
- `page` (default 1)
- `limit` (default 10)

### Create body

```json
{
  "name": "USB Cable",
  "sku": "USB-001",
  "categoryId": "uuid",
  "description": "1 meter cable",
  "quantity": 25,
  "unitPrice": 149.5,
  "supplierName": "ABC Traders"
}
```

`status` is not sent by the client. Backend sets it from quantity.

### Image upload

`POST /products/:id/image`  
multipart field: `file` (JPG / PNG / WEBP, max 2MB)

### Stock body

---

## Users (owner only)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/users` | List users |
| PATCH | `/users/:id/role` | Set role to `owner` or `user` |

---

## Common status codes

```json
{
  "type": "increase",
  "quantity": 5
}
```

`type` can be `increase` or `decrease`. Decrease below 0 returns **400**.

---

## Dashboard

### GET `/dashboard/stats`

Regular **user** response:

```json
{
  "totalProducts": 12,
  "totalCategories": 3,
  "totalStockQuantity": 340,
  "lowStockItems": 2,
  "outOfStockItems": 1,
  "userAnalytics": null
}
```

**Owner** response includes user analytics instead of inventory counts:

```json
{
  "totalProducts": 0,
  "totalCategories": 0,
  "totalStockQuantity": 0,
  "lowStockItems": 0,
  "outOfStockItems": 0,
  "userAnalytics": {
    "totalUsers": 4,
    "owners": 1,
    "members": 3,
    "joinedThisWeek": 1,
    "joinedThisMonth": 3,
    "withInventory": 2,
    "withoutInventory": 2,
    "avgProductsPerUser": 3.5,
    "accounts": []
  }
}
```

---

## Common status codes

| Code | When |
| --- | --- |
| 200 | Success |
| 201 | Created (Nest may still return 201/200 depending on method) |
| 400 | Validation / business rule |
| 401 | Missing or invalid token |
| 404 | Not found |
| 409 | Duplicate email or SKU |
