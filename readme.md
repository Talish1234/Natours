# Natours

**Natours** is a secure, full-stack tour booking web application built with the **Node.js** ecosystem. It offers user authentication, Stripe-based payments, and robust protection against common web vulnerabilities such as DoS, XSS, and HTTP Parameter Pollution (HPP).

---

## Features

- User authentication with JWT and role-based access  
- Tour CRUD operations for admins  
- Secure Stripe payment integration  
- Image upload and processing with Multer 
- Protected routes and rate limiting  
- XSS, HPP, and NoSQL injection prevention  
- MVC architecture with Express and MongoDB  
---

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose  
- **Templating**: Pug  
- **Authentication**: JWT, bcrypt  
- **Payments**: Stripe  
- **File Uploads**: Multer,
- **Security**: Helmet, Rate Limiting, hpp, xss 
- **Deployment**: [Render](https://natours-rdja.onrender.com)

---

## 📁 Project Structure

```
natours/
│
├── controllers/       # Business logic
├── dev-data/          # Sample data for testing
├── models/            # Mongoose schemas
├── public/            # Static assets
├── routes/            # API and view routes
├── utils/             # Utilities like error handling
├── views/             # Pug templates
├── config.env         # Environment variables
└── server.js          # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js v16 or later  
- MongoDB local or Atlas URI  

### Installation

```bash
git clone [https://github.com/Talish1234/Natours.git](https://github.com/Talish1234/Natours)
cd Natours
npm install --legacy-peer-deps
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=3000
DATABASE=mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/natours
DATABASE_PASSWORD=yourPassword
JWT_SECRET=yourJWTSecret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
STRIPE_SECRET_KEY=yourStripeKey
```

### Run Locally

```bash
npm start
```

## Deployment

The app is deployed on [Render](https://render.com), and environment variables are securely managed via the Render dashboard.

---

## Security Implementations

- **Helmet** for setting HTTP headers  
- **Data sanitization** against NoSQL injection and XSS  
- **Rate limiting** to prevent brute force attacks  
- **HPP** to protect against HTTP Parameter Pollution
  
## Future Scope

- Add a React-based frontend for a modern SPA experience  
- Enable multi-language and currency support  
- Build a mobile app using React Native or Flutter  
- Add admin analytics dashboard for performance tracking  
