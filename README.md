# Super Opinion Bros

A fullscreen browser micro-game: travel through 20 internet-debate worlds, vote on hot takes, see how the crowd decided, and discover your internet character at the final castle.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Zustand

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Game flow

1. **Title** — arcade intro, start game
2. **World transition** — kingdom intro (600–900ms)
3. **Question** — pick A or B (locked after choice)
4. **Result** — crowd verdict, animated bar & vote count
5. **Final castle** — character archetype from your run

### v1.1 persistence & audio

- **Hard refresh** always returns to the title screen (no auto-resume).
- **CONTINUE** appears when a valid save exists (< 24h old).
- **HUD** (↺ restart, ⌂ quit) on all in-game screens.
- **Audio** in `/public/audio` — toggle top-right, settings in `super-opinion-audio`.

Storage keys:

| Key | Purpose |
|-----|---------|
| `super-opinion-bros-save` | Run progress (`phase`, `currentQuestion`, `answers`, `timestamp`) |
| `super-opinion-bros-settings` | App settings |
| `super-opinion-audio` | `{ music, sfx }` |

Regenerate chiptune SFX: `npm run generate-audio`

## Project structure

```
app/           Next.js routes & global styles
components/    Screens, game shell, UI, decor
data/          Questions & world themes
hooks/         Count-up & transition timing
lib/           Types, scoring, storage
store/         Zustand game state
public/        Static assets
```
