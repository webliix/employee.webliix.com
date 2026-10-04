# employee.webliix.com

Dedicated Webliix Employee Self-Service Portal frontend application.

## Overview
- **Production Domain**: `https://employee.webliix.com`
- **Backend API**: Webliix Spring Boot REST API
- **Authentication**: JWT token-based authentication via `/api/v1/auth/login`
- **Role Requirement**: Accounts provisioned with the `EMPLOYEE` role

## Key Features
- **Dashboard**: Quick metrics overview, assigned projects, open tickets, recent work logs.
- **Projects**: View assigned projects, team details, client company information, progress tracking.
- **Daily Work Reports**: Submit daily activity summaries, hours worked, completed tasks, and blockers.
- **Support Tickets**: Review assigned tickets, status lifecycle, and interactive communication comments.
- **Payment Collections**: Record customer payment collections, method, and transaction references for administrative audit.
- **Employee Profile**: View verified employment profile, designation, department, and account information.

## Setup & Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
```
