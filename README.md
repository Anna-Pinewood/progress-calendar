# Progress Calendar

## Description

Progress Calendar is a web application designed to help users track their achievements across different customizable spheres of life. It provides a visual calendar interface to log and view progress, along with features to manage spheres, generate reports, and customize the appearance.

## Features

- **Achievement Tracking:** Log daily achievements categorized by spheres.
- **Calendar View:** Visualize achievements on a monthly calendar.
- **Sphere Customization:** Create and manage personal spheres (e.g., Work, Learning, Health).
    - Customize sphere colors.
    - Reorder spheres.
- **Reporting:** Generate reports of achievements for a selected period, grouped by sphere.
- **User Authentication:** Secure login to protect user data.
- **Responsive Design:** Usable across different devices.

## Getting Started

1. Copy .env.example to .env in both `api/` and `src/` directories.
2. Run `docker compose up` in the root directory.

## How to
- Добавить достижение за предыдущий день:
```
curl -X POST http://localhost:8000/api/achievements \
  -H "Content-Type: application/json" \
  -d '{
    "sphere_name": "КАРЬЕРА SENIOR",
    "date": "2025-07-16",
    "text": "Провела ещё один собес"
  }'
```

- Переименовать сферу:
```
docker compose exec db psql -U postgres -d progress_calendar_db
UPDATE spheres SET name = 'КАРЬЕРА SENIOR' WHERE name = 'КАРЬЕРА БОЛЬШЕ ДЕНЕГ';
```

