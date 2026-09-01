# The Richest Man in History

**Format** vertical short · **Runtime** ~45s · ~125 words · Voice: plain
storybook. Short declarative lines, present tense, one fact each, no
rhetoric. Read it calmly — the facts are doing the work, the delivery
should not compete with them.

**First frame**: West Africa, Mali filled gold, everything else muted.

---

## Script

```
0:00   This man went on holiday and crashed an economy for twelve years.

0:04   This is Mansa Musa.
       He rules Mali, and nobody can count how rich he is.

0:09   In 1324 he decides to walk to Mecca.

0:12   He brings sixty thousand people.
       And camels carrying gold.

0:17   They cross the Sahara.

0:20   In Cairo, he starts giving the gold away.
       To the poor. To officials. To anyone who asks.
       He pays whatever price he's told.

0:28   Soon there is so much gold in Cairo that gold stops being worth much.
       Prices collapse.

0:34   It takes twelve years to recover.

0:37   On the way home he tries to buy the gold back.
       It doesn't work.

0:41   Fifty years later a mapmaker in Spain, who has never been to Africa,
       draws him on a map of the world.
       Sitting on a throne. Holding a lump of gold.

0:48   That's how far the story travelled.
```

## Map

| Time | Map |
| --- | --- |
| 0:00 | West Africa. Mali fills gold, everything else muted |
| 0:04 | Push to Niani. Mali's arms pinned on the capital |
| 0:09 | Mecca marker drops on the far right of frame — the distance is the joke |
| 0:12 | The caravan arrow starts, thick and gold |
| 0:17 | Arrow crosses the Sahara: Timbuktu, Taghaza, then east |
| 0:20 | Cairo marker. Gold coin props stack on it, one per line |
| 0:28 | The gold props keep stacking past the point of looking good — that IS the beat |
| 0:34 | Hold on Cairo. Props sit there, unmoving |
| 0:37 | A thin arrow back west. It fades before it arrives |
| 0:41 | Pull out to the whole known world; the Catalan Atlas panel rises over Mali |
| 0:48 | Hold |

The closing image is the payoff and it is free: the **Catalan Atlas of 1375**
draws Mansa Musa enthroned holding a gold nugget — a Spanish mapmaker put a
West African king on the map of the world. It is 14th century, so it is
public domain. Drop the panel in `public/assets/props/catalan-atlas.jpg` and
pin it:

```tsx
<Portrait at={[-8, 13]} src="assets/props/catalan-atlas.jpg" in={41} size={340} shape="badge" />
```

A map video that ends on a real medieval map is the whole channel's thesis
in one shot.

---

## Facts, and how far they can be pushed

- **"Nobody can count how rich he is"** is the honest phrasing. The
  $400-billion figures circulating online are invented — there is no
  workable way to price a 14th-century gold economy. Do not quote a number.
- **1324** hajj: solid.
- **Sixty thousand people, camels of gold**: these come from medieval Arabic
  accounts (al-Umari, and later Ibn Khaldun), not from records. They are the
  standard figures everyone uses; say "he brings sixty thousand people", not
  "records show".
- **The Cairo gold collapse and the twelve years** comes from al-Umari, who
  visited Cairo about twelve years afterwards and wrote that people still
  talked about it and the price had not recovered. That is a real source,
  and it is one man's account — which is exactly how to say it if you ever
  make a longer version.
- **Buying the gold back on the return leg** is reported in the same
  tradition. Keep it as "he tries", not "he did".
- **The Catalan Atlas, 1375**: solid, and public domain.
