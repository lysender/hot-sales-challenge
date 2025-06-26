# hot-sales-challenge

Hot Sales Challenge - High Contention with Node.js and PostgreSQL

## The Problem

- Company is running a promotion for a specific item
- Hot sale for a specific date/time only
- Only one item for simplicity
- Each customer can only buy 1 quantity
- Prevent overselling
- There will be a surge of purchase orders once the hot sale periond begins

## Models

Simplified for demonstration purposes.

Product:
- id
- name

Inventory:
- id -> Product.id
- quantity

Promotion:
- id
- name

Order:
- id
- customer_id
- promotion_id
- product_id
- status
- created_at
- updated_at

## Customer

No need to have users, just allocate a range.

Valid user IDs: 10000 - 60000 (50k users)

## Workflow

In the frontend, let user create a purchase intent:
an order that is pending and gets processed in the background.

The background worker will pick up the pending orders and process them.

## Test Data

- Quantity: 10k
- Required successful orders: 10k
- Duplicate/randomized orders: 10k
- Total requests: 20k

Note: There should be 10k successful requests and the rest can be either
error 400 or error 500 due to unique constraints or transaction locking.

## Testing clients

Sample results using 10 workers.

Go client (uses goroutine and channels)

```
Duration: 1m31.114s
Status: 200, count: 10000
Status: 400, count: 9989
Status: 500, count: 10
Status: 403, count: 1
RPS: 219
```

Rust client (uses thread pool, non-async)
```
Duration: 99s
Status: 500, count: 10
Status: 200, count: 10000
Status: 400, count: 9990
RPS: 202
```
