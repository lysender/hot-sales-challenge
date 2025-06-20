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
- id -> Item.id
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


