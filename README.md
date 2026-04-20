# AI-Powered Personal Finance Tracker

A full-stack application for tracking income and expenses with intelligent transaction classification using Claude AI.

[![Java](https://img.shields.io/badge/Java-17-orange)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

## Features

### AI-Powered Intelligence
- Automatic transaction classification using Claude API
- Categorizes expenses from simple descriptions ("coffee", "uber ride", etc.)
- Confidence scoring for AI classifications
- Monthly spending analysis and recommendations

### Financial Management
- Track income and expenses with transaction history
- Monthly statistics dashboard with savings tracking
- Visual analytics with interactive charts
- Filter transactions by month and year

### Technical Features
- JWT authentication with secure password hashing
- RESTful API with Swagger documentation
- Docker containerization
- Responsive React frontend with Tailwind CSS

## Project Structure

```
Expense_Income_Tracker/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/financetracker/
│   │   ├── config/                   # Security, AI, Swagger configs
│   │   ├── controller/               # REST controllers
│   │   ├── service/                  # Business logic (AI service ⭐)
│   │   ├── repository/               # JPA repositories
│   │   ├── model/                    # JPA entities
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── security/                 # JWT implementation
│   │   └── exception/                # Error handling
│   ├── src/main/resources/
│   │   └── application.properties    # Configuration
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── Auth/                 # Login, Signup
│   │   │   ├── Dashboard/            # Analytics, Charts
│   │   │   └── Transactions/         # Transaction management
│   │   ├── services/                 # API clients
│   │   ├── context/                  # Auth context
│   │   └── App.jsx                   # Main app
│   └── package.json                  # NPM dependencies
│
├── SYSTEM_DESIGN.md                  # Architecture overview
├── DATABASE_SCHEMA.md                # Complete database design
├── BACKEND_IMPLEMENTATION.md         # Backend code details
├── FRONTEND_IMPLEMENTATION.md        # Frontend code details
├── DOCKER_DEPLOYMENT.md              # Deployment guide
├── IMPLEMENTATION_GUIDE.md           # Step-by-step setup
├── RESUME_BULLETS.md                 # Resume talking points
└── docker-compose.yml                # Container orchestration
```

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.4
- **Security**: Spring Security with JWT
- **Database**: PostgreSQL 16 + Spring Data JPA/Hibernate
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **Build Tool**: Maven
- **Java Version**: 17

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Query
- **Routing**: React Router v6

### DevOps
- **Containerization**: Docker & Docker Compose
- **Cloud**: AWS deployment ready

## Getting Started

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 16
- Maven 3.8+
- Claude API Key ([Get here](https://console.anthropic.com/))

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/ai-finance-tracker
cd ai-finance-tracker

# Create environment file
cp .env.example .env
# Edit .env with your Claude API key and credentials

# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

### Option 2: Manual Setup

**1. Setup Database**
```bash
# Start PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE finance_tracker_db;

# Run migrations
\i DATABASE_SCHEMA.md
```

**2. Start Backend**
```bash
cd backend

# Configure application.properties
# Set database URL, JWT secret, Claude API key

# Run application
mvn spring-boot:run

# Backend runs on http://localhost:8080
```

**3. Start Frontend**
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/api" > .env

# Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

## Documentation

Additional documentation:

- **SYSTEM_DESIGN.md** - Architecture and data flow
- **DATABASE_SCHEMA.md** - Database schema
- **BACKEND_IMPLEMENTATION.md** - Backend implementation details
- **FRONTEND_IMPLEMENTATION.md** - Frontend implementation details
- **DOCKER_DEPLOYMENT.md** - Deployment guide

## API Endpoints

### Authentication
```bash
POST /api/auth/signup       # Register new user
POST /api/auth/login        # User login (returns JWT)
```

### Transactions (Requires JWT)
```bash
POST   /api/transactions              # Create transaction (AI classifies)
GET    /api/transactions              # List transactions (paginated)
GET    /api/transactions/monthly      # Monthly transactions
PUT    /api/transactions/{id}         # Update transaction
DELETE /api/transactions/{id}         # Delete transaction
```

### Dashboard (Requires JWT)
```bash
GET /api/dashboard/monthly?month=4&year=2024   # Monthly analytics + AI insights
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "coffee at starbucks",
    "amount": 5.50,
    "transactionDate": "2024-04-15"
  }'
```

**AI Response:**
```json
{
  "id": 1,
  "description": "coffee at starbucks",
  "amount": 5.50,
  "type": "EXPENSE",
  "categoryName": "Food & Dining",
  "subcategory": "coffee",
  "aiClassified": true,
  "aiConfidence": 0.95,
  "transactionDate": "2024-04-15"
}
```

## Testing

### Backend Tests
```bash
cd backend
mvn test                    # Run all tests
mvn jacoco:report           # Generate coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test                # Run tests
npm run build               # Production build
```

## Deployment

See **DOCKER_DEPLOYMENT.md** for complete deployment instructions.

## Security

- JWT authentication with BCrypt password hashing
- CORS protection
- SQL injection prevention with parameterized queries
- Input validation

## License

This project is licensed under the MIT License.
