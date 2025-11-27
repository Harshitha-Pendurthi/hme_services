# Home Services Booking Application

A comprehensive full-stack application for booking home services with customer, service provider, and admin roles.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 with React Router
- **Backend**: Spring Boot 3.2 with Java 17
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkins Pipeline
- **Authentication**: JWT-based custom authentication

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Spring Boot API │    │   MySQL Database│
│   (Port 3000)   │◄──►│   (Port 8080)   │◄──►│   (Port 3306)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Java 17+ (for local development)
- Maven 3.9+ (for local development)

### Using Docker (Recommended)

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/home-services-app.git
   cd home-services-app
   \`\`\`

2. **Build and start the application**
   \`\`\`bash
   chmod +x scripts/docker-build.sh
   ./scripts/docker-build.sh
   \`\`\`

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - Database: localhost:3306

### Manual Setup

#### Database Setup
1. Install MySQL 8.0
2. Create database and run schema:
   \`\`\`bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed_data.sql
   \`\`\`

#### Backend Setup
1. Navigate to backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Configure database connection in `application.properties`

3. Build and run:
   \`\`\`bash
   mvn clean install
   mvn spring-boot:run
   \`\`\`

#### Frontend Setup
1. Navigate to frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install dependencies and start:
   \`\`\`bash
   npm install
   npm start
   \`\`\`

## 👥 User Roles & Features

### Customers
- ✅ Create account and login
- ✅ Browse services by category
- ✅ View service details and provider information
- ✅ Book services with date/time selection
- ✅ Track booking status
- ✅ View booking history
- ✅ Dashboard with statistics

### Service Providers
- ✅ Register as service provider
- ✅ List services under predefined categories
- ✅ Manage service availability
- ✅ Accept/reject booking requests
- ✅ Update booking status (confirmed → in-progress → completed)
- ✅ View earnings and statistics

### Administrators
- ✅ Manage users and services
- ✅ View system-wide statistics
- ✅ Monitor all bookings
- ✅ System administration dashboard

## 🔐 Authentication

The application uses custom JWT-based authentication:

- **Registration**: Users can register as customers or service providers
- **Login**: Username/password authentication
- **JWT Tokens**: Secure API access with Bearer tokens
- **Role-based Access**: Different permissions for each user role

### Default Users (from seed data)
- **Admin**: `admin` / `password`
- **Customer**: `john_doe` / `password`
- **Provider**: `mike_plumber` / `password`

## 📊 Database Schema

### Core Tables
- `users` - User accounts (customers, providers, admins)
- `service_categories` - Predefined service categories
- `services` - Services offered by providers
- `bookings` - Service bookings and appointments
- `payments` - Payment records and transactions
- `provider_availability` - Provider working hours
- `notifications` - System notifications
- `reviews` - Customer reviews and ratings

### Relationships
- Users can be customers, providers, or admins
- Providers can offer multiple services
- Customers can make multiple bookings
- Each booking belongs to one service and provider
- Payments are linked to bookings

## 🔧 API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/signin     - User login
POST /api/auth/signup     - User registration
\`\`\`

### Service Endpoints
\`\`\`
GET    /api/services              - List all services
GET    /api/services/{id}         - Get service details
GET    /api/services/category/{id} - Services by category
POST   /api/services              - Create service (Provider/Admin)
PUT    /api/services/{id}         - Update service (Provider/Admin)
DELETE /api/services/{id}         - Delete service (Provider/Admin)
\`\`\`

### Booking Endpoints
\`\`\`
GET  /api/bookings           - User's bookings
GET  /api/bookings/{id}      - Booking details
POST /api/bookings           - Create booking (Customer)
PUT  /api/bookings/{id}/status - Update booking status (Provider/Admin)
\`\`\`

### Category Endpoints
\`\`\`
GET /api/categories     - List all categories
GET /api/categories/{id} - Category details
\`\`\`

## 🐳 Docker Configuration

### Development Environment
\`\`\`bash
docker-compose up -d
\`\`\`

### Production Environment
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### Available Services
- **Database**: MySQL with persistent storage
- **Backend**: Spring Boot API with health checks
- **Frontend**: React app served by Nginx
- **Tomcat**: Production deployment server

## 🔄 CI/CD Pipeline

### Jenkins Pipeline Stages
1. **Checkout** - Get source code
2. **Build Backend** - Maven build and test
3. **Build Frontend** - npm build and test
4. **Code Quality** - ESLint, SpotBugs, Checkstyle
5. **Security Scan** - OWASP dependency check
6. **Docker Build** - Create container images
7. **Integration Tests** - End-to-end testing
8. **Deploy Staging** - Automatic staging deployment
9. **Deploy Production** - Manual approval required

### Setup Jenkins
\`\`\`bash
chmod +x scripts/jenkins-setup.sh
./scripts/jenkins-setup.sh
\`\`\`

## 🧪 Testing

### Backend Tests
\`\`\`bash
cd backend
mvn test                    # Unit tests
mvn verify                  # Integration tests
mvn jacoco:report          # Coverage report
\`\`\`

### Frontend Tests
\`\`\`bash
cd frontend
npm test                    # Unit tests
npm run test:coverage      # Coverage report
\`\`\`

### Integration Tests
\`\`\`bash
docker-compose -f docker-compose.test.yml up -d
# Run integration tests
docker-compose -f docker-compose.test.yml down
\`\`\`

## 📈 Monitoring & Health Checks

### Health Endpoints
- Backend: `http://localhost:8080/api/actuator/health`
- Frontend: `http://localhost:3000/health`
- Database: Built-in MySQL health checks

### Metrics
- Application metrics via Micrometer
- Prometheus integration available
- Custom business metrics for bookings and revenue

## 🔒 Security Features

### Backend Security
- JWT token authentication
- Password encryption with BCrypt
- CORS configuration
- SQL injection prevention with JPA
- Input validation with Bean Validation

### Frontend Security
- Secure token storage
- Protected routes
- XSS prevention
- CSRF protection headers

### Infrastructure Security
- Docker security best practices
- Non-root container users
- Health check endpoints
- Secure environment variable handling

## 🚀 Deployment

### Local Development
\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

### Production Deployment
\`\`\`bash
# Deploy to production
chmod +x scripts/docker-deploy.sh
./scripts/docker-deploy.sh
\`\`\`

### Environment Variables
Create `.env` file with:
\`\`\`env
DB_ROOT_PASSWORD=your_secure_password
DB_USER=homeservices
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
\`\`\`

## 🛠️ Development

### Project Structure
\`\`\`
home-services-app/
├── backend/                 # Spring Boot API
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml             # Maven dependencies
├── frontend/               # React application
│   ├── src/                # React source code
│   ├── public/             # Static assets
│   └── package.json        # npm dependencies
├── database/               # Database scripts
│   ├── schema.sql          # Database schema
│   └── seed_data.sql       # Initial data
├── scripts/                # Utility scripts
├── docker-compose.yml      # Development environment
└── Jenkinsfile            # CI/CD pipeline
\`\`\`

### Adding New Features

1. **Backend Changes**
   - Add new entities in `model/` package
   - Create repositories in `repository/` package
   - Implement services in `service/` package
   - Add controllers in `controller/` package
   - Write tests in `src/test/`

2. **Frontend Changes**
   - Add components in `src/components/`
   - Create pages in `src/pages/`
   - Add services in `src/services/`
   - Update routing in `App.js`
   - Write tests alongside components

3. **Database Changes**
   - Update schema in `database/schema.sql`
   - Add migration scripts if needed
   - Update seed data if required

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
\`\`\`bash
# Check if MySQL is running
docker-compose ps
# View database logs
docker-compose logs database
\`\`\`

**Frontend Build Errors**
\`\`\`bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Backend Build Errors**
\`\`\`bash
# Clean Maven cache
mvn clean
# Skip tests if needed
mvn package -DskipTests
\`\`\`

**Docker Issues**
\`\`\`bash
# Clean up Docker resources
./scripts/docker-cleanup.sh
# Rebuild images
docker-compose build --no-cache
\`\`\`

### Logs and Debugging
\`\`\`bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
\`\`\`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Commit changes: `git commit -am 'Add new feature'`
5. Push to branch: `git push origin feature/new-feature`
6. Submit a pull request

### Code Standards
- **Java**: Follow Google Java Style Guide
- **JavaScript**: Use ESLint and Prettier
- **Git**: Use conventional commit messages
- **Testing**: Maintain >70% code coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue on GitHub
- Email: support@homeservices.com
- Documentation: [Wiki](https://github.com/your-username/home-services-app/wiki)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic booking system
- ✅ User authentication
- ✅ Service management
- ✅ Docker deployment

### Phase 2 (Planned)
- 🔄 Real payment integration
- 🔄 Email notifications
- 🔄 Mobile app (React Native)
- 🔄 Advanced search and filters

### Phase 3 (Future)
- 📋 Real-time chat
- 📋 Service provider ratings
- 📋 Advanced analytics
- 📋 Multi-language support

---

**Built with ❤️ using React, Spring Boot, and Docker**
