# ConnectLocal — Backend

Hyperlocal Service Marketplace backend built with Java 21, Spring Boot 3, Spring Data JPA,
Spring Security (JWT), and MySQL 8.

## Prerequisites

- Java 21 JDK
- Maven 3.9+ (or use the included setup — VS Code's Java extension pack can run Maven for you)
- MySQL 8 running locally

## 1. Configure the database

The app auto-creates the schema (`spring.jpa.hibernate.ddl-auto=update`) and the database itself
(`createDatabaseIfNotExist=true`), so you only need a MySQL server running and a user with access.

Edit `src/main/resources/application.properties` and set your own credentials:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

## 2. Run the app

From the `backend/` folder:

```bash
mvn spring-boot:run
```

The API will start on `http://localhost:8080`.

To build a runnable jar instead:

```bash
mvn clean package
java -jar target/connectlocal-backend.jar
```

## 3. Try it out

Register a provider:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Asha Rao","email":"asha@example.com","phone":"9876543210","password":"secret123","role":"SERVICE_PROVIDER"}'
```

Log in and grab the JWT:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"asha@example.com","password":"secret123"}'
```

Use the returned `token` as a Bearer token on subsequent authenticated requests:

```bash
curl http://localhost:8080/api/services \
  -H "Authorization: Bearer <token>"
```

## API Overview

| Area     | Method | Endpoint                              | Auth required |
|----------|--------|----------------------------------------|---------------|
| Auth     | POST   | /api/auth/register                     | No |
| Auth     | POST   | /api/auth/login                        | No |
| Users    | GET    | /api/users                             | Yes |
| Users    | GET    | /api/users/{id}                        | Yes |
| Users    | PUT    | /api/users/{id}                        | Yes |
| Users    | DELETE | /api/users/{id}                        | Yes |
| Services | POST   | /api/services?providerId=1             | Yes |
| Services | GET    | /api/services?keyword=plumber          | No |
| Services | GET    | /api/services/{id}                     | No |
| Services | PUT    | /api/services/{id}                     | Yes |
| Services | DELETE | /api/services/{id}                     | Yes |
| Services | GET    | /api/services/provider/{providerId}    | No |
| Bookings | POST   | /api/bookings?seekerId=2               | Yes |
| Bookings | GET    | /api/bookings?seekerId= / ?providerId= | Yes |
| Bookings | GET    | /api/bookings/{id}                     | Yes |
| Bookings | PUT    | /api/bookings/{id}?status=ACCEPTED     | Yes |
| Bookings | DELETE | /api/bookings/{id}                     | Yes |
| Reviews  | POST   | /api/reviews?seekerId=2                | Yes |
| Reviews  | GET    | /api/reviews/provider/{providerId}     | No |

Booking `status` values: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`.
Deleting a booking (`DELETE /api/bookings/{id}`) is a soft-delete — it sets status to
`CANCELLED` rather than removing the row, so booking history is preserved.

## Design notes

- **Auth**: stateless JWT (HS256). Pass the token as `Authorization: Bearer <token>`.
- **Passwords**: hashed with BCrypt before storage.
- **Public endpoints**: `/api/auth/**`, and read (`GET`) access to `/api/services/**` and
  `/api/reviews/**`, so browsing works without logging in. Everything else requires a valid JWT.
- **Naming collision**: the domain entity is named `Service` (per the required project
  structure), which collides with Spring's `@Service` stereotype annotation. In
  `ServiceServiceImpl` and `BookingServiceImpl` (which also touches the `Service` entity),
  the annotation is referenced by its fully-qualified name
  (`@org.springframework.stereotype.Service`) instead of being imported, to avoid the clash.
- **CORS**: wide open (`*`) for local development with a plain HTML/CSS/JS frontend. Tighten
  `CorsConfig` before deploying.

## Project structure

```
backend/
  pom.xml
  src/main/java/com/connectlocal/
    ConnectLocalApplication.java
    controller/    AuthController, UserController, ServiceController, BookingController, ReviewController
    entity/        User, Service, Booking, Review
    repository/    UserRepository, ServiceRepository, BookingRepository, ReviewRepository
    service/       *Service interfaces + *ServiceImpl implementations
    dto/           RegisterRequest, LoginRequest, LoginResponse, UserResponse, ServiceDTO, BookingDTO, ReviewDTO
    config/        CorsConfig
    exception/     ResourceNotFoundException, DuplicateEmailException, GlobalExceptionHandler
    security/      SecurityConfig, JwtAuthenticationFilter, JwtService, CustomUserDetailsService
  src/main/resources/application.properties
```
