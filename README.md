# CRM Lead Manager

A simple CRM application to manage website contact form leads with admin access, lead list, statuses, notes, and follow-ups.

## Features

- Lead listing with name, email, source, status
- Lead creation from contact form or admin panel
- Update lead status: new / contacted / converted
- Add notes and follow-up comments per lead
- Secure admin login via JWT

## Project Structure

- `server/` - Express backend API with local SQLite storage
- `client/` - React frontend using Vite

## Setup

1. Copy `.env.example` to `.env` in the project root.
2. Update `ADMIN_USER`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
3. Install dependencies:
   - `npm install`
   - `npm run install-all`
4. Start the app:
   - `npm run dev`

## Run individually

- Backend: `npm run dev --prefix server`
- Frontend: `npm run dev --prefix client`

## Default Admin

- Username: `admin`
- Password: `admin123`

> For production, use stronger credentials and keep `.env` out of source control.
