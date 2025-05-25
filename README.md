# 🔗 MERN URL Shortener

A full-stack URL shortener web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Authenticated users can shorten long URLs, view analytics on their links (clicks, location info), and manage their URLs. Includes error boundary handling and a styled 404 Not Found page using Tailwind CSS.

---

## 🚀 Features

- 🔒 **User Authentication** (Register/Login)
- ✂️ **Shorten URLs** with optional custom aliases
- 📊 **Click Analytics** (IP-based geolocation, total clicks)
- 🗃 **User Dashboard** to view & manage URLs
- 🧼 **Error Boundary** for catching frontend crashes
- ❌ **404 Not Found Page** with Tailwind CSS
- 🌐 **Responsive UI** built with Tailwind CSS
- ⚡ **Protected Routes** for authenticated users only

---

## 🛠 Tech Stack

### Frontend
- React.js
- React Router
- Tailwind CSS
- Axios
- Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- NanoID for short URL generation
- ip-api for geolocation

---

## 📁 Folder Structure

```
root/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.jsx
├── .env
├── README.md
└── package.json
```

---

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mern-url-shortener.git
cd mern-url-shortener
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Set Up Environment Variables
Create a `.env` file in the backend folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
BASE_URL=http://localhost:5000
```

### 5. Run the App
In one terminal:
```bash
cd backend
npm run dev
```

In another terminal:
```bash
cd frontend
npm start
```

---

## 🔐 Authentication

This app uses JWT-based authentication. After logging in, the token is stored in localStorage and used to protect routes via ProtectedRoute.

---

## 📈 URL Analytics

On each redirect, the app:
- Increments the click count
- Captures the user's IP address
- Uses ip-api.com to fetch location (City, Region, Country)
- Stores this info in the clickDetails array

---

## 🧯 Error Boundary

The app includes a global error boundary component to catch and display any unexpected UI errors without crashing the entire app.

---

## ❌ Not Found Page

Tailwind-styled 404 page that shows when a user navigates to an unknown route.

---

## 🏗️ API Endpoints

### Auth Routes

- **POST /api/auth/register:** Register a new user
  - **Request Body:** `{ name, email, password }`
  - **Response:** User object or error message

- **POST /api/auth/login:** Authenticate user and return JWT
  - **Request Body:** `{ email, password }`
  - **Response:** JWT token and user data

### URL Routes

- **GET /api/urls:** Get all URLs for authenticated user
  - **Response:** Array of URL objects with analytics

- **POST /api/urls/shorten:** Create shortened URL
  - **Request Body:** `{ originalUrl, customAlias? }`
  - **Response:** Shortened URL object

- **GET /api/urls/:shortCode:** Redirect to original URL and track analytics
  - **Response:** Redirect to original URL

- **DELETE /api/urls/:id:** Delete URL (owner only)
  - **Response:** Success message

---

## 📸 Screenshots

*(Add your app screenshots here showing Dashboard, Short URL form, Analytics, and 404 page.)*

---

## 🔥 Deployment

You can deploy the frontend on platforms like **Netlify** or **Vercel**, and the backend on services like **Render** or **Heroku**.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Feel free to fork the repo, make changes, and submit pull requests.

---

## 📞 Contact

For inquiries, please contact: **your-email@example.com**

---

## 🙋‍♂️ Author

Developed by **Sanjay Narukulla**
