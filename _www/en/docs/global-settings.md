---
translationKey: global-settings
order: 1
lang: en
createdAt: 2026-05-13T07:37:00.000Z
ldType: WebPage
name: Global settings
docsNav:
  section: getting-started
  order: 3
vars: {}
---
## Global settings

Configuration is handled via `_content/_data/globalSettings.yaml`:

```yaml
siteName: Repères ASBL
productionUrl: [https://www.reperes.be/](https://www.reperes.be/)
logo: /_images/reperes-asbl-logo-sans-bords-rvb-01.webp
htmlHead: ''
cssHead: ''
languages:
	- code: fr
	removeUrlPrefix: true
	customUrlPrefix:
		prefix: ''
	# Or simply
	# customUrlPrefix: ''
	status: published
	isCmsDefault: false
	isWebsiteDefault: true
collections:
	- articles
```