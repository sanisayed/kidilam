# ==============================================================================
# Multi-Stage Dockerfile for Google Cloud Run (100% Free Tier Compatible)
# Stage 1: Build the React Vite frontend
# Stage 2: Minimal Python 3.11 container serving both API and Frontend
# ==============================================================================

# ── Stage 1: Frontend Builder ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Optional build args for client-side Supabase configuration
ARG VITE_SUPABASE_URL=https://viglitfnvcnzdhpunrvc.supabase.co
ARG VITE_SUPABASE_ANON_KEY=sb_publishable_Yq1TJCPc49WzQzyPcqLohA_tBOd5mEJ
ARG VITE_API_URL=""

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
    VITE_API_URL=$VITE_API_URL

# Copy package definitions and install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source files and build Vite production bundle to /app/dist
COPY . ./
RUN npm run build

# ── Stage 2: Production Python Backend & Static Server ───────────────────────
FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    FLASK_ENV=production \
    FRONTEND_DIST_DIR=/app/dist

WORKDIR /app

# Install minimal system dependencies for PostgreSQL (psycopg2) and PDF tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy compiled frontend from Stage 1 into /app/dist
COPY --from=frontend-builder /app/dist /app/dist

# Expose Cloud Run default port
EXPOSE 8080

# Run Gunicorn bound to Cloud Run's dynamic $PORT environment variable
# 1 worker and 8 threads optimizes memory to fit comfortably in Cloud Run's 512MB free tier
CMD exec gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 120
