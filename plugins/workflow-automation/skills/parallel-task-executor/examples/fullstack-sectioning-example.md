## Complete Example: Full-Stack Application (Sectioning)

### Task
"Build a full-stack e-commerce product catalog with React frontend, Node.js backend, and PostgreSQL database"

### Sectioning Analysis

```markdown
## Parallelization Plan

### Independent Subtasks
1. **Frontend**: React product catalog UI
2. **Backend**: Node.js REST API
3. **Database**: PostgreSQL schema and migrations

### Dependency Check
- Frontend ← (needs API endpoints) → Wait for interface definition
- Backend ← (needs DB schema) → Wait for schema definition
- Database ← (independent) → Can start immediately

### Execution Strategy
1. **Phase 1 (Parallel)**: Define contracts first
   - API interface (endpoints, types)
   - Database schema (tables, relations)
2. **Phase 2 (Parallel)**: Implement against contracts
   - Worker 1: Frontend against API contract
   - Worker 2: Backend against DB schema
   - Worker 3: Database setup
3. **Phase 3**: Integration merge
```

### Parallel Execution

```markdown
## Worker Execution

### Worker 1: Frontend (React)
**Task**: Build product catalog UI

**Output**:
```typescript
// ProductCatalog.tsx
import { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';

export const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/products').then(setProducts);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

**Status**: Complete
**Files Generated**: 5 components, API client, types

---

### Worker 2: Backend (Node.js)
**Task**: Build REST API endpoints

**Output**:
```typescript
// routes/products.ts
import express from 'express';
import { db } from '../db';

const router = express.Router();

router.get('/products', async (req, res) => {
  const products = await db.query('SELECT * FROM products');
  res.json(products.rows);
});

router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await db.query('SELECT * FROM products WHERE id = $1', [id]);
  res.json(product.rows[0]);
});

export default router;
```

**Status**: Complete
**Files Generated**: 3 route files, controllers, middleware

---

### Worker 3: Database (PostgreSQL)
**Task**: Create schema and migrations

**Output**:
```sql
-- migrations/001_create_products.sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
```

**Status**: Complete
**Files Generated**: 3 migrations, seed data, connection config
```

### Merge Results

```markdown
## Integration Merge

### Conflicts Detected
1. **Port Conflict**: Frontend dev server (3000) vs Backend server (3000)
   - Resolution: Backend → 3001, Frontend proxy config updated

2. **Type Mismatch**: Frontend expects `imageUrl`, Backend returns `image_url`
   - Resolution: Added camelCase transformer in API client

3. **Missing CORS**: Frontend blocked by CORS policy
   - Resolution: Added CORS middleware to backend

### Merged Configuration
```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - REACT_APP_API_URL=http://localhost:3001

  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/catalog
    depends_on: [db]

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=catalog
```

### Final Output
- **Complete application** ready to run with `docker-compose up`
- **Execution time**: 15 minutes (vs 45 minutes sequential)
- **Speedup factor**: 3x
- **Integration tests**: Passing
```

