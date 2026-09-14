# -*- coding: utf-8 -*-
"""Build the v2 Earth script.

Grammar, from docs/format-v2.md: second person, present tense, a figure on
screen things happen to, a payoff inside every section, no ranking spine,
no chapter cards. The spine is spatial — the camera walks outward from the
viewer's feet: floor, lake, hill, basin, continent, sun, outside.
"""
import json

# (scene, gap, text, sfx)
L = []
def s(scene, text, gap=0.28, sfx=None):
    L.append((scene, gap, text, sfx))

# ── 1 · THE FLOOR — directly under your feet ──────────────────────────
s("bedroom", "You are asleep. It is half past eleven at night.", 0.34)
s("bedroom-under", "Under your bed there is carpet, and under the carpet a slab of concrete.")
s("strata-sand", "Under the concrete there is sand.")
s("rain-acid", "Rain picks up carbon dioxide on the way down, which makes it very slightly acidic.")
s("lime-dissolve", "Limestone dissolves in slightly acidic water. Not quickly. But it never stops.", 0.36)
s("strata-lime", "So under the sand there is limestone, and it has been quietly going away for forty thousand years.", 0.4)
s("floor-goes", "Tonight it finishes.", 0.5, [["boom", 0.15]])
s("hole", "The hole that opened under Jeffrey Bush in Seffner, Florida, was about six metres across.")
s("hole-brother", "His brother heard him shout, ran in, and started digging with his hands.")
s("hole-deputy", "A sheriff's deputy pulled the brother back out as the floor kept going.", 0.38)
s("hole-filled", "Jeffrey was never recovered. The house was demolished and the hole was filled with gravel.", 0.5)
s("ground-truth", "There was no crack. No creak. No warning of any kind.")
s("ground-truth-2", "Limestone does not announce itself. It just stops holding.", 0.45)
s("keep-going", "That is the ground. Let's keep you alive and go outside.", 0.5, [["whoosh", 0.1]])

# ── 2 · THE LAKE — the water in front of you ──────────────────────────
s("shore", "You are standing on the shore of a lake in Cameroon. It is a beautiful lake.", 0.34)
s("lake-deep", "It is also two hundred metres deep, and it sits in the throat of a dead volcano.")
s("lake-gas", "Carbon dioxide seeps up from the magma below and dissolves into the cold water at the bottom.")
s("lake-charge", "The weight of the water above holds it there. For years. For decades.", 0.4)
s("lake-shake", "Then something disturbs it. A landslip. A cold night. Nobody is sure which.", 0.42)
s("lake-flip", "The deep water rises a few metres — and the gas comes out of it like a shaken bottle.", 0.45, [["fizz", 0.2]])
s("lake-column", "A column of carbon dioxide a hundred metres high leaves the lake in about twenty seconds.")
s("lake-heavy", "It is heavier than air. So it does not rise and disperse. It pours downhill.", 0.4)
s("lake-villages", "It goes into the valleys at about seventy kilometres an hour, and it fills them.")
s("lake-breath", "You do not smell it. You do not choke. There is simply no oxygen in the breath you just took.", 0.45)
s("lake-toll", "At Lake Nyos in nineteen eighty-six that killed one thousand seven hundred and forty-six people, and every animal for twenty-five kilometres.", 0.5)
s("lake-slept", "Almost nobody woke up.", 0.55)
s("lake-three", "Three lakes on Earth are known to do this. Nyos, Monoun, and Kivu.", 0.34, [["blip", 0.5], ["blip", 1.0], ["blip", 1.5]])
s("lake-kivu", "Kivu holds about a thousand times more gas, and two million people live around it.", 0.45)
s("lake-pipes", "Nyos now has pipes in it, venting the gas on purpose, forever.", 0.5)

# ── 3 · THE HILL — the mountain behind you ────────────────────────────
s("hill", "Turn around. There is a hill behind the town.", 0.36)
s("hill-smoke", "It has been smoking for two weeks and everybody has got used to it.")
s("hill-election", "In Saint-Pierre, Martinique, in nineteen oh two, there was an election coming, and the newspaper said the mountain was nothing to worry about.", 0.42)
s("hill-collapse", "On the eighth of May the side of the mountain gives way.", 0.45, [["rumble", 0.1]])
s("hill-flow", "What comes out is not lava. Lava you can walk away from.")
s("hill-flow-2", "This is rock, ash and gas at around a thousand degrees, moving as one fluid.", 0.4)
s("hill-density", "It behaves like a liquid because it is denser than the air it is shoving out of the way.", 0.36)
s("hill-speed", "It reaches the town in about a minute, at roughly six hundred kilometres an hour.", 0.45)
s("hill-instant", "It does not burn you the way fire burns you. It is far too fast for that.", 0.4)
s("hill-hercul", "At Herculaneum, researchers found skulls where the brain tissue had turned to glass.", 0.45)
s("hill-glass", "That takes a temperature spike of several hundred degrees and then an almost instant cooling.", 0.5)
s("hill-toll", "Saint-Pierre had about twenty-eight thousand people in it. The flow took under a minute.", 0.5)
s("hill-survivor", "Two survived. One of them, Ludger Sylbaris, was in an underground cell with one small grated window.", 0.42)
s("hill-cell", "He had been locked up the night before, after a fight.", 0.48)
s("hill-circus", "He was badly burned through the grate, and he lived. He later toured with a circus.", 0.52)

# ── 4 · THE BASIN — the whole body of water, 2,000 km away ────────────
s("basin", "Now stand by a lake with no volcano anywhere near it. Scotland will do.", 0.36)
s("basin-calm", "It is a still day. Nothing is happening here at all.")
s("basin-lisbon", "Two thousand kilometres south, the seabed off Portugal moves, and Lisbon is destroyed.", 0.42)
s("basin-wave", "The shaking that reaches Scotland is far too gentle for anyone to feel.", 0.4)
s("basin-match", "But it arrives at almost exactly the rate the loch likes to rock at.")
s("basin-resonance", "Every body of water has a rhythm it wants to rock at. A bath has one. A loch has one.", 0.36)
s("basin-push", "Like a hand pushing a swing at the right moment, over and over.", 0.42)
s("basin-slosh", "The whole loch tilts. The water climbs one end and falls away from the other.", 0.45, [["pour", 0.3]])
s("basin-obs", "In seventeen fifty-five, people across Scotland watched calm lochs stand up and start swinging.", 0.4)
s("basin-norway", "After the Japanese earthquake of twenty eleven, Norwegian fjords did the same thing about thirty minutes later.", 0.45)
s("basin-why", "It is called a seiche. It needs no wave, no tsunami, and no earthquake anywhere near you.", 0.4)
s("basin-moor", "Boats were torn off their moorings in water that had felt nothing.", 0.5)

# ── 5 · THE CONTINENT — under the whole landmass ──────────────────────
s("cont", "Go deeper. Not under the house — under the continent.", 0.36)
s("cont-chamber", "A supervolcano is not a mountain. It is a chamber of part-molten rock the size of a county.", 0.4)
s("cont-toba", "Toba, in Sumatra, erupted about seventy-four thousand years ago and left a caldera you can see from orbit.", 0.42)
s("cont-myth", "And here is where you have probably been told something that is not true.", 0.45)
s("cont-bottleneck", "The story goes that Toba nearly wiped out humanity, and that everyone alive descends from a few thousand survivors.", 0.42)
s("cont-genome", "Whole-genome sequencing does not find that crash. And archaeological sites either side of the ash layer show people simply carrying on.", 0.48)
s("cont-real", "The eruption was real and enormous. The near-extinction is not supported.", 0.5)
s("cont-warning", "There is something else about supervolcanoes nobody mentions.", 0.42)
s("cont-months", "Of everything on this list, it is the one that would give you the most warning.", 0.4)
s("cont-swarm", "Filling a chamber that size lifts the ground and sets off months of earthquake swarms. You would see it coming for a very long time.", 0.5)
s("cont-irony", "The one everybody is frightened of is the one you could walk away from.", 0.55)

# ── 6 · THE SUN — 150 million kilometres out ──────────────────────────
s("sun", "Keep going out. Ninety-three million miles out.", 0.36)
s("sun-cme", "The sun throws a billion tonnes of charged particles into space. Sometimes at us.", 0.42)
s("sun-1859", "On the first of September eighteen fifty-nine, Richard Carrington watched a white flare cross a sunspot.", 0.4)
s("sun-aurora", "Seventeen hours later the aurora reached the Caribbean. People in Boston read newspapers by it at one in the morning.", 0.45)
s("sun-telegraph", "Telegraph lines threw sparks. Some operators were shocked. Some paper caught fire.", 0.42)
s("sun-disconnect", "And a few operators found they could disconnect their batteries entirely and keep sending — the aurora was powering the line.", 0.5)
s("sun-1859-grid", "In eighteen fifty-nine there were about a hundred and twenty thousand miles of telegraph wire in the world.", 0.4)
s("sun-now", "Now picture the same storm hitting a planet wired end to end.", 0.45)
s("sun-transformer", "The transformers at risk are the very large ones, and they are built to order.", 0.42)
s("sun-fails", "Water treatment stops. Fuel pumps stop. Payment systems stop. Refrigeration stops.", 0.4)
s("sun-lead", "A replacement can take a year or more to arrive. There is no warehouse full of spares.", 0.48)
s("sun-order", "And every country that needs one is ordering at the same moment.", 0.42)
s("sun-17", "The warning, if we spot the flare, is about seventeen hours. Which sounds generous.", 0.42)
s("sun-what", "Seventeen hours is enough to take a grid offline on purpose. It is not enough to rewire a country.", 0.52)

# ── 7 · OUTSIDE — 1.9 billion light years ─────────────────────────────
s("out", "One more step out. All the way out.", 0.4)
s("out-collapse", "A star far bigger than ours runs out of fuel and collapses.", 0.42)
s("out-beams", "It fires two narrow beams from its poles, and in a few seconds each beam carries more energy than our sun will make in its entire life.", 0.48)
s("out-narrow", "The beams are narrow. That is the only reason this is rare rather than routine.", 0.42)
s("out-odds", "Point one at Earth from close enough, and nothing in the way makes any difference at all.", 0.4)
s("out-2022", "In October twenty twenty-two one of them arrived, from one point nine billion light years away.", 0.4)
s("out-ion", "It was bright enough to disturb the upper atmosphere of this planet. From one point nine billion light years.", 0.48)
s("out-close", "If one happened close, and pointed the right way, it would strip ozone off an entire hemisphere.", 0.45)
s("out-warning", "The warning would be the light itself.", 0.5)
s("out-none", "It travels at the speed of light. So does the information that it is coming.", 0.45)
s("out-none-2", "There is no warning. There is no version of this where there is warning.", 0.55)

# ── CLOSE ─────────────────────────────────────────────────────────────
s("close-1", "The ground under your feet. The lake. The hill. The water. The rock. The star. And the thing outside it all.", 0.45)
s("close-2", "Most of it will never happen to you.", 0.42)
s("close-3", "But it is all happening somewhere, to somebody, roughly on schedule.", 0.5)
s("signoff", "Sleep well.", 0.6)

lines = []
for i, (scene, gap, text, sfx) in enumerate(L):
    e = {"id": f"l{i}", "scene": scene, "gap": gap, "text": text}
    if sfx:
        e["sfx"] = sfx
    lines.append(e)

doc = {"voice": "am_liam", "speed": 0.88, "duration": 480,
       "out": "src/earth2", "lines": lines}
json.dump(doc, open("scripts-vo/earth2.json", "w"), indent=1)

words = sum(len(l["text"].split()) for l in lines)
gaps = sum(l["gap"] for l in lines)
print(f"{len(lines)} lines, {words} words, {gaps:.1f}s of gaps")
for rate in (2.95, 3.02, 3.10):
    print(f"  at {rate} w/s -> speech {words/rate:6.1f}s  + gaps = {words/rate+gaps:6.1f}s  (budget 480)")
