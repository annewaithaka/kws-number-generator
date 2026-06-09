# KWS Number Allocation System

A small internal admin tool for the Kenya Wildlife Service. One administrator
signs in, manages up to nine staff users, generates unique 5-digit record
numbers, assigns each to a user with an optional note, and searches, filters,
sorts, and exports the resulting records.

Each generated number is unique **forever** — once issued it is never reused,
enforced both by the generator and by a database constraint.

## Tech stack

- **Backend:** Flask, Flask-SQLAlchemy, SQLite, Flask-JWT-Extended
- **Frontend:** React (Vite), React Router, Axios

## Project structure

```
kws-number-generator/
├── backend/
│   ├── run.py              # starts the API server
│   ├── seed.py             # creates the first admin
│   ├── requirements.txt
│   ├── .env                # secrets (not committed) — see .env.example
│   └── app/
│       ├── __init__.py     # create_app() application factory
│       ├── config.py       # configuration, reads .env
│       ├── extensions.py   # db + jwt instances
│       ├── utils.py        # timestamp + unique-number generator
│       ├── models/         # Admin, User, Assignment
│       └── routes/         # auth, users, numbers blueprints
└── frontend/
    └── src/
        ├── api/            # client + per-resource API calls
        ├── context/        # AuthContext (login state)
        ├── components/     # GeneratePanel, UsersPanel, RecordsTable, etc.
        └── pages/          # LoginPage, DashboardPage
```

## Prerequisites

- Python 3.11+
- Node.js 18+

## Backend setup

From the `backend` folder:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create your environment file by copying the template and filling in values:

```powershell
copy .env.example .env             # macOS/Linux: cp .env.example .env
```

Generate a secret for each of `SECRET_KEY` and `JWT_SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to the first admin's credentials, then
create that admin and start the server:

```powershell
python seed.py
python run.py
```

The API runs at **http://localhost:5000**. The SQLite database is created
automatically at `backend/instance/kws_numbers.db`.

## Frontend setup

From the `frontend` folder:

```powershell
npm install
npm run dev
```

The app runs at **http://localhost:5173** and talks to the backend at
`http://localhost:5000` by default. To point it elsewhere, set `VITE_API_URL`
in a `frontend/.env` file.

## First sign-in

Log in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` you seeded. Change the
password any time from the **Account** tab.

## Features

- Admin login with JWT (sessions last 8 hours; adjustable in `app/config.py`)
- Manage up to nine users (add, edit, delete) — a user holding numbers can't be deleted
- Generate a unique 5-digit number and assign it to a user, with an optional note
- Records view with search, filter-by-user, column sorting, and CSV export
- Editable notes on records (number, user, and date stay permanent)
- Self-service password change

## Notes

- **Never commit `.env`** — it holds secret keys and is listed in `.gitignore`.
  Commit `.env.example` instead.
- Generated numbers are never reused, even if a record relationship changes.
- For production, run the backend behind a real WSGI server (e.g. gunicorn or
  waitress) rather than the Flask development server, and build the frontend
  with `npm run build`.