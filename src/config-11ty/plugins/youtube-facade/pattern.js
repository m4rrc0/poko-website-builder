/**
 * Regex for detecting bare YouTube URLs wrapped in a <p> by the Markdown
 * renderer — adapted from eleventy-plugin-youtube-embed's lib/pattern.js
 * (MIT, gfscott/eleventy-plugin-youtube-embed) with two additions:
 *  - `shorts/` and `live/` URL forms
 *  - group order notes kept for `embed.js`'s destructure
 *
 * Capture groups:
 *  1. Arbitrary whitespace
 *  2. Arbitrary whitespace
 *  3. The YouTube URL, without protocol
 *  4. The YouTube video ID (11 chars)
 *  5. Arbitrary whitespace
 *  6. Arbitrary whitespace
 */
export default /<p>(?=(\s*))\1(?:<a [^>]*?>)??(?=(\s*))\2(?:https?:\/\/)??((?:w{3}\.)??(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|shorts\/|live\/|playlist\?list=)??([A-Za-z0-9-_]{11})(?:[^\s<>]*))(?=(\s*))\5(?:<\/a>)??(?=(\s*))\6<\/p>/g;
