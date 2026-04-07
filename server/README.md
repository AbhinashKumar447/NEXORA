# NEXORA Backend (Node + Express + MongoDB)

Production-ready backend for a student networking & opportunity platform.

## Setup

1. Create `.env`

Use `.env.example` as reference:

- `MONGO_URI`
- `JWT_SECRET`

2. Install deps

```bash
npm --prefix server install
```

3. Run

```bash
npm --prefix server run dev
# or
npm --prefix server start
```

Server defaults to: `http://localhost:5000`

## Health

`GET /health`

Response:
```json
{ "status": "ok" }
```

## Auth

### Register

`POST /api/auth/register`

Body:
```json
{ "name": "Amit Sharma", "email": "amit@kluniversity.edu", "password": "secret123" }
```

Response:
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Amit Sharma",
    "email": "amit@kluniversity.edu",
    "collegeId": "...",
    "emailDomain": "kluniversity.edu"
  }
}
```

### Login

`POST /api/auth/login`

Body:
```json
{ "email": "amit@kluniversity.edu", "password": "secret123" }
```

## Users

### List users

`GET /api/users?collegeId=<id>&page=1&limit=10`

### Search by skills

`GET /api/users/search?q=abhi&skill=DSA&college=KLU&page=1&limit=10`

Supported query params (all optional):
- `q`: keyword (matches name/skills/interests/branch)
- `skill` / `skills`: skill filter (`skills` can be comma-separated)
- `interest` / `interests`: interest filter (`interests` can be comma-separated)
- `college` / `collegeId`: college name/domain or Mongo id
- `branch`: branch filter
- `year`: year filter
- `page`, `limit`: pagination

Examples:
- `GET /api/users/search?q=abhi`
- `GET /api/users/search?skills=DSA,React&branch=CSE&year=2`
- `GET /api/users/search?college=KLU&skill=DSA&page=2&limit=10`

### Get user by id

`GET /api/users/:id`

### Get / Update my profile (Protected)

- `GET /api/users/me`
- `PUT /api/users/me`

Header:
`Authorization: Bearer <jwt>`

Body example:
```json
{ "skills": ["DSA", "Web Development"], "branch": "CSE", "year": 3 }
```

## Opportunities

### Create (Protected)

`POST /api/opportunities`

Body:
```json
{ "title": "Looking for DSA Mentor", "type": "mentorship", "skills": "DSA" }
```

### List (filters + pagination)

`GET /api/opportunities?collegeId=<id>&type=mentorship&skills=DSA&page=1&limit=10`

### Apply (Protected)

`POST /api/opportunities/:id/apply`

### Update/Delete (Owner only)

- `PUT /api/opportunities/:id`
- `DELETE /api/opportunities/:id`

## Study Help

### Post request (Protected)

`POST /api/study-help`

### Respond (Protected)

`POST /api/study-help/:id/respond`

Study-help requests auto-expire via MongoDB TTL index (`STUDY_HELP_TTL_HOURS`).

## Achievements

### Add (Protected)

`POST /api/achievements`

Body:
```json
{ "title": "Won Hackathon", "proofType": "link", "proofUrl": "https://example.com" }
```

### List

`GET /api/achievements?userId=<id>&page=1&limit=10`
