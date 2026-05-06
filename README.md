# StudyTogether - Social Study Session Coordination and Tracking System

## Project Overview

StudyTogether is a web application designed to help students organize, coordinate, and track collaborative study sessions with friends. The system provides a structured way to create study groups, join sessions, track study activity, and visualize progress through statistics and calendar views.

## Features

1. **User Management** - Registration, login, profile management, and friend management
2. **Study Session Management** - Create, edit, and delete study sessions
3. **Session Participation** - Join or leave study sessions created by friends
4. **Study Activity Tracking** - Track study and break intervals within sessions
5. **Visualization** - View friend study status and generate weekly/daily statistics
6. **Calendar View** - Plan and visualize study sessions
7. **Access Control** - Friend-based access control and data privacy

## Tech Stack

- **Frontend**: React, Bootstrap, HTML5, CSS, JavaScript
- **Backend**: Express.js, Node.js
- **Database**: MySQL
- **Server**: 88.200.63.148

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL Server
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd StudyTogetherImplementation
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Edit .env file with your database credentials
DB_HOST=88.200.63.148
DB_USER=studenti
DB_PASSWORD=S039C8R7
DB_NAME=SISIII2026_YOUR_STUDENT_NUMBER
PORT=3001
JWT_SECRET=your_secret_key
```

4. Start the server:
```bash
npm start
```

Server will run on `http://localhost:3001`

## Project Structure

```
StudyTogetherImplementation/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/             # Business logic
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Authentication, error handling
│   └── server.js                # Main entry point
├── frontend/                    # React app (to be created)
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
└── README.md                    # This file
```

## API Documentation

API endpoints will be documented as they are implemented.

## Database Schema

The database consists of 6 main tables:
- `user` - User profiles
- `friend` - Friendship relationships
- `study_session` - Study sessions
- `participation` - Session participation records
- `study_activity` - Study/break activity tracking
- `calendar_event` - Planned study events

## Development

### Branching Strategy

- `main` - Production-ready code
- `develop` - Active development branch
- `feature/*` - Feature branches

### Commit Messages

Use descriptive commit messages:
```
Add user authentication endpoints
Implement study session CRUD operations
Create database migration scripts
```

## Deployment

The application will be deployed to the university server at `88.200.63.148`.

## Author

Arsenije Đorđević

## Course

Systems III - Information Systems Development
