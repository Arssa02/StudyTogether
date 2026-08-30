# StudyTogether

StudyTogether is a web application for coordinating and tracking study sessions between friends.

Users can connect with other registered users, plan study sessions, compare planned study times, start or join active study sessions, track study and break intervals, and view study statistics.

The project was developed as the implementation component of the Systems III course at UP FAMNIT.

## Main Features

### User Management
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Profile viewing and editing

### Friend Management
- Send friend requests to registered users
- Accept or decline incoming friend requests
- Remove existing friends
- View friends' current study status
- Study-related information is shared only between accepted friends

### Planned Study Sessions
- Create planned study sessions with a title, start time, and end time
- Edit or delete planned sessions
- View planned sessions in a weekly calendar
- View accepted friends' planned sessions
- Visually compare overlapping planned study times
- Start a planned session during its scheduled time interval
- A planned session can create at most one active study session

### Active Study Sessions
- Start a spontaneous study session
- View active study sessions of friends
- Join and leave active study sessions
- View current participants
- Sessions automatically end when the last participant leaves
- Completed sessions remain stored for study statistics

### Study Activity Tracking
- Start studying
- Take a break
- Resume studying
- Record study and break intervals
- Calculate actual study time from recorded activity intervals

### Real-Time Updates

Socket.IO is used for near-real-time updates, including:
- participant changes inside a study room
- participant study/break status
- friends' current study status
- changes to visible active study sessions

### Study Statistics
- Today's study time and number of study sessions
- Current week's study time and number of study sessions
- Lifetime study time
- Number of completed study sessions

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO
- JSON Web Tokens (JWT)
- bcrypt

### Database
- MySQL
- phpMyAdmin for database administration

## Project Structure

```text
StudyTogether/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── schema.sql
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── socket.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json
├── package-lock.json
└── README.md
```

The backend `.env` file is excluded from the Git repository and must be created separately.

## Database Structure

The application uses the following main tables:

- `user` — registered users
- `friend` — friend requests and accepted friendship relationships
- `planned_session` — study sessions planned for a future time
- `study_session` — actual active or completed study sessions
- `participation` — records users joining and leaving study sessions
- `study_activity` — records study and break intervals

A planned session may optionally create one actual study session. Actual study sessions can also be started spontaneously without a planned session.

## Environment Configuration

Backend environment variables are stored in `backend/.env` and are not committed to Git.

The backend requires configuration for:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
```

The frontend does not require a separate environment file for the current development setup. API and Socket.IO requests use relative paths and are proxied by Vite to the backend running on port `3001`.

Do not commit real database credentials or JWT secrets to the repository.

## Installation

Clone the repository:

```bash
git clone https://github.com/Arssa02/StudyTogether.git
cd StudyTogether
```

### Backend

Install backend dependencies from the project root:

```bash
npm install
```

Create `backend/.env` and configure the database connection and JWT secret.

The database structure can be created using:

```text
backend/schema.sql
```

Start the backend:

```bash
cd backend
node server.js
```

The backend runs on port `3001`.

### Frontend

In another terminal, from the project root:

```bash
cd frontend
npm install
npm run dev
```

For access from another machine on the network/server:

```bash
npm run dev -- --host
```

The Vite development server normally starts on port `5173`, although it may select another available port.

## University Server Deployment

The application is deployed on the university student server.

During development, the server copy can be updated from the `develop` branch:

```bash
cd ~/Desktop/SysIII-StudyTogether-Implementation/StudyTogether
git pull origin develop
```

Start the backend from the backend directory:

```bash
cd backend
node server.js
```

Start the frontend from the frontend directory:

```bash
cd frontend
npm run dev -- --host
```

The backend must be started from the `backend` directory so that its environment configuration is loaded correctly.

For the final stable submission, the tested `develop` branch is merged into `main`.

## Development Workflow

The project uses a multiple-stability branching strategy.

- `main` — stable, tested versions
- `develop` — ongoing development and integration

Development is performed on `develop`. Tested submission-ready changes are merged into `main`.

## Access Control

Protected backend routes require authentication using a JWT.

Study-related information is restricted according to ownership and accepted friendship relationships. For example:

- users can modify only their own planned sessions
- users can view study information shared by accepted friends
- users can join eligible active sessions of friends
- participant information is available only where permitted by the application rules

## Study Time Calculation

Study time is derived from recorded `study_activity` intervals rather than being stored as a separate accumulated value.

Only intervals with type `study` contribute to study-time statistics. Break intervals are stored but are not counted as active study time.

This allows daily, weekly, and lifetime statistics to be calculated from the underlying activity records.

## Author

Arsenije Đorđević  
Computer Science  
UP FAMNIT