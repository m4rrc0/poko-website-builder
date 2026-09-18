# poko - A Free Website Builder for the People

> _Own your corner of the web, freely and beautifully_

poko is not just another website builder—it's your path to digital independence. Create stunning, high-performance websites with no recurring costs, technical headaches, or corporate gatekeepers.

## 🌱 Built for the People & the Planet

In a world of bloated, subscription-based platforms, poko stands apart:

- **Truly Free** — Host your site for zero cost on modern static hosting platforms
- **Earth-Friendly** — Lightweight, efficient code and infrastructure that consumes minimal resources
- **Future-Proof** — No constant updates or maintenance required
- **Own Your Data** — Your content stays in readable, portable files you control
- **Accessibility-First** — Beautiful sites that everyone can use, by default
- **SEO Optimized** — Beyond basic metadata, a structured data approach for maximum optimization

## 💡 Why poko?

"_The web was meant to be open, accessible, and empowering. poko brings that vision back._"

While other platforms lock you into expensive subscriptions and proprietary systems, we wanted to offer a liberating alternative, that is approachable for anyone, both financially and technically.

Our ultimate hope is that poko becomes:

- Your main social profile
- A network of shared knowledge
- A display of your creativity
- An automation tool to make your life easier
- ... and so much more ...

## 🚀 Get Started

Ready to build your digital home? Join our growing community of independent web creators!

- 📖 [User Guide](#user-guide-draft)
- 📚 [Documentation](#) (coming soon!)
- 👀 [See Examples](#) (coming soon!)
- 🤝 [Contribute](#contributing) to this open source project

## Licensing

This project is available under a multi-license structure:

- **Personal Use**: Free for individual, non-commercial use
- **Commercial**: Paid license for organizations, with various tiers based on size/revenue
- **Reseller**: For web agencies and freelancers implementing the software for clients

Copyright © 2025-Present Marc Coët - <m4rr.co>  
All licensing rights exclusively assigned to mookaï ASBL.

For full license details, see the [LICENSE](./LICENSE) file and the complete license texts in the [LICENSES](./LICENSES) directory.

For licensing inquiries: legal-a4g6@mookai.be

## Using poko as a package

poko is published as an npm package containing the whole engine. A website only
needs a `package.json` (with `"type": "module"`, since the configuration below is
ESM), an `eleventy.config.js` and a `_content/` directory — see
[`template/`](./template) for a working example.

```sh
npm install poko-website-builder   # or: bun add poko-website-builder
```

```js
// eleventy.config.js
export { default, config } from "poko-website-builder/eleventy";
```

```sh
npx poko build   # write the site to dist/ (bun: bunx poko build)
npx poko dev     # build, watch and serve   (bun: bunx poko dev)
```

The CLI runs on Node or Bun: it uses Bun's APIs when running under Bun and the
Node equivalents otherwise.

In this repository, the engine's own content lives next to it and is built with
`npm run build:content` / `npm run dev:content` (and `:demo` for the demo site).
Those directories are never published in the package.

## User Guide (draft)

> ⚠️ Warning: This guide needs to be updated since the project is being reworked.

### Requirements

- A Github account
- Optional: A static hosting provider account (Cloudflare Pages, Netlify, Vercel, ...)

### Installation

1. [Fork this repository](#forking-the-repository-on-github)
2. [Deploy to your static hosting provider](#deploying-to-your-static-hosting-provider)
3. [Create a Github App](#creating-the-github-app)
4. [Configure environment variables](#configure-environment-variables)

#### Forking the repository on Github

1. Go to https://github.com/m4rrc0/poko-capsule-website
2. Click on "Fork" (in the top right corner)

#### Deploying to your static hosting provider

This step depends on the static hosting provider you choose but generally involves:

- Creating an account
- Creating a new project connected to the forked repository you just created
- Edit your environment variables and project configuration

##### Github Pages

This repo is configured to deploy to Github Pages.  
All you have to do is:

1. activate Github Pages in your repo.
1. Go to your repo `settings` > `Pages`
1. In the `Source` section, choose `Github Actions`.
1. Set the `BASE_URL` environment variable to your repo url.
1. Go to your repo `settings` > `Secrets and variables` > `Actions`
1. Click on the `Variables` tab
1. Click on `New repository variable`
1. Name it `BASE_URL`
1. Set the value to your repo url.

#### Creating the Github App

1. Go to https://github.com/settings/apps
2. Click on "New GitHub App" (in the top right corner)
3. Fill in the form according to the [Github app creation form](./docs/github-app-creation.md)

#### Configure environment variables

Environment variables are values specific to your project that allows you to tie this source code to your specific project instance and to the services you use.

The environment variables are set in the provider's dashboard.  
If you want to see the full list of possible environment variables, have a look at the `.env.template` file.  
But the main variable you care about are the following:

- [] Update variables when the project has been reworked

### A note about working locally

Advanced users might want to work on their project locally. It can have many advantages but is not recommended for non-developers.

Here are a few things you need to know when working locally.

- [] ... Need to be updated
-
- You need a `.env` file. Copy the `.env.template` file and fill in the variables.

## Roadmap and Maybes

- [ ]

## Ressources

- [ ]

## 💸 Money talk: disclosure and commitment

While poko is [open source](https://itsfoss.com/what-is-foss/) and free for personal use, its use is currently subject to a one-time fee for commercial or non-personal projects.

The open source movement is awesome and an example for so many disciplines and industries. We want to be part of it!  
At the same time, there is a tricky balance to be found between simply giving away the most precious thing we have (our time) for what we believe in and making a project viable on the long run. Many open source maintainers still struggle to find the time and ressources to work on their projects, as awesome as they are.

We hope that, with time, we will find that perfect balance. In the meantime, here are a few principles and commitments we try to work by:

- Be transparent about our financial situation and commitments
- Follow our mission and values above profit
- Trust our community to support the project in the best way they can
- Transfer part of our profit to the main open source projects we rely on

## Contributing

poko is an open source project that thrives on community involvement. We welcome contributions of all kinds, from all people!

poko is a project that is supported by the mookaï ASBL, a non-profit organization.

### Ways to Contribute

- **Code**: Fix bugs, add features, or improve performance
- **Documentation**: Help improve guides, clarify concepts, or fix typos
- **Design**: Create themes, improve UI/UX, or create visual assets
- **Testing**: Try poko in different environments and report issues
- **Ideas**: Suggest features or improvements
- **Spread the word**: Tell others about poko!

### Getting Started

1. **Fork the repository** and clone it locally
2. **Create a branch** for your contribution
3. **Make your changes** and test them thoroughly
4. **Commit your changes** with clear, descriptive messages
5. **Push your changes** to your fork
6. **Submit a pull request** describing your changes

### Development Guidelines

- Focus on eco-friendly, accessible, and performant code
- Maintain backward compatibility where possible
- Add tests for new features when applicable
- Follow the existing code style and formatting
- Keep dependencies to a minimum

### Community

Join our growing community of independent web creators! Connect with us through:

- [GitHub Discussions](#) (coming soon)
- [Discord](#) (coming soon)

We value kindness, inclusivity, and constructive collaboration. Let's build a better web together!
