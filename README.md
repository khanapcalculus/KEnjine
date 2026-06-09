# KEnjine

A modern, real-time collaborative **whiteboard** for tutors, trainers, doctors, business teams — anyone who needs to draw and think together in the browser. Built with React + Konva and synced live with [Liveblocks](https://liveblocks.io). Deploys as a static site to GitHub Pages.

**Live:** https://khanapcalculus.github.io/KEnjine/

## Features

**Drawing & shapes**
- 🖊️ Pen, highlighter, line, arrow, rectangle, ellipse, triangle, diamond, star, text, sticky notes, eraser
- 🎨 Expandable color palette (70+ colors, custom hex, recent), stroke width, **stroke style** (solid / dashed / dotted), opacity, fill — all in a contextual style panel
- 👆 Select / move / resize / rotate, with **alignment guides** and snapping

**Diagrams & presenting**
- 🧠 **Mind maps**, 🟦 **SWOT analysis**, 🐟 **Fishbone (Ishikawa)** one-click templates
- 🔗 **Smart connectors** that attach to shapes and **auto-route around objects in between**, re-routing live as you move things
- 🟨 **Frames / slides** + **Presentation mode** (full-screen, slide navigation)
- 🔦 **Laser pointer** (everyone sees it), 👁 **follow-presenter** (click an avatar to follow their view)
- #️⃣ **Grid** (dots / lines) with optional snap-to-grid
- 🌙 **Dark mode**

**Media & collaboration**
- 🖼️ Images, 🎬 **video** (YouTube / Vimeo / MP4), 🔊 **audio** (MP3), and generic **embeds** on an infinite canvas
- 📹 **Live A/V call** built in (Jitsi, free, no signup) joined to the same room
- 🤝 Real-time multi-user editing, live cursors, presence avatars
- 🗂️ Multiple pages, 📤 PNG / PDF export, save / load JSON, undo / redo

### Keyboard shortcuts

`V` select · `H` pan · `P` pen · `L` line · `A` arrow · `R` rectangle · `O` ellipse · `T` text · `S` sticky · `C` connector · `I` image · `E` eraser · `Ctrl/⌘+Z` undo · `Ctrl/⌘+Shift+Z` / `Ctrl+Y` redo · `Delete` remove selection · `Space`-drag to pan · `Ctrl/⌘+scroll` to zoom

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

- Best for small-to-medium rooms; uploaded images are downscaled and stored in the realtime document, which counts toward Liveblocks' free-tier storage. For video/audio, paste a **URL** (YouTube/Vimeo/MP4/MP3) rather than uploading large files.
- The live **A/V call** uses [meet.jit.si](https://meet.jit.si) (free, no signup) joined to a room derived from your board id.
- HTML overlays (video / audio / embeds / call) are **not** captured by PNG / PDF export — those export vector + image content only.
- Smart-connector obstacle avoidance is good for typical layouts; very dense scenes may not route optimally.
- Live freehand strokes are committed when you finish the stroke; everything else syncs continuously.
