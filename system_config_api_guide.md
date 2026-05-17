# System Configuration API — Frontend Integration Guide

## Overview

The System Configuration module exposes a set of Admin-only endpoints that allow real-time control over the platform's operational behavior. Changes made through these endpoints take effect **instantly** — no server restart required. The backend holds all configurations in an in-memory cache that is synced on every update.

> [!IMPORTANT]
> All endpoints under `/api/v1/config` require an authenticated Admin JWT token. Any non-ADMIN request will be rejected with `403 Forbidden`.

---

## Base URL

```
GET/POST/PATCH/DELETE /api/v1/config
```

---

## Core Concepts

### Config Entries

Each configuration is a simple **key-value pair** stored as strings. The frontend is responsible for interpreting the `value` field as the correct type (number, boolean, string). The backend always stores and returns values as strings.

```json
{
  "id": "uuid...",
  "key": "PLATFORM_FEE_PERCENT",
  "value": "0.08",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Pre-seeded Keys

The following keys are pre-populated in the database and are actively used by the backend engine:

| Key | Default Value | Type | Description |
|---|---|---|---|
| `PLATFORM_FEE_PERCENT` | `"0.08"` | Float (0–1) | Platform commission taken from every order. `0.08` = 8%. |
| `MIN_DELIVERY_FEE` | `"33.00"` | Float (ETB) | Minimum delivery fee charged to customers. |
| `MAINTENANCE_MODE` | `"false"` | Boolean string | If set to `"true"`, the platform enters maintenance mode. |

---

## Endpoints

### 1. List All Configurations

Retrieves the complete list of all configuration keys and their current values.

```
GET /api/v1/config
```

**Response**
```json
{
  "success": true,
  "total": 3,
  "configs": [
    { "key": "MAINTENANCE_MODE", "value": "false", ... },
    { "key": "MIN_DELIVERY_FEE", "value": "33.00", ... },
    { "key": "PLATFORM_FEE_PERCENT", "value": "0.08", ... }
  ]
}
```

---

### 2. Get a Single Configuration

Retrieves one config entry by its key.

```
GET /api/v1/config/:key
```

**Example:** `GET /api/v1/config/PLATFORM_FEE_PERCENT`

**Response**
```json
{
  "success": true,
  "config": {
    "key": "PLATFORM_FEE_PERCENT",
    "value": "0.08"
  }
}
```

---

### 3. Update a Configuration Value ⚡ Most Used

This is the primary action for the Admin Dashboard settings panel. Send the new value as a string.

```
PATCH /api/v1/config/:key
```

**Request Body**
```json
{
  "value": "0.10"
}
```

**Example:** Increasing platform commission to 10%
```
PATCH /api/v1/config/PLATFORM_FEE_PERCENT
Body: { "value": "0.10" }
```

**Example:** Enabling maintenance mode
```
PATCH /api/v1/config/MAINTENANCE_MODE
Body: { "value": "true" }
```

**Response**
```json
{
  "success": true,
  "message": "Config \"PLATFORM_FEE_PERCENT\" updated.",
  "config": { "key": "PLATFORM_FEE_PERCENT", "value": "0.10", ... }
}
```

> [!TIP]
> After a successful PATCH, the backend cache is updated instantly. The new fee will apply to the very next order placed on the platform — no delay.

---

### 4. Create a New Configuration

Adds a completely new config key to the system. Use this to introduce new feature flags or operational variables without requiring a backend deployment.

```
POST /api/v1/config
```

**Request Body**
```json
{
  "key": "MAX_ACTIVE_ORDERS_PER_DELIVERER",
  "value": "5"
}
```

**Response**
```json
{
  "success": true,
  "message": "Config \"MAX_ACTIVE_ORDERS_PER_DELIVERER\" created.",
  "config": { "key": "MAX_ACTIVE_ORDERS_PER_DELIVERER", "value": "5", ... }
}
```

> [!WARNING]
> Keys must be **unique**. Attempting to POST a key that already exists will return `409 Conflict`. Use PATCH to update existing keys.

---

### 5. Delete a Configuration

Permanently removes a config key from the system and the cache.

```
DELETE /api/v1/config/:key
```

**Response**
```json
{
  "success": true,
  "message": "Config \"MAX_ACTIVE_ORDERS_PER_DELIVERER\" deleted."
}
```

> [!CAUTION]
> Deleting a pre-seeded key like `PLATFORM_FEE_PERCENT` will cause the backend to fall back to its hardcoded default (`0.08`). Only delete custom keys you've created.

---

## Suggested Admin Dashboard UI

The Settings panel should:

1. **On mount**, call `GET /api/v1/config` to load all configs into a local state object.
2. **Render each config** as an editable field (a text input, a toggle for booleans, or a number input for floats).
3. **On save**, call `PATCH /api/v1/config/:key` with the new stringified value.
4. **Show a success toast** and re-fetch the config list to confirm the updated state.

### Value Parsing Reference for the Frontend

```typescript
// Parse values from the API response correctly
const platformFee = parseFloat(config["PLATFORM_FEE_PERCENT"]); // 0.08
const minDelivery = parseFloat(config["MIN_DELIVERY_FEE"]);       // 33.00
const isMaintenance = config["MAINTENANCE_MODE"] === "true";      // false

// When sending back, always stringify
const payload = { value: String(newFeePercent) }; // "0.10"
```

---

## Error Codes

| Status | Meaning |
|---|---|
| `200` | Success |
| `201` | Config created |
| `400` | Invalid request body |
| `403` | Not an Admin |
| `404` | Config key does not exist |
| `409` | Config key already exists (on POST) |
