# Hot Plate

A Dining Room party game for phones. Everyone joins a table with a four-letter
code, then a hot plate goes round. When it lands on you, name something in the
category to pass it on. Answers already given are off the menu, rarer answers
score more, and the plate burns at a random moment. Whoever is holding it loses
a heart. Last one with hearts wins.

- 1 to 12 players per table, each on their own phone. A table of one is solo practice.
- 34 categories, each with 500 to 6,000 real answers (NBA, MLB and NFL players,
  footballers, rappers, songs, movies, TV, anime, Marvel/DC/Disney/Star Wars
  characters, Pokémon, video games, apps, cars, cities and more).
- Rarity scoring: Bread Basket 10, Side Dish 25, Main Course 50, Chef's Secret 100.
- Everyone watches the holder type live. The host picks categories and hearts.

## Run it on your computer

```
cd games/hot-plate
npm install
npm start
```

Open http://localhost:3000. Friends on the same Wi-Fi can join at
`http://<your computer's local IP>:3000`.

## Put it online (free, on Render)

The game is one small Node server, so any host that runs Node and allows
WebSockets works. Render's free plan is the simplest:

1. Sign in at https://render.com with GitHub.
2. **New → Web Service**, pick this repository.
3. Fill in:
   - **Branch**: the branch this folder is on
   - **Root Directory**: `games/hot-plate`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Create. After a minute or two you get a link like `https://hot-plate-xxxx.onrender.com`.
   Send that to friends, open a table, share the code.

On the free plan the server sleeps after 15 minutes with nobody connected, so the
first visit after a break takes about 30 seconds to load. Tables live in memory,
so a restart clears any game in progress.

## How it works

| file | what it does |
|---|---|
| `server.js` | rooms, the hidden fuse, answer checking and scoring; serves the site and a WebSocket at `/ws` |
| `public/` | the phone app (`index.html`, `app.js`, `style.css`); colours and fonts are the tokens at the top of `style.css` |
| `data/*.json` | one file per category: `[name, tier, [other accepted spellings]]`, most famous first |
| `scripts/build_data.py` | rebuilds `data/` from Wikidata |
| `scripts/smoke-test.cjs` | three headless phones play a full game (`npm test`, needs Playwright) |

**Answer checking.** Case, accents, spaces and punctuation don't matter, and a
leading "the" is optional. Wikidata's alternative names count ("King James",
"Shaq"). For people and characters, a lone first or last name counts when only
one answer has it ("LeBron", "Haaland"). Small typos are forgiven (one slip in
5 to 8 letters, two in longer answers, swapped letters count as one), but
never on answers with numbers in them.

**Rarity.** Answers are ranked by how many Wikipedia language editions have an
article about them, a good stand-in for how well known something is. In each
category the top 40 are Bread Basket, the next 160 Side Dish, the next 600 Main
Course, and everything after that is a Chef's Secret.

**The fuse.** Each plate burns 14 to 38 seconds after it comes out, picked at
random and never sent to the phones. Whoever catches the plate always gets at
least 3.5 seconds. The steam and glow only show how long the plate has been
out, not when it will burn.

## Change the answer lists

Categories are defined at the top of `scripts/build_data.py` as a Wikidata
query pattern plus a size limit. To add one, add an entry and run:

```
python3 scripts/build_data.py <id>
```

The server skips any category with fewer than 300 answers. A full rebuild takes
about an hour because the Wikidata query service limits how much query time
each user gets per minute.

Data from Wikidata is CC0 (public domain).
