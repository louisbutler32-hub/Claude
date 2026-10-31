# Posting schedule

`index.html` is the whole app, in one file with no build step. Open it in any
browser, or use the hosted copy:
https://claude.ai/artifact/Ldcn5t2UMBr62tWQwTzaBG

## Views

- **Next 14 days**: a checklist of what goes out each day. Tick a post when
  it's up, or **Move** / **Skip** it.
- **Week grid**: channels down the side and days across the top, for this
  week and next, with a total for each day.
- **Month**: the calendar. Tap a day to open it.
- **Results**: tracks how each video performs (see below).
- **Channels**: every rule, the daily caps, on/off switches, colours and post times.
- **Export to calendar**: a CSV that Google Calendar imports, or .ics text
  for Apple Calendar and Outlook.

## How the planner works

1. **Fixed rules** go down first:
   - One Piece posts every 2 days from Mon 2 Nov 2026.
   - Marvel posts every 2 days from Tue 3 Nov, so it always lands on the
     opposite days to One Piece.
   - GTA posts Mon, Wed, Fri and Sun.
2. **"N a week" channels** come next, one week at a time. For each one the
   planner tries every combination of days and picks the one that keeps
   daily loads lowest and the posts evenly spaced. It also has to respect:
   - the caps (5 posts a day, 3 of them long-form);
   - preferred days;
   - link groups: channels in the same group never share a day.

   Long-forms are placed before shorts.
3. **Extras**, such as the 2nd Kids video, are added only on days that still
   have room. They show as optional.

The same settings always produce the same plan. Moving or skipping one post
doesn't reshuffle any other post.

The default plan is 33 posts a week: about 20 long-forms and 12 shorts, plus
the optional Kids extra. Each day has 4–5 posts and never more than 3
long-forms. Finance is in the list but switched off until 4 Jan 2027.

## Saving

Changes save to the browser right away. On the hosted copy they're also
written into the page itself, so they show up on every device.

## Results tracker

The Results tab tracks views, impressions, CTR, average view duration, %
viewed, stayed-to-watch (Shorts), likes, comments, shares, subscribers, watch
hours and revenue for every video.

### Getting numbers in

- **Import from YouTube Studio.** Go to Analytics › Advanced mode › Content
  › export as CSV. Drop in the .zip, or "Table data.csv" from inside it, and
  pick which channel it's from. Importing again updates the same videos by
  video ID and keeps their tags and notes.
- **Add a video** to type the numbers in by hand.
- **From the schedule:** tick a post in the schedule and it gets an
  **Add results** button, which opens the form with the channel and date
  already filled in.

### How videos are judged

- **"vs usual"** is a video's views divided by the median views for its own
  channel and format. 2.0× means twice as many views as that channel normally
  gets. Comparing within a channel is fairer than comparing across channels.
- **Retention** means average % viewed for long-forms. For Shorts it's
  "stayed to watch" when the export includes it.
- **What's working** flags:
  - the biggest breakout;
  - videos to repackage (they hold viewers but have low CTR);
  - videos whose opening needs work (they get clicks but viewers leave early);
  - the best posting weekday;
  - the best topic tag;
  - how long-forms compare with Shorts.

  Each one appears only once there's enough data for it.
- **Clicks vs watching** is a scatter chart of CTR against % viewed for
  long-forms, split into four quadrants at your own medians.

The YouTube Analytics API doesn't provide impressions or CTR, which is why
the import uses Studio's export.
