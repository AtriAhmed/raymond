# Backend Setup Instructions

This guide explains how to run the backend of the project using Docker. Both development and production environments are covered.

## Prerequisites

Ensure you have the following installed:

- Docker
- Docker Compose

## Development

1. Build the development image with Docker Compose:

   ```bash
   docker-compose -f docker-compose.dev.yml build
   ```

2. Start the development container:

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Start the development container with automatic build:
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## Production

1. Build the production image with Docker Compose:

   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. Start the production container:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. Start the production container with automatic build:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Notes

- The backend and frontend are in the same repository. These instructions apply to the backend only.
- Adjust `.env` files as needed for your environment.
