# ConnectLocal — integrated application

This project combines the supplied static frontend with the supplied Spring Boot backend. The frontend now calls the REST API at `http://localhost:8080/api` instead of using browser `localStorage`.

## Run it

1. Start MySQL and create a user permitted to create/use `connectlocal_db`.
2. Set credentials for the current PowerShell session, for example: `$env:DB_USERNAME='root'; $env:DB_PASSWORD='your-password'`.
3. Start the API: `cd backend; mvn spring-boot:run`.
4. Serve `frontend` using a local web server (for example VS Code Live Server), then open `index.html`.

Provider registration creates its initial service listing automatically. Service browsing, registration, login, and bookings use the backend API. The backend's CORS configuration supports local frontend development.
