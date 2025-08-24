# Event Management System

A comprehensive event management platform built with React frontend and Flask backend, featuring role-based access control for students and event organizers.

## 🚀 Features

### 🔑 Authentication & Role-based Access
- JWT-based authentication system
- Role-based access control (Student vs Organizer)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

### 🎉 Event Management
- **For Students:**
  - Browse and search events
  - RSVP to events with payment status tracking
  - Comment system for event interaction
  - View RSVP history and payment status

- **For Organizers:**
  - Create, update, and delete events
  - Rich event details (title, description, location, date, banner, price)
  - Manage RSVPs and view attendee lists
  - Reply to comments in real-time

### 📱 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Premium color palette and smooth transitions
- Mobile-first responsive design
- Loading states and error handling
- Toast notifications for user feedback

### 🛠 Technical Features
- **Frontend:** React 18 with TypeScript
- **Backend:** Flask with SQLAlchemy ORM
- **Database:** PostgreSQL
- **Authentication:** JWT tokens
- **Styling:** Tailwind CSS with custom components
- **Icons:** Heroicons
- **HTTP Client:** Axios with interceptors

## 📁 Project Structure

```
event-management-system/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main app component
│   │   └── index.css        # Global styles
│   ├── package.json         # Node.js dependencies
│   └── tailwind.config.js   # Tailwind configuration
└── README.md               # This file
```

## 🛠 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL database

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd event-management-system/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secret keys
   ```

5. **Initialize database:**
   ```bash
   python app.py
   # This will create the database tables automatically
   ```

6. **Run the backend server:**
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd event-management-system/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## 🌐 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (organizers only)
- `GET /api/events/<id>` - Get event details
- `PUT /api/events/<id>` - Update event (organizer only)
- `DELETE /api/events/<id>` - Delete event (organizer only)

### RSVPs
- `POST /api/rsvp` - Create RSVP
- `DELETE /api/rsvp/<event_id>` - Cancel RSVP
- `GET /api/rsvp/<event_id>` - Get RSVP status

### Comments
- `GET /api/events/<id>/comments` - Get event comments
- `POST /api/events/<id>/comments` - Add comment
- `DELETE /api/comments/<id>` - Delete comment

### Organizer Routes
- `GET /api/organizer/events` - Get organizer's events
- `GET /api/organizer/events/<id>/rsvps` - Get event RSVPs

## 🎨 UI Components

### Reusable Components
- `LoadingError` - Handles loading and error states
- `Navbar` - Responsive navigation with user menu
- Custom button classes (btn-primary, btn-secondary, btn-danger)
- Card layouts with consistent styling

### Pages
- **Login/Register** - Authentication forms
- **Dashboard** - Role-based dashboard views
- **Events** - Event listing with search and filters
- **EventDetail** - Detailed event view with RSVP and comments
- **CreateEvent** - Event creation form (organizers)
- **Profile** - User profile management

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- CORS configuration
- Input validation and sanitization
- Protected API endpoints

## 🚀 Deployment

### Backend Deployment (Render/Heroku)
1. Set environment variables in your deployment platform
2. Configure PostgreSQL database
3. Deploy the Flask app

### Frontend Deployment
1. Build the production version:
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your hosting service

## 🧪 Testing

The application includes comprehensive error handling and validation:
- Form validation on both frontend and backend
- API error responses with meaningful messages
- Loading states and user feedback
- Responsive design testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React, Flask, and Tailwind CSS**