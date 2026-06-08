# KEnjine

A modern, real-time collaborative **whiteboard** for tutors, trainers, doctors, business teams — anyone who needs to draw and think together in the browser. Built with React + Konva and synced live with [Liveblocks](https://liveblocks.io). Deploys as a static site to GitHub Pages.

**Live:** https://khanapcalculus.github.io/KEnjine/

## Features

- 🖊️ **Drawing tools** — pen, line, arrow, rectangle, ellipse, text, sticky notes, eraser
- 🎨 Colors, stroke widths, and shape fill
- 👆 **Select / move / resize / rotate** any object, delete with `Delete`
- 🤝 **Real-time collaboration** — share a link, draw together instantly
- 👀 **Live presence** — see other people's cursors, names, and avatars
- 🗂️ **Multiple pages** per board (add / rename / delete)
- 🖼️ **Images** — upload images (auto-downscaled) onto an **infinite canvas**
- 🔍 **Infinite pan & zoom** — scroll to pan, `Ctrl/⌘ + scroll` to zoom, `Space`-drag or the Hand tool to pan
- 📤 **Export** to PNG / PDF, and **save / load** the whole board as JSON
- ↩️ Undo / redo, keyboard shortcuts

### Keyboard shortcuts

`V` select · `H` pan · `P` pen · `L` line · `A` arrow · `R` rectangle · `O` ellipse · `T` text · `S` sticky · `I` image · `E` eraser · `Ctrl/⌘+Z` undo · `Ctrl/⌘+Shift+Z` / `Ctrl+Y` redo · `Delete` remove selection

## Setup (one-time): get a Liveblocks key

Real-time sync uses Liveblocks' free tier. GitHub Pages is static-only, so the app uses a **public** key (safe to ship in the browser).

1. Create a free account at **https://liveblocks.io**
2. Create a project and copy its **public** API key (starts with `pk_`)

### Run locally

```bash
npm install
cp .env.example .env        # then put your pk_ key in .env
npm run dev
```

Open the printed URL. Share the same URL (it contains `#room=...`) with others to collaborate.

### Deploy to GitHub Pages

1. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_LIVEBLOCKS_PUBLIC_KEY`
   - Value: your `pk_...` key
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. Push to `main`. The included workflow (`.github/workflows/deploy.yml`) builds and deploys automatically.
4. Visit `https://<your-username>.github.io/KEnjine/`

> The site is served under `/KEnjine/` (set via `base` in `vite.config.ts`). If you rename the repo, update that value.

## Tech

React 18 · TypeScript · Vite · Konva / react-konva · Liveblocks · jsPDF

## Notes & limits

- Best for small-to-medium rooms; uploaded images are downscaled and stored in the realtime document, which counts toward Liveblocks' free-tier storage. For heavy image use, host images externally and store URLs instead.
- Live freehand strokes are committed when you finish the stroke; everything else (shapes, moves, text, images) syncs continuously.
