# Setup Instructions

This guide explains how to run both the backend and frontend of the project using Docker. Both development and production environments are covered.

## Prerequisites

Ensure you have the following installed:

- Docker
- Docker Compose

## Development

1. Navigate to the `server` folder for backend or `client` folder for frontend.

2. Build the development image with Docker Compose:

   ```bash
   docker-compose -f docker-compose.dev.yml build
   ```

3. Start the development container:

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

   Alternatively, you can combine the above two steps into one:

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Production

1. Navigate to the `server` folder for backend or `client` folder for frontend.

2. Build the production image with Docker Compose:

   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. Start the production container:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

   Alternatively, you can combine the above two steps into one:

   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Notes

- The backend and frontend are in the same repository. These instructions apply to both backend and frontend.
- Adjust `.env` files as needed for your environment.
