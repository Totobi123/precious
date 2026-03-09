# Superbase DBaaS: Complete End-to-End Documentation

This manual covers everything from creating your account to using the Live Monitoring Dashboard.

---

## 🚀 1. Starting the Server (24/7 Mode)

To make your DBaaS always available even after you disconnect:

1. **Install PM2 (if needed):**
   ```bash
   npm install pm2 -g
   ```
2. **Start Superbase:**
   ```bash
   cd /root/superbase
   pm2 start main.py --name "superbase" --interpreter python3
   ```

---

## 🔐 2. Getting Started (The Signup Loop)

### **Step 1: Sign Up**
`POST /auth/signup`
- Payload: `{"email": "your@email.com", "password": "password"}`
- This creates your unique database schema and sends an OTP via your custom (or default) SMTP settings.

### **Step 2: Verify OTP**
`POST /auth/verify-otp`
- Payload: `{"email": "your@email.com", "otp": "123456"}`

### **Step 3: Login**
`POST /auth/login`
- Response: `{"api_key": "db_YOUR_KEY_HERE"}`
- *Note: This API Key is used for both Data operations and Dashboard access.*

---

## 📊 3. The Live Monitoring Dashboard

We have built a professional monitoring dashboard available at:
`http://YOUR_SERVER_IP:7777/dashboard`

### **How to Use:**
1. Open the dashboard in your browser.
2. Enter your **API Key** in the top input field and click **Connect**.
3. **Real-time Stats:** Instantly view how many tables you have and your total API request count.
4. **Activity Logs:** Every time you use the API to save or fetch data, it will appear in the "Recent Activity" list with the exact method, endpoint, and status code.

---

## 🛠️ 4. Data Operations (The Dynamic API)

All data requests must include the header: `Authorization: Bearer YOUR_API_KEY`

### **A. Auto-Table Creation (POST)**
Just send JSON to any table name:
`POST /v1/data/products`
```json
{"name": "Laptop", "price": 1200}
```
*If "products" doesn't exist, Superbase creates it for you automatically.*

### **B. Fetching (GET)**
`GET /v1/data/products`
- Filter with parameters: `?name=Laptop`

### **C. Updating (PATCH)**
`PATCH /v1/data/products/1`
- Updates the record with ID 1.

### **D. Deletion (DELETE)**
`DELETE /v1/data/products/1`

---

## 📧 5. Custom Email Configuration

To use your own branding for OTP emails:
`POST /settings/email`
```json
{
  "smtp_host": "smtp.yourserver.com",
  "smtp_port": 465,
  "smtp_user": "ceo@yourdomain.com",
  "smtp_password": "yourpassword",
  "from_name": "My Design Agency",
  "otp_subject": "Verify your App Account",
  "otp_body": "Your special OTP is: {otp}"
}
```

---

## 🛑 Support & Troubleshooting
- **API Documentation (Swagger):** `http://YOUR_IP:7777/docs`
- **Database Logs:** `pm2 logs superbase`
- **Port Conflicts:** Ensure no other app is using port `7777`.
