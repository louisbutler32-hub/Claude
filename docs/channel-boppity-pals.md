# Channel package — Boppity Pals

The play-along Shorts (`src/play/`) get their own channel. The two formats
are "play along with the beat!" and "Choose your champion!", with Biscuit
the puppy, Poppy the bunny, Bruno the bear and Mimi the cat. They're a
different audience from Pebblo Pebble's toddler learning videos. They also
live on comments ("who did you pick?"), so mixing them into the Pebblo feed
would hurt both.

## The model: pio the platypus

The two reference clips come from **pio the platypus**: YouTube channel
`UC9WD7bBsWR1r6qwiazpNw3g`, and instagram.com/pio.the.platypus. The brief
is to run this channel the way they run theirs. Here is what they do,
checked 26 Sep 2026:

- The channel name is all lowercase: "pio the platypus".
- The channel description is two lines: `🛍️ pio merch shop 👇` and their
  shop link. That's all.
- Every Short has an empty description and no tags, in the People & Blogs
  category.
- The title is one short line, then five lowercase hashtags (the rules and
  hashtag pool are in `src/play/upload.md`).
- The biggest titles name a character ("Protect Otti from the rain!",
  13M views).

Their name, their platypus and their shop are theirs. We copy the format,
not the brand.

## Name and handle

- **Name:** Boppity Pals. "Bop" is the beat, "pals" is the four friends,
  and it reads out loud the way the videos feel. Set the display name
  lowercase, **boppity pals**, the way pio sets theirs. The wordmark on
  the banner stays capitalised.
- **Handle:** `@BoppityPals`. If it's gone when you get there, try
  `@BoppityPalsTV`, then `@BoppityPalsPlay`.

What was checked, 25 Sep 2026:

| name | taken? |
|---|---|
| Play Pals | yes, `@playpals` |
| Paw Play / Paw Party / The Paw Squad | yes, dozens of them |
| Mochi Pals | yes, several |
| BopBop Pals | yes, plus 15 other "BopBop" kids channels |
| **Boppity Pals** | **no channel by that name in search** |

The exact-handle lookup ran out of free checks before `@BoppityPals` itself
was tested. Confirm it in Studio when you claim it (Customisation → Basic
info → Handle).

## Channel art

Render it all with `npm run play:brand`, which writes to `out/`.

| file | size | what |
|---|---|---|
| `boppity-avatar-800.png` | 800×800 | **Profile picture.** Mimi, cheering, on a warm sunburst. One face is what reads at the 36 px the Shorts feed shows it at. |
| `boppity-avatar-group-800.png` | 800×800 | Alternate: all four pals in a bunch. Nicer big, busier small. |
| `boppity-banner-2560x1440.png` | 2560×1440 | **Banner.** Wordmark, tagline, two pals each side. Ropes and confetti notes fill the edges only desktop and TV show. |
| `boppity-banner-guides.png` | 2560×1440 | The same banner with the crop areas drawn in. Everything that matters is inside the red 1546×423 phone band. |
| `boppity-watermark-150.png` | 150×150, transparent | **Video watermark.** Mimi in a ring. Studio → Customisation → Branding → Video watermark, shown "entire video". |

The art is drawn from the same character code the Shorts use
(`src/play/chars.tsx`), so the channel page and the videos can't drift
apart.

## Description

Paste into Customisation → Basic info → Description. It's two lines,
the same shape as pio's:

```
play along with biscuit, poppy, bruno & mimi 🐶🐰🐻🐱
new short every day 💛
```

Once there's a shop, an Instagram or a second link, swap the second line
for a `👇` line and add the link under Links, the way pio points at their
shop.

## Keywords

Studio → Settings → Channel → Keywords:

```
play along, rhythm game, choose your champion, interactive shorts, cute animation, kawaii, animated shorts, animal race, stomp and clap, pick one, who will win, cute animals
```

## Playlists

Make these two before the first upload, and add each Short to its own:

- **Play Along With the Beat 🥁**: every rhythm Short.
- **Choose Your Champion 🏆**: every race.

On the channel home, set a "Shorts" shelf first, then the two playlists.

## Audience: decide it honestly, then keep everything consistent with it

This is YouTube's rule, not a style choice. Content made for children has
to be marked **made for kids**. That turns off comments and notifications,
and the "who did you pick?" loop goes with them.

The format itself is a general-audience one. Cute interactive "play along"
and "choose your champion" Shorts are made for everyone who scrolls Shorts,
and the upload copy in `src/play/upload.md` is written that way: no
"for toddlers" or "for kids" wording. If that's who this channel is for,
set **No, it's not made for kids** at channel level and on each upload. If
you mean it for young children, set **made for kids** and drop the
comment-prompt lines. Either way, keep the titles, descriptions and tags
consistent with the choice.

## Default upload settings

Studio → Settings → Upload defaults:

- Category **People & Blogs** (pio's), language **English**
- Visibility Public, comments **on** (unless made for kids)
- Allow **Shorts remixing: video and audio**

The last one lets other Shorts reuse our clips, and each reuse links back
here.

## Every upload

- Title, description, tags and thumbnail: `src/<short>/upload.md`.
- **Title:** one short hook plus five lowercase hashtags. No emoji and no
  `#shorts`.
- **Description:** the footer block below and nothing else. pio leaves
  theirs blank.
- Pin a comment that asks the question the Short sets up: "Who did you
  pick? 🐻🐱🐶🐰" on the race, "How many did you hit? 🥁" on the beat.
  Reply to comments for the first month.

Footer block, which is the whole description:

```
🐾 Subscribe to Boppity Pals:
https://www.youtube.com/@BoppityPals
```

## The music

Both Shorts carry the soundtrack of the reference clips they were rebuilt
from. That audio isn't ours (see `src/play/upload.md`), and the beat
clip's song is Queen's "We Will Rock You". On this channel
that matters more than usual, because a claim on the very first uploads
can hold back a new channel. If the references are other creators' Shorts,
use **Remix → Use this sound** from their Short so the sound is credited
and cleared. Otherwise use the licence-free tracks
(`npm run play:audio`).

## First two weeks

The algorithm needs a run of same-shaped videos before it knows who to show
them to, so judge nothing before the tenth Short.

1. **Day 1:** Choose Your Champion (`out/play-race.mp4`). It has the
   strongest hook, and it's the one that asks for comments.
2. **Day 2:** Play Along With the Beat (`out/play-beat.mp4`).
3. **Then one a day**, alternating the two formats:
   - **More races.** Same engine and ropes, a new winner each time (Bruno,
     Biscuit, Poppy), plus new trouble: a banana peel, a windy gust, a
     ladder shortcut, a rope swap. Four winners and a few obstacles give
     a dozen Shorts without repeating one.
   - **More songs.** The stage engine reads every stomp and clap from
     `beat-pattern.json`, so a new song is a new pattern plus its track.
     The cast can also take turns at the mic.

What to watch in Studio → Analytics → Shorts is **"Viewed vs swiped
away"**. Above about 70% viewed, the first two seconds are working.

## Order of operations

1. Create the channel as Boppity Pals, and claim the handle.
2. Paste the description and keywords, and set country and audience.
3. Upload the avatar, banner and watermark from `out/`.
4. Make the two playlists.
5. Post the race Short with `src/play/upload.md`, and pin the comment.
6. Post the beat Short the next day.
7. Send the real channel URL so the footer block, `src/play/upload.md` and
   `CLAUDE.md` can switch from the proposed handle to the real one.
