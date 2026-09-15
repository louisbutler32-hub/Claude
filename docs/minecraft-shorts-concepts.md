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

## Packaging notes for the batch

- Title formula that the references use: the caption, plus an emoji, plus
  `#shorts`. "Never dig straight down 💀 #shorts".
- Tags shared across the batch: minecraft, minecraft shorts, minecraft
  animation, minecraft meme, minecraft logic, minecraft funny, pebblo.
- Every one ends on the punchline frame with no fade, so the loop cuts back
  into the caption card.
