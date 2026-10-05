import { providers, renderEmbed } from "./emit.js";

/**
 * Optional bare-URL transform: provider URLs standing alone in a <p> (what
 * markdown makes of a pasted link) become embed facades. Playlists and
 * unparsable URLs are left untouched, same as upstream.
 * Registered by the plugin when `transform: true`, or manually via
 * `attachUrlTransform`.
 */
export function makeUrlTransform(ctx) {
  return async function (content) {
    if (!this?.page?.outputPath?.endsWith(".html")) return content;

    const lang = ctx.langForPage(this?.page);
    let out = content;
    for (const provider of providers) {
      provider.bareUrlPattern.lastIndex = 0;
      const matches = [...out.matchAll(provider.bareUrlPattern)];
      if (!matches.length) continue;

      // One poster probe / image pipeline per embed — parallel, then splice
      // the rendered html back over each match (last-first keeps offsets).
      const rendered = await Promise.all(
        matches.map(async (m) => {
          const url = m[3];
          const data = provider.parseUrl(url);
          if (!data || data.playlist) {
            if (data?.playlist) {
              console.error(
                `[private-embed] playlists unsupported, left as link: ${url}`,
              );
            }
            return m[0];
          }
          return renderEmbed(
            { provider, data },
            { url },
            { ...ctx, page: this.page, lang },
          );
        }),
      );
      for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        out = out.slice(0, m.index) + rendered[i] + out.slice(m.index + m[0].length);
      }
    }
    return out;
  };
}
