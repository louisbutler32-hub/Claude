# Minecraft Shorts — the format, and twelve concepts for Pebblo

Five reference Shorts were supplied (all from one channel, GarrettTheCarrot):
*Bridging in Minecraft*, its *REANIMATED* remake, *Anvils are too expensive
to share*, *POV: Your friend disconnected (he was the host)* and *Buttons
don't make sense*. What follows is what they have in common, measured off
the files, then twelve concepts of our own that fit the same shape but use
our own character.

## What the five have in common

| | measured |
|---|---|
| length | 10.2 s – 17.5 s (four of five under 15 s) |
| canvas | 1080×1920, 30 fps |
| sound | one has dialogue (Anvils); the other four are silent gags over music and game sounds |
| text | a caption band or a POV line on top, or floating labels in Minecraft's own font ("Java Players" / "Bedrock Players") |
| world | rendered Minecraft screenshots or clean flat blocks; the character is a cartoon drawn on top |
| character | one stick figure, expressions doing all the acting; a second one only for dialogue |
| ending | hard stop on the punchline. No outro, no "subscribe", it loops |

Every one of them is **one game-logic joke**, told in pictures:

- **The comparison.** Two labelled versions of the same act, cut against
  each other. Java bridges backwards, terrified; Bedrock strolls forward and
  builds a staircase, a loop, a whole roller-coaster. Label, act, label, act,
  escalate, snap to the loser's face.
- **The absurd recipe.** A crafting screen shown straight, then the reaction.
  One plank makes one button; a chest of planks makes an armful of buttons.
- **The POV.** A caption sets the situation; the world does the joke. The
  host leaves, and the game politely disconnects you mid-mining.
- **The relatable feeling.** Loss, greed, panic. Losing your stuff; anvils
  costing too much to share.

Three rules fall out of that:

1. **Set the premise in the first second.** Caption or label, before anything
   moves. The viewer needs to know the joke's category to enjoy the escalation.
2. **Escalate once, then stop.** Two beats of the same thing, the second
   bigger, then the reaction, then black. Nothing after the laugh.
3. **The face is the whole performance.** The character has no lines. Every
   beat is a face change: confident, worried, betrayed, dead.

## The character

The references use a stick figure — the same round white head and orange
shirt every Minecraft-meme channel uses. Ours is **Pebblo**: a pebble.

- One rounded stone is the whole head and body. A chipped corner top-left,
  a tuft of moss for hair, freckles.
- Proper eyes — white ovals with pupils and eyebrows — so the acting range
  is bigger than dot eyes allow. Lids for "meh", brows for worry and menace.
- Stick limbs with mitten hands and little feet; stubby legs, so the
  silhouette is a rock on legs, not a person.
- Tints for the damage flash (red), dim rooms, torchlight and lava.

It is drawn in `src/minecraft/pebblo.tsx`, takes the same poses and face
names as the stick figure, and `npm run pebblo:sheet` renders every face
and pose on one page. Because it is the channel's own character, the
running joke can be that it is *a rock* in a game about mining rocks.

## Twelve concepts

Each is 10–15 seconds, silent, one caption, one escalation, hard stop.
The first is built (`src/minecraft-dig/`).

### 1. Minecrafters who dig straight down  *(built)*
Caption: "Minecrafters who dig straight down:". Pebblo mines a hole at his
feet, confident; the shaft scrolls past coal, iron, gold; a diamond glints
in the wall — joy. A warm glow from below. The block cracks. Lava. Red
tint, sinking, only the moss tuft left. Respawn on the grass, deadpan, and
he starts digging straight down again.

### 2. Every Minecrafter's first night
Caption: "Everyone's first night in Minecraft:". Sunset. Pebblo admires his
dirt hut with pride. A zombie groan. He seals the door with a block. Two
more groans. He seals the window. Cut to the hut fully encased in dirt, a
tiny gap for one eye, twenty red eyes outside. Dawn: the eyes vanish, the
hut door opens, Pebblo steps out — into a creeper. Stop.

### 3. Villagers when you have one emerald
Caption: "Villagers when they see ONE emerald:". Comparison beats: Pebblo
holds up one emerald, a villager offers one stick (the "Hrmm"). Two
emeralds: half a bread. A chest full of emeralds: a whole enchanted book
slides across, and the villager's arms cross. Snap to Pebblo's face.

### 4. Java players vs Bedrock players: the cauldron
Labels, not a caption. Java: Pebblo pours a bucket into a cauldron, looks at
it, empties it back out, shrugs — it does nothing. Bedrock: Pebblo dyes
armour, brews a potion in it, stores lava in it, takes a bath. Java Pebblo
staring across the frame. (Same format as Bridging, a different mechanic;
the channel's best-performing pattern.)

### 5. Creeper aftermath
Caption: "When the creeper only takes ONE block of your house:". Pebblo's
neat house; a creeper; boom; the house is fine except one block missing
from the wall, at eye level. Pebblo looks through the hole. He places a
block. Steps back. It is the wrong block — cobblestone in an oak wall. He
stares. Stop.

### 6. Enderman staring contest
Caption: "POV: you looked at an Enderman:". Pebblo turns; two purple eyes.
He freezes. Slow zoom on both faces. Pebblo's eyes drift to the side; the
Enderman's follow. Pebblo puts a carved pumpkin on his head and walks off,
casual. The Enderman is still staring at the pumpkin. Stop.

### 7. The chest thief
Caption: "When your friend takes ONE cobblestone from your chest:". Pebblo
opens his chest, counts (numbers tick over the chest: 64, 64, 63). Face
tilts. Cut: a wanted poster of the friend on every wall of the base, a
lava moat, a sign reading "63". Stop on the friend's face.

### 8. Sleeping: 3/4 players
Caption: "Trying to sleep on a server:". Pebblo lies in a bed; a HUD line
"3/4 players sleeping". A tiny figure in the distance mining. Pebblo sits
up. Shouts (speech bubble: "SLEEP"). The figure keeps mining. Cut: Pebblo
standing over the miner's bed with a pickaxe. "4/4 players sleeping".
Stop.

### 9. Minecraft logic: the bucket
Recipe format. Three iron ingots → one bucket. Pebblo scoops the entire
ocean into it. Then a lava lake. Then a cow's milk. Then tries to scoop a
puddle of rain — nothing. He shakes the bucket at the sky. Stop.

### 10. The water bucket MLG
Caption: "Water bucket MLG:". Pebblo falls from a cliff, calm. Pulls out the
bucket at the last second, places it — the water spreads, he lands
gracefully, cool face. Second fall, same cliff, same calm. Bucket comes out
full of milk. Red tint. Stop.

### 11. Digging up your own house
Caption: "When you accidentally hit your own bed:". Pebblo swings at a
zombie in the doorway, misses, breaks the bed. Beat. The zombie stops too.
Both look at the bed. Cut to Pebblo waking up at world spawn, 4,000 blocks
away, the zombie standing next to him with the bed. Stop.

### 12. Slabs don't make sense
Recipe format, in the Buttons shape. Three stone → six slabs. Pebblo stacks
two slabs; they become one block, fine. Puts two slabs in the crafting
grid: nothing. Turns the grid upside down: nothing. Pours a bucket of water
over it: nothing. Cut to Pebblo living in a house made entirely of slabs,
resigned. Stop.

## Second batch — chasing the reference's biggest hit

The channel's runaway hit is the *Java vs Bedrock* comparison. Everything
about that format travels: the labels do the setup without a caption, the
two halves are the same scene so the edit is cheap, and every Minecraft
player has a side to argue for in the comments. So the second batch is
built around comparisons and one-line premises with a built-in argument.

### 13. Java Players vs Bedrock Players: PvP  *(built — `src/minecraft-pvp/`, with Pix)*
Java swings, waits for the attack-cooldown bar, swings; three hits, the
zombie drops, precise. Bedrock has no cooldown: a spam-click blur that
evaporates the zombie, then the cow that wanders in, then the chicken,
then the ground itself, while the sword wears down to a handle. Cut back
to Java, still waiting for the bar, face reading "meh". Stop.
**Why this one:** it is the most-argued difference between the editions,
it is entirely visual, it escalates four times in seven seconds, and it
gives the pixel face its best gag — switching from "focus" to "joy"
mid-blur.

**The character.** After the concept sheet, the direction was "like a
player skin, but ours". Pix is built like one — cube head, block torso,
block limbs — and is nobody's skin in particular: navy hair with a fringe
over one eye, big green two-by-two eyes, freckles, an orange hoodie with
the hood down, grey jeans, red shoes, and a pixel headset. Chibi
proportions, thick outlines, and a pixel face that acts. It is in
`src/minecraft/pix.tsx` and takes the same poses as everything else; the
Steve rig it grew out of stays in `steve.tsx`.

### 14. Java Players vs Bedrock Players: the boat
Java: Volt paddles a boat onto a block of ice and it slides off the edge
of the map. Bedrock: Volt puts a horse in the boat, then a villager, then
a cow, and sails the whole zoo through lava. Java, staring, in the ocean.

### 15. Minecrafters who leave the game while flying
Caption. Volt in creative mode, mid-air over a lava lake, checks the time.
Logs out. Logs back in: survival. One frame of screen-face realisation.
Stop before the splash.

### 16. When you finally find diamonds
Caption. Volt spots blue in the wall; the screen face goes to "love".
Mines it. It is a single diamond. Then the pickaxe breaks. Then a creeper.
Hold on the "off" screen. Stop.

### 17. Every Minecraft server's spawn area
Caption. Volt arrives at spawn: a single sign, "welcome!". Zoom out: a
crater the size of a country, forty half-built dirt towers, one chest with
a single rotten flesh in it, a sign reading "free diamonds → lava". Stop.

### 18. What the villager thinks is happening
Two labels: "You" / "The villager". You: trading a stack of paper for one
emerald, delighted. The villager: watching a robot hand over its life's
savings for a rock, "Hrmm". Escalate: you hand over a hundred paper, get
one book. Villager's face. Stop.

## Third batch

### 19. Java Players vs Bedrock Players: the chunk loads  *(built — `src/minecraft-chunkload/`)*
Java: Pix walks over a hill and the world is simply there. Bedrock: Pix
walks over the hill into nothing, a white void, and stands on one floating
grass block while trees pop into existence one by one around him. He sits
down to wait. A cow loads in mid-air and falls past him. Stop.

### 20. POV: you hear a cave noise
Caption. Pix mining in a quiet tunnel, torch on the wall. Nothing happens.
He keeps mining. Nothing happens. He looks left. He looks right. He places
a block behind him, then one in front, then seals himself in a one-block
box, torch inside, wide eyes. Stop on the eyes. (The whole gag is that
there was never anything there.)

### 21. When you fall in the void with your best gear
Caption. Pix in full enchanted armour looking down over the edge of the End
island. A slip. Falling, calm face, checks his inventory as he falls: the
items scroll past. He waves goodbye to each one. Cut to the respawn screen.
Stop.

### 22. The pillager who saw you place a bed
Two labels: "You" / "The village". You put a bed down in a village and lie
in it. The village: every bell rings, the iron golem turns to look, thirty
villagers converge on your bed and stand round it while you sleep. Stop.

### 23. Wither skeleton when you have milk
Caption: "The Wither effect vs one bucket of milk". Dramatic: the black
hearts, Pix withering, the screen darkens, the boss music beat. He drinks
the milk. Full health. The wither skeleton stands there. Pix shrugs. Stop.

### 24. Every Minecraft house you built at age 9
Caption. A quick montage, each one a single held frame: the dirt cube, the
cobblestone tower with a lava moat, the house that is just a hole in a
hill, the "mansion" that is one huge oak-plank box with glass, the base
inside a mountain with a two-block-tall front door. Last: your current
house. It is the dirt cube. Stop.

### 25. Enchanting table logic
Recipe format. Pix puts a diamond pickaxe on the table: "Efficiency IV, 30
levels". Puts a wooden pickaxe on: "Silk Touch, Unbreaking III, Fortune
III, Mending" for 1 level. He looks at the camera. Stop.

### 26. What the creeper thinks it's doing
Two labels: "You" / "The creeper". You: horror, sprinting away from a
hissing green thing. The creeper: walking up to say hello, arms out for a
hug, hisses because it is nervous, then everything goes white. The
creeper's last frame is a smile. Stop.

### 27. Minecrafters when the pickaxe breaks one block from diamonds
Caption. Pix mining toward blue in the wall, happy, happier. The durability
bar shrinks. One block away: the pickaxe shatters. He punches the stone
with his fist. Two seconds pass. The block does not break. Stop on the fist.

### 28. Every multiplayer server chat
Caption. Pix at spawn. Chat messages appear one per beat, each sillier than
the last: "anyone have diamonds", "free op", "who griefed my house",
"i did", "im telling", "server restarting in 5 min". Pix logs out. Stop.

### 29. The horse that does not want to be tamed
Caption: "Taming a horse in Minecraft". Pix mounts. Bucked off. Mounts.
Bucked off. Mounts, hearts appear, tamed. He puts a saddle on. The horse
walks into the lake and stands there. Stop.

### 30. Java Players vs Bedrock Players: the crash
Java: Pix in a huge redstone contraption, game stutters, "Not responding",
he waits, it recovers. Bedrock: Pix places one torch. Black screen. Xbox
home menu. He stares at his controller. Stop. (The most-shared Bedrock
complaint there is.)

## The long-form compilation

`src/minecraft-longform/` — one 3:04 long-form video, **built**, joining
the five Shorts above (dig straight down, PvP, creeper, Nether, build
saga) behind a new intro, a chapter card per Short, a "behind the build"
segment, a "vote for episode 6" segment, and an outro. Chaptered, 9
sections, first at 0:00, each ≥10s.

**Worth being clear about:** this does not feed the Shorts feed — YouTube
places Shorts on Shorts-only signals (swipe-through, loop rate), not on
what else a channel has posted. What it does do is give a channel with
only 13-second clips something substantial for a new visitor to watch, and
it's a legitimate thing to have regardless. `src/minecraft-longform/upload.md`
has the full reasoning plus the ready-to-paste chapter list.

Along the way, `src/minecraft-dig/DigShort.tsx` (the dig-straight-down
Short) got moved off the retired Pebblo character onto Steve, so all six
pieces in the compilation now share one consistent character. The
original meme recreation (`src/minecraft/MinecraftShort.tsx`, "Minecrafters
every time they lose their stuff") still uses Pebblo and was left out of
this compilation for that reason — converting it is a fair follow-up if
it should join later.

## Longer, differently-built videos

Everything above this line follows one shape: 10-17 seconds, one setting
(the overworld field), one caption device (a top band or a POV line), one
escalation, hard stop. That shape is a strength for a fast weekly cadence,
but stacked one after another it makes the channel's videos look like
reskins of each other. Two Shorts break that pattern on purpose:

### Built: First time in the Nether — 24s, `src/minecraft-nether/`
Five real scenes instead of two labelled halves, and a setting the channel
has never shown: the Nether gets its own palette (netherrack red-brown, a
black cave ceiling instead of sky, a lava floor, glowstone as the only warm
light), its own mob (a ghast, floating, nine trailing tentacles, fires a
tracked fireball), and its own small corner caption ("DAY 12", "THE
NETHER", "3 SECONDS LATER", "HOME") instead of a caption band or a POV
line. Day 12: finally enough obsidian for a portal. First trip through,
and there is a ghast waiting.

### Built: Building the perfect house (then losing it) — 30s, `src/minecraft-build/`
The longest Short on the channel, and a genuinely different structure: a
documentary build saga across four in-story days rather than a joke with
an escalation. A day-counter chip (white, black border, top-left) is the
on-screen device this time. Day 1 clears the plot, Day 2 raises the walls,
Day 3 the roof goes on and he is proud of it, Night 1 a creeper he never
saw takes half of it, Day 4 he surveys the wreck and picks the pickaxe
back up. Night and day get genuinely different lighting (a star field and
moon over a darkened palette, not just a tinted overlay), which no earlier
Short on the channel has done.

**Why build these two:** a channel that posts the same 13-second format
three times in a row reads as one video with the serial numbers filed
off. A longer, structurally different Short in the mix — different
setting, different pacing, different on-screen text device — gives
viewers who found the channel through the fast ones a reason to stay for
something else, and it tests whether the audience wants short comparison
gags, longer stories, or both before the channel commits harder to either.

### More concepts in this longer shape

- **The Ender Dragon fight, cold open to credits** (35-45s): the crystals,
  the first hit, a near-death dodge, the final blow, the dragon egg — a
  five-beat boss fight instead of a joke, in the End's own black-and-purple
  palette (unbuilt).
- **Villager trading spree, three seasons** (30s): spring (one emerald for
  a stick), summer (a whole farm built around one trade route), autumn
  (the market crashes, villagers won't look at him) — a rise-and-fall
  structure instead of an escalation (unbuilt).
- **The ocean monument raid** (30-40s): an entirely underwater palette
  (blue-green, light shafts, bubbles), guardians instead of overworld mobs,
  a real objective (the sponge room) instead of a gag (unbuilt).

## Packaging notes for the batch

- Title formula that the references use: the caption, plus an emoji, plus
  `#shorts`. "Never dig straight down 💀 #shorts".
- Tags shared across the batch: minecraft, minecraft shorts, minecraft
  animation, minecraft meme, minecraft logic, minecraft funny, pebblo.
- Every one ends on the punchline frame with no fade, so the loop cuts back
  into the caption card.
