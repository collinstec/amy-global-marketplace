# Meridian — Projects & Goals

A clean, local-first app for organizing projects and setting goals that matter.

## Features

- **Overview dashboard** — active projects, task completion, goal health, upcoming deadlines and overall portfolio progress at a glance.
- **Projects** — a drag-and-drop Kanban board (Planning → In progress → On hold → Completed) or a grid view. Each project has a colour, priority, due date, tags and a task checklist that drives its progress.
- **Goals** — track a measurable number (e.g. `3,400 of 10,000 subscribers`), a set of milestones, or the combined progress of linked projects. Each goal is paced against its start and target dates and flagged as *On track*, *At risk*, *Behind* or *Achieved*.
- **Search & filters** across projects and goals.
- **Light and dark themes** (follows your system setting by default).
- **Export / import** a JSON backup; delete actions can be undone.
- Responsive layout for desktop, tablet and phone.

## Running it

There is no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

Your data is stored in the browser's `localStorage`. The first launch includes sample data so you can explore — delete it or import your own backup whenever you like.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Search |
| `n` | New project |
| `g` | New goal |
| `1` `2` `3` | Overview / Projects / Goals |
| `Esc` | Close panel or dialog |

## Files

- `index.html` — app shell
- `styles.css` — design system and layout
- `app.js` — state, rendering and interactions
