# Hot Plate

A Dining Room party game. Everyone sits round a pixel-art dining table, on
their own phone or laptop, joined by a four-letter code. A category comes up
("Name any NBA player") and a hot plate goes round. When it lands in front of
you, type something in the category and serve it to pass the plate on.

- **Everyone sees everything.** Each player's latest answer sits on their plate.
  The holder's typing shows live in their bubble, and wrong guesses appear
  crossed out for the whole table.
- **The clock is on the table.** A ring of blocks round the plate counts down,
  the holder gets a bar under their seat and the table glows hotter. Each pass
  takes half a second off the next turn, down to 4 seconds.
- **Run out and you're burned:** one heart gone, and a new plate starts.
  Last one with hearts wins.
- **No repeats, rarer is richer:** Bread Basket 10, Side Dish 25, Main Course 50,
  Chef's Secret 100. Enough points buy a heart back.
- **Big answer lists:** 33 categories with 500 to 5,000 real answers each
  (NBA/MLB/NFL players, footballers, clubs, F1, wrestlers, UFC, rappers, singers,
  bands, songs, albums, K-pop, movies, TV, cartoons, anime, actors,
  YouTubers/TikTokers, Marvel, DC, Star Wars, anime and game characters,
  Pokémon, video games, apps, food, dog breeds, cars, fashion brands, cities).
- **Room features:** chat, ready-up, public or private tables (public ones are
  listed on the home screen), and host settings for hearts, turn time, seats,
  heart cap, points per heart and categories.

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
| `server.js` | rooms, the turn clock, answer checking, scoring and chat; serves the site and a WebSocket at `/ws` |
| `public/` | the app: `index.html`, `app.js` (screens, seats, bubbles, clock, chat), `scene.js` (draws the pixel dining room and lays out the seats), `style.css` (colour and font tokens at the top) |
| `data/*.json` | one file per category: `[name, tier, [other accepted spellings]]`, most famous first |
| `scripts/build_data.py` | rebuilds `data/` from Wikidata |
| `scripts/smoke-test.cjs` | three headless phones play a full game (`npm test`, needs Playwright) |

**Answer checking.** Case, accents, spaces and punctuation don't matter, and a
leading "the" is optional. Wikidata's alternative names count ("Shaq", "Wemby",
"Big Papi"). For people and characters, a lone first or last name counts when
only one answer has it ("LeBron", "Haaland"); when several share it ("Curry"),
the player is asked to add a first name instead. Small typos are forgiven (one
slip in 6 to 8 letters, two in longer answers, swapped letters count as one),
but never on single shared names or answers with numbers in them.

**Rarity.** Answers are ranked by how many Wikipedia language editions have an
article about them, a good stand-in for how well known something is. In each
category the top 40 are Bread Basket, the next 160 Side Dish, the next 600 Main
Course, and everything after that is a Chef's Secret.

**The clock.** The first turn on each plate lasts the host's turn time (12s by
default). Each pass takes 0.5s off, never below 4s. The server owns the clock;
phones only draw it.

## Change the answer lists

Categories are defined at the top of `scripts/build_data.py` as a Wikidata
query pattern plus a size limit. To add one, add an entry and run:

```
python3 scripts/build_data.py <id>
```

The server skips any category with fewer than 500 answers (Disney characters is currently one, at 422). A full rebuild takes
about an hour because the Wikidata query service limits how much query time
each user gets per minute.

Data from Wikidata is CC0 (public domain).
