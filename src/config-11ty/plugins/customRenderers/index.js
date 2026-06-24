export function transformLink(link) {
  const self = this;
  const localeUrlFilter = this.env.filters.locale_url;

  // link.page is used when we retrieved page data from a relation and looping through transformLink again
  // link.type == external is for manually entered external links
  // link.type == collections allows us to link to user activated collections
  // link.type == tags allows us to link to user defined tags
  // Everything else is for internal links through collection relations (E.g. pages, articles, people, ...)

  const lang = link.lang || link.page?.lang || this.page.lang;

  if (link.page) {
    // Skip the other ifs
  } else if (link.type === "collections" || link.type === "tags") {
    // TODO: Implement collections and tags
    const collectionEntries = (link.collectionNames || [])
      .map(function (collectionName) {
        return self.ctx.collections?.[collectionName]
          ?.filter((p) => {
            return p.page.lang === lang;
          })
          .map((p) => {
            const templateTranslation = p?.data?.templateTranslations?.find(
              (t) => {
                return t.lang === lang;
              },
            );
            // TODO: Need to populate this with more data (e.g. sort)
            return transformLink.call(self, {
              type: link.type,
              linkData: link,
              ...templateTranslation,
              // page: {
              //   ...templateTranslation.page,
              //   ...templateTranslation,
              // },
            });
          });
      })
      .flat()
      .filter(Boolean);

    return collectionEntries;
  } else if (link.type !== "external") {
    const collectionName = link.type;
    const pages = link.slugs.map(function (slug) {
      // return localeUrlFilter.call(
      //   this,
      //   slug,
      //   lang,
      //   "all", // all the 'templateTranslations' fields of that page
      //   collectionName
      // );
      const pageMatch = localeUrlFilter.call(
        self,
        slug,
        lang,
        "all", // all the 'templateTranslations' fields of that page
        collectionName,
      );
      return transformLink.call(self, {
        type: link.type,
        linkData: link,
        page: pageMatch,
      });
    });

    return pages;
  }

  const rel = [
    link.type === "external" ? "external" : "",
    (link?.rel?.length && link.rel.join(" ")) ||
      (link.type === "external" && link?.target === "_blank" ? "noopener" : ""),
  ]
    .filter(Boolean)
    .join(" ");

  const l = {
    ...link,
    href: link.page?.url || link?.href,
    text: link?.text || link.page?.title || link?.href,
    target: link?.target,
    rel,
    hreflang:
      link?.hreflang ||
      (link.page?.lang !== this.page.lang ? link.page?.lang : undefined),
  };
  l.htmlAttrs = {
    href: l.href,
    target: l.target,
    rel: l.rel,
    hreflang: l.hreflang,
  };
  for (const [key, value] of Object.entries(l.htmlAttrs)) {
    if (!value) {
      delete l.htmlAttrs[key];
    }
  }
  l.htmlAttrsStr = Object.entries(l.htmlAttrs)
    .map(([key, value]) => {
      return `${key}="${value}"`;
    })
    .join(" ");

  l.html = `<a ${l.htmlAttrsStr}>${l.text}</a>`;

  return l;
}

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const renderContentFilterFn = eleventyConfig.universal.filters.renderContent;
  const partialShortcodeFn = eleventyConfig.universal.shortcodes.partial;

  // const renderTemplateTagFn = eleventyConfig.nunjucks.tags.renderTemplate;
  // const renderFileShortcodeFn =
  //   eleventyConfig.universal.shortcodes.renderFile;

  // RENDER MARKDOWN
  async function renderMd(mdContent, data) {
    const safeFilter = this.env.filters.safe;

    let html = mdContent;

    if (mdContent) {
      html = await renderContentFilterFn.call(this, mdContent, "njk,md", {
        ...this.ctx,
        ...data,
      });
    }

    return safeFilter(html);
  }

  // RENDER LINKS
  async function renderLinks({ linksData, itemLayout, wrapperLayout }) {
    // const safeFilter = this.env.filters.safe;

    const linksTransformed = linksData
      .map((link) => transformLink.call(this, link))
      .flat();

    // Avoid duplicates
    const uniqueLinks = linksTransformed.filter((link, index) => {
      return linksTransformed.findIndex((l) => l.href === link.href) === index;
    });

    // TODO: Order and limit results

    // Apply layout
    const wrapperMarkdownLayout =
      wrapperLayout?.type === "markdown" ? wrapperLayout.value : "";
    const wrapperPartialFileName =
      wrapperLayout?.type === "partial" && wrapperLayout.slug
        ? wrapperLayout.slug + ".md"
        : "";
    const itemMarkdownLayout =
      itemLayout?.type === "markdown" ? itemLayout.value : "";
    const itemPartialFileName =
      itemLayout?.type === "partial" && itemLayout.slug
        ? itemLayout.slug + ".md"
        : "";
    // TODO: Do we want to join strings before processing? Otherwise each string is always wrapped in a <p> because alone when rendered
    let strings = (uniqueLinks || []).map(({ html }) => html);
    let htmlLinks = strings.join("");

    if (itemMarkdownLayout) {
      strings = await Promise.all(
        uniqueLinks.map(async (l) => {
          const linkStr = await renderContentFilterFn.call(
            this,
            itemMarkdownLayout,
            "njk,md",
            { ...this.ctx, link: l },
          );

          return linkStr;
        }),
      );

      htmlLinks = strings.join("");
    } else if (itemPartialFileName) {
      strings = await Promise.all(
        uniqueLinks.map(async (l) => {
          const linkStr = await partialShortcodeFn
            .call(this, itemPartialFileName, { link: l })
            .catch((e) => {
              console.error(e);
              return "";
            });

          return linkStr;
        }),
      );
      htmlLinks = strings.join("");
    }

    if (wrapperMarkdownLayout) {
      const rendered = await renderContentFilterFn.call(
        this,
        wrapperMarkdownLayout,
        "njk,md",
        { ...this.ctx, links: uniqueLinks, htmlLinks },
      );

      return rendered;
    } else if (wrapperPartialFileName) {
      const rendered = await partialShortcodeFn
        .call(this, wrapperPartialFileName, {
          links: uniqueLinks,
          htmlLinks,
        })
        .catch((e) => {
          console.error(e);
          return "";
        });

      return rendered;
    }

    // return safeFilter(strings.join(""));
    return htmlLinks;
  }

  eleventyConfig.addFilter("md", renderMd);

  await eleventyConfig.addAsyncShortcode("links", renderLinks);
}
