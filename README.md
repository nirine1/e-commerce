# E-Commerce

This repository contains a full-stack application with Laravel API backend and React frontend, all containerized with Docker.

## Project Structure

```
.
├── api/                 # Laravel application (backend API)
├── web/                 # React application (frontend)
├── docker-compose.yml   # Docker services configuration
├── Dockerfile.api       # Docker configuration for Laravel
├── Dockerfile.web       # Docker configuration for React
├── nginx-api.conf       # Nginx configuration for Laravel API
└── README.md            # This file
```

## Prerequisites

Before running this application, make sure you have installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nirine1/e-commerce
   cd e-commerce/
   ```

2. **Set up Laravel environment**
   ```bash
   # Copy the example environment file
   cp api/.env.example api/.env

   # The .env file already has the correct configuration. You don\'t need to change anything to it.
   ```

3. **Build and start the containers**
   ```bash
   docker-compose up --build
   ```

4. **Generate Laravel application key** (in another terminal, optional)
   ```bash
   docker-compose exec api php artisan key:generate
   ```

5. **Run Laravel migrations**
   ```bash
   docker-compose exec api php artisan migrate
   ```

6. **Access the application**
   - **Frontend (React)**: `http://localhost:3000`
   - **API (Laravel)**: run `curl http://localhost:8080/api/health` or send a GET request to the same endpoint.

7. **Troubleshooting**
   - **If the curl to API does not work**: install composer dependencies manually in the container : `composer-compose exec api composer install`.

## Services

### Frontend (React)
- **Port**: 3000
- **Container**: `e-commerce-web`
- **Technology**: React with Vite, served by Nginx

### Backend (Laravel API)
- **Port**: 8080
- **Container**: `e-commerce-api` + `e-commerce-api-nginx`
- **Technology**: Laravel with PHP 8.2-FPM + Nginx

### Database (MySQL)
- **Port**: Internal only (no external access)
- **Container**: `e-commerce-db`
- **Database**: `e_commerce_db`

## Development Commands

### Daily development
```bash
docker-compose up
```

### Build - only when : 
```bash
# Added new packages
docker-compose down
docker-compose up --build

# Or rebuild specific service
docker-compose build web  # if you changed React dependencies
docker-compose build api  # if you changed Laravel dependencies
```

### Stop the application
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs api
docker-compose logs web
docker-compose logs db
docker-compose logs api-nginx
```

### Execute commands in containers
```bash
# Laravel commands
docker-compose exec api php artisan migrate
docker-compose exec api php artisan tinker
docker-compose exec api composer install
docker-compose exec api php artisan optimize:clear
```

## Production Notes

- Set `APP_DEBUG=false` in production
- Use environment variables for sensitive data
- Consider using Docker secrets for production deployments
- Set up proper SSL/TLS termination
- Use a reverse proxy for production deployment
- Remove the volumes in `docker-compose.yml` and use the production target
