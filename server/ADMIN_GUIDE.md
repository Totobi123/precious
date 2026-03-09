# Superbase Admin Panel & Integration Guide

This document provides a technical overview of the Admin Panel implemented in the Superbase DBaaS system.

## 1. Overview
The Admin Panel is a secure, centralized interface located at `/admin`. It allows administrators to manage users, inspect cross-schema data (tenants), edit records live, and communicate with users via a built-in mailer.

## 2. Authentication
Access to admin features is protected by a master administrative key.
- **Default Admin Key:** `Titobilove123@` (Defined as `ADMIN_PASS` in `main.py`).
- **Authorization Header:** All admin API requests must include:
  `Authorization: Bearer Titobilove123@`

## 3. Admin API Endpoints

### User Management
- `GET /api/admin/users`: Returns a list of all registered users, their emails, and their private schema names.
- `GET /api/admin/stats`: Returns global system stats (total users, logs).

### Cross-Schema Data Explorer
- `GET /api/admin/user/{user_id}/tables`: Lists all physical tables within a specific user's schema.
- `GET /api/admin/user/{user_id}/data/{table_name}`: Fetches all rows from a specific user's table.
- `POST /api/admin/user/{user_id}/data/{table_name}/{row_id}`: Updates a specific row in a user's table.
  - **Payload:** JSON object containing column-value pairs to update.

### Mailer System
- `POST /api/admin/send-mail`: Sends a custom email using the system's active SMTP settings.
  - **Payload:**
    ```json
    {
      "to": "recipient@email.com",
      "subject": "Update",
      "body": "Your message content here"
    }
    ```

## 4. UI Features (`/admin`)
- **User Sidebar:** Real-time listing of all platform tenants.
- **Table Selector:** Automatically populates with tables found in the selected user's schema (e.g., `orders`, `tracking`, `products`).
- **Live Editor:** Clicking the "Edit" icon on any row opens a modal to modify any field in that record.
- **Mailer Modal:** A quick-action button to send emails directly to the currently selected user.

## 5. Integration for AI Agents
To interact with the admin system programmatically, an agent should:
1. Use the `ADMIN_PASS` for the `Authorization` header.
2. Use `GET /api/admin/users` to find the `user_id` of the target user.
3. Use the Data Explorer endpoints to read or modify specific tenant data (like updating an order's `tracking_number`).
4. Use the `send-mail` endpoint to notify the user of changes.

---
*Note: This panel operates directly on the PostgreSQL schemas. Ensure valid JSON/Data types are sent during row updates.*
