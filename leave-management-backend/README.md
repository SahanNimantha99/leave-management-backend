# Leave Management System - Backend

This is the backend API for managing employee leaves. Built with **Node.js**, **Express**, and **Sequelize** (with a SQL database).

---

## **Setup & Run**

1. **Clone the repository**

```bash
git clone <https://github.com/SahanNimantha99/leave-management-backend>
cd leave-management-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following:

```bash
PORT=5000
JWT_SECRET=supersecretjwtkey
```

4. **Run database migrations**

```bash
npx sequelize db:migrate
```

5. **Start the server**

```bash
npm run dev
```

The backend runs on `http://localhost:5000`.

---

## **API Endpoints**

### **Authentication**

- **POST /login**

**Request:**

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
```json
{
  "email": "employee@gmail.com",
  "password": "emp123"
}
```

**Response:**

```json
{
  "token": "<JWT_TOKEN>"
}
```

---

### **Leaves**

**Headers required for all endpoints below:**
```
Authorization: Bearer <JWT_TOKEN>
```

1. **GET /leaves**

- **Admin**: Returns all leaves.
- **Employee**: Returns only their own leaves.

**Example curl:**

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/leaves
```

2. **POST /leaves**

Apply for a leave (Employee).

**Request body:**

```json
{
  "fromDate": "2025-10-20",
  "toDate": "2025-10-25",
  "reason": "Vacation"
}
```

**Response:**

```json
{
  "id": 1,
  "fromDate": "2025-10-20",
  "toDate": "2025-10-25",
  "reason": "Vacation",
  "status": "Pending",
  "userId": 2
}
```

3. **PUT /leaves/:id**

Edit a leave (Employee - only pending leaves).

**Request body:**

```json
{
  "fromDate": "2025-10-21",
  "toDate": "2025-10-26",
  "reason": "Updated vacation"
}
```

4. **PUT /leaves/:id/approve**

Approve or reject a leave (Admin).

**Request body:**

```json
{
  "status": "Approved"
}
```

5. **DELETE /leaves/:id**

Cancel a leave (Employee - only pending leaves).

---

## **Sample Users / Credentials**

| Role      | Email                    | Password     |
|-----------|--------------------------|--------------|
| Admin     | admin@example.com        | admin123     |
| Employee  | employee@gmail.com"      | emp123       |

---

## **Notes**

- **Conflict detection**: Employees cannot apply or edit leaves that overlap with already approved leaves.
- **Responses return standard HTTP codes**:
  - `200 OK` for successful GET/PUT/DELETE
  - `201 Created` for new leave
  - `400 Bad Request` for invalid input
  - `403 Forbidden` for unauthorized actions
  - `404 Not Found` if leave/user does not exist
  - `409 Conflict` for overlapping approved leaves