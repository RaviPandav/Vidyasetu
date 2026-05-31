# 🎓 VidyaSetu — Bridge of Knowledge
### Full-Stack Tuition Management Platform (MERN Stack)

A production-ready, scalable coaching institute management system with multi-role support, live classes, payment integration, real-time features, and more.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Access + Refresh Tokens) |
| Real-time | Socket.io |
| Payments | Razorpay |
| Media | Cloudinary / Local uploads |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (client) + Render/Railway (server) + MongoDB Atlas |

---

## 📁 Project Structure

```
vidyasetu/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # PublicLayout, DashboardLayout
│   │   │   ├── common/       # Shared UI components
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── public/       # Home, Courses, Teachers, Contact
│   │   │   ├── auth/         # Login, Register, Reset Password
│   │   │   ├── student/      # Student dashboard + all features
│   │   │   ├── teacher/      # Teacher panel + content management
│   │   │   └── admin/        # Admin panel + analytics
│   │   ├── context/          # Zustand auth store
│   │   ├── hooks/            # useSocket, useDarkMode
│   │   ├── services/         # API service modules (Axios)
│   │   └── styles/           # Tailwind globals
│   └── package.json
│
├── server/                   # Express backend
│   ├── config/               # DB connection
│   ├── controllers/
│   │   ├── admin/            # Dashboard, users, courses, payments
│   │   ├── teacher/          # Courses, quizzes, attendance, live
│   │   ├── student/          # Enrollment, progress, quizzes
│   │   └── public/           # Auth, public listings
│   ├── middleware/           # Auth, error handler, upload
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Route definitions
│   ├── services/             # Email service
│   ├── sockets/              # Socket.io manager
│   ├── uploads/              # Local file storage
│   └── server.js             # Entry point
│
├── package.json              # Monorepo root
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/your-username/vidyasetu.git
cd vidyasetu

# Install all dependencies (root + client + server)
npm run install:all
```

### 2. Configure Environment Variables

**Server** — copy and fill in:
```bash
cp server/.env.example server/.env
```

**Client** — copy and fill in:
```bash
cp client/.env.example client/.env
```

### 3. Run Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run server    # Express API on :5000
npm run client    # Vite React on :5173
```

### 4. Create Admin User

Connect to MongoDB and run this in MongoDB shell or Compass:
```javascript
use vidyasetu
db.users.insertOne({
  name: "Super Admin",
  email: "admin@vidyasetu.com",
  password: "$2a$12$...",  // bcrypt hash of your password
  role: "admin",
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date()
})
```

Or use the register endpoint with role: "student" and manually update role to "admin" in MongoDB.

---

## 🌐 API Documentation

Base URL: `http://localhost:5000/api`

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register student/teacher |
| POST | `/login` | Login + get JWT |
| GET | `/verify-email/:token` | Verify email |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password |
| GET | `/me` | Get current user (protected) |

### Public Routes (`/api/public`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List courses (with filters) |
| GET | `/courses/:slug` | Get single course |
| GET | `/teachers` | List teachers |
| POST | `/inquiry` | Submit contact form |

### Student Routes (`/api/student`) — Requires JWT + role:student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Student dashboard data |
| GET | `/courses` | Enrolled courses |
| GET | `/courses/:id/content` | Course content (enrolled only) |
| PATCH | `/courses/:id/progress` | Update lecture progress |
| POST | `/enroll/:courseId` | Enroll in a course |
| POST | `/payment/create-order` | Create Razorpay order |
| POST | `/payment/verify` | Verify payment + auto-enroll |
| GET | `/quizzes` | Available quizzes |
| POST | `/quizzes/:id/submit` | Submit quiz answers |
| GET | `/results` | Quiz results |
| GET | `/attendance` | Attendance records |
| GET/POST | `/doubts` | View/Post doubts |
| GET | `/notifications` | Notifications |
| PATCH | `/notifications/:id/read` | Mark notification read |

### Teacher Routes (`/api/teacher`) — Requires JWT + role:teacher
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Teacher dashboard |
| GET/POST | `/courses` | List/Create courses |
| PUT | `/courses/:id` | Update course |
| POST | `/courses/:id/publish` | Toggle publish |
| POST | `/courses/:id/sections` | Add section |
| POST | `/courses/:id/sections/:sId/lectures` | Upload lecture |
| GET/POST | `/quizzes` | Quizzes |
| GET | `/quizzes/:id/results` | Quiz results |
| GET/POST | `/attendance` | Attendance |
| GET | `/doubts` | Student doubts |
| POST | `/doubts/:id/answer` | Answer doubt |
| GET/POST | `/live-classes` | Live classes |

### Admin Routes (`/api/admin`) — Requires JWT + role:admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Full analytics |
| GET/PUT/DELETE | `/users/:id` | User management |
| PATCH | `/users/:id/toggle-status` | Activate/Deactivate |
| GET | `/courses` | All courses |
| PATCH | `/courses/:id/approve` | Approve course |
| GET | `/payments` | All payments |
| GET | `/payments/stats` | Revenue stats |
| POST | `/notifications/send` | Broadcast notification |

---

## 🔌 Real-time Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `{ roomId }` | Join a chat room |
| `send_message` | `{ roomId, message }` | Send message |
| `join_live_class` | `{ classId }` | Join live session |
| `typing` | `{ roomId }` | Typing indicator |
| `stop_typing` | `{ roomId }` | Stop typing |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `notification` | `{ title, message, type }` | Real-time notification |
| `receive_message` | `{ from, message, timestamp }` | Incoming chat message |
| `participant_joined` | `{ user }` | User joined live class |
| `user_typing` | `{ user }` | Typing status |

---

## 💳 Payment Flow (Razorpay)

```
Student clicks "Enroll" → POST /student/payment/create-order
  → Razorpay order created
  → Razorpay checkout opens in browser
  → Payment success
  → POST /student/payment/verify (signature verification)
  → Student auto-enrolled in course
  → Payment record saved
```

---

## 🚀 Production Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy /dist folder to Vercel
# Set env: VITE_API_URL=https://your-api.render.com/api
```

### Backend (Render/Railway)
```bash
# Set environment variables in Render dashboard
# Build command: npm install
# Start command: node server.js
```

### Database (MongoDB Atlas)
1. Create free cluster on https://cloud.mongodb.com
2. Get connection string
3. Set `MONGO_URI` in server .env

---

## 🔒 Security Features
- JWT authentication with token expiry
- Bcrypt password hashing (salt rounds: 12)
- Rate limiting (100 req / 15 min per IP)
- MongoDB sanitization (prevents NoSQL injection)
- Helmet.js security headers
- Input validation via express-validator
- Role-based access control (RBAC)
- CORS whitelist

---

## 📋 Environment Variables Reference

### Server (`server/.env`)
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://...
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Client (`client/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_APP_NAME=VidyaSetu
```

---

## 🎯 Features Summary

| Feature | Status |
|---------|--------|
| JWT Auth + Email Verification | ✅ |
| Forgot/Reset Password | ✅ |
| Student Dashboard | ✅ |
| Video Lecture Streaming | ✅ |
| Course Enrollment | ✅ |
| Online Quiz with Timer | ✅ |
| Results & Analytics | ✅ |
| Attendance Tracking | ✅ |
| Doubt/Q&A System | ✅ |
| Real-time Notifications | ✅ |
| Teacher Content Management | ✅ |
| Admin User Management | ✅ |
| Payment (Razorpay) | ✅ |
| Live Class Scheduling | ✅ |
| Socket.io Chat | ✅ |
| Dark Mode | ✅ |
| PWA Support | ✅ |
| Gujarati/English | ✅ |
| Mobile Responsive | ✅ |
| Revenue Charts (Chart.js) | ✅ |

---

Made with ❤️ in Surat, Gujarat 🇮🇳
