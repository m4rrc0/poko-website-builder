---
translationKey: htmlclasses-js
order: 12
lang: en
createdAt: 2026-05-13T07:47:00.000Z
ldType: WebPage
name: htmlClasses.js
docsNav:
  section: advanced
  order: 4
vars: {}
---
## Setup html classes on specific selectors

Can be configured in `_content/_config/htmlClasses.js`. This file exports an object mapping CSS selectors to classes you want to automatically inject into your generated HTML:

```jsx
// _content/_config/htmlClasses.js
export default {
  "html": "scroll-smooth",
  "body": "bg-slate-50 text-gray-900",
  "main h1": "text-4xl font-bold mb-4",
  "article p": "text-lg leading-relaxed mb-4"
};
```

Note: If you change something in the config files, you will have to restart your server (`bun --bun start` ) to apply the modifications.