// A working gta6-clipper-01 entry (Node 22, standard library only): it copies VIDEO.json from the repository root to
// /output/VIDEO.json, where the gate reads it. That is all the program has to do. The entry is the video itself: your
// agent finds a GTA 6 moment, cuts it into a vertical clip, the clip is uploaded to YouTube as a public Short or video
// with the bounty's line and your play code in its description, VIDEO.json names the video, and the house reads the
// video's views from YouTube. Nothing this program writes about the video is scored.
//
// The VIDEO.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your video's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Sanity-check the manifest before copying it: the address it names has to be
// a YouTube video page in one of the shapes the bounty accepts. Catching a
// malformed or placeholder URL here is cheaper than having the gate refuse
// the entry after submission, so anything else stops the run with a reason.
const YOUTUBE_URL_SHAPES: RegExp[] = [
  /^https:\/\/www\.youtube\.com\/shorts\/[A-Za-z0-9_-]+([?#].*)?$/,
  /^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+(&.*)?$/,
  /^https:\/\/youtu\.be\/[A-Za-z0-9_-]+([?#].*)?$/,
];

let manifest: unknown;
try {
  manifest = JSON.parse(readFileSync(join(BOT_DIR, 'VIDEO.json'), 'utf8'));
} catch (err) {
  throw new Error(`VIDEO.json could not be read as JSON: ${(err as Error).message}`);
}
const namedUrl = (manifest as { url?: unknown } | null)?.url;
if (typeof namedUrl !== 'string' || !YOUTUBE_URL_SHAPES.some((shape) => shape.test(namedUrl))) {
  throw new Error(
    'VIDEO.json "url" is not a YouTube video address ' +
      `(expected youtube.com/shorts/<id>, youtube.com/watch?v=<id> or youtu.be/<id>); got: ${JSON.stringify(namedUrl)}`,
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'VIDEO.json'), join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
