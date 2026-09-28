# Daily Journal

A React + Vite daily journal that stores its data as a JSON file in a GitHub
repo, synced via the GitHub Contents API.

## Features

- Per-day entries: foods (with calories), exercises (with calories burned),
  totals (in / burned / net)
- Checkboxes: Metamucil, Exercised
- 1–5 ratings: Mood, Stomach, Tired
- Bathroom trip counter, weight, notes
- Changeable daily calorie goal
- 7-day charts: weight + workouts, calories vs. goal, ratings

## Setup

1. Install Node.js 18+.
2. `npm install`
3. `npm run dev`
4. In the app, open **Settings** and enter:
   - A **fine-grained personal access token**
     (GitHub → Settings → Developer settings → Fine-grained tokens) scoped to
     your journal repo with **Contents: Read and write** permission.
   - Repo owner and name.
   - Data file path (default `journal.json`).

The token is stored in the browser's localStorage only. Data syncs when you
click **Save**; **Sync** pulls the latest from GitHub. If GitHub is
unreachable, the app falls back to a local cached copy.

## Deploy (optional)

Since it's a static build, you can host it on GitHub Pages:

```
npm run build
```

then publish the `dist/` folder (e.g. with `gh-pages` or a workflow).
