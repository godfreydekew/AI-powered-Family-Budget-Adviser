cd "$(dirname "$0")/.."
.venv/bin/alembic revision --autogenerate -m "Describe what changed"
.venv/bin/alembic upgrade head