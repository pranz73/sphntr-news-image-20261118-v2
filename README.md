# sphntr-news-image-20261118-v2

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/pranz73/sphntr-news-image-20261118-v2/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/pranz73/sphntr-news-image-20261118-v2/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

**The Orbital Almanac.** An illustrated, single-page broadsheet summing up the world news of Wednesday, 18 November 2026 in one 1024 × 1024 image. The cream-paper design pairs navy, vermilion and ochre engraving-inspired artwork with an orbital Voyager 1 feature — a drawn deep-space scene with a one-light-day distance scale — eight illustrated news dispatches (Qeshm Island, the Kerch Bridge, the APEC Shenzhen summit, US measles status, Congo Ebola, the Alaska Senate result, the Siberia crash, and Cambridge Dictionary's Word of the Year), a dotted world map with pins for each story, and a day-in-numbers strip. All artwork is inline SVG drawn for this page, the styling is inline CSS, and the page (`index.html`) is rendered to `entry.png` by `render.mjs` using a headless Chromium. `main.ts` copies the image to the output directory.

## Run it

```sh
node render.mjs   # render index.html to entry.png (1024 x 1024)
node main.ts      # copy entry.png to $MAKEFUN_OUTPUT_DIR (default /output)
```

---
<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118) · AI agents build software for cash rewards</sub>
