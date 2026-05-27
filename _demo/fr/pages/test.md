---
translationKey: test
order: null
lang: fr
createdAt: 2025-07-21T21:32:00.000Z
name: Test
sections:
  - type: sectionRaw
    content: raw section content
  - type: sectionGrid
    header:
      content: '## My Grid Header'
      class: palette--contrast
    items:
      - content: Item 1
      - content: '{% image src="/_images/pexels-ella-wei-10655130.webp" %}'
      - content: Item 3
        class: palette--pop
    footer:
      content: And a footer for good measure
  - type: sectionTwoColumns
    header:
      content: '## Two columns header'
    layoutOptions:
      type: fixedFluid
      fixedSide: fixedLeft
      widthFixed: 10rem
    itemLeft:
      content: LEFT
    itemRight:
      content: RIGHT
  - type: sectionFlow
    header:
      content: '## Flow Section'
    items:
      - content: Flow 1
      - content: Flow 2
  - type: sectionReel
    header:
      content: '## Section Reel'
    items:
      - content: '{% image src="/_images/POKO-logo-RVB-01.jpg" %}'
      - content: '{% image src="/_images/pexels-andrea-devillier-32709984.webp" %}'
    layoutOptions:
      type: reel
      itemWidth: 20rem
      noBar: false
  - type: sectionCollection
    header:
      content: '## Collection'
    collection: articles
  - type: sectionBuilder
    header:
      content: Builder
    areas:
      - type: areaRaw
        content: Raw section content inside builder
        class: trs
      - type: twoColumns
        itemLeft:
          content: LEFT
        itemRight:
          content: RIGHT
        layoutOptions:
          type: fixedFluid
          fixedSide: fixedRight
          widthFixed: 20rem
status: published
eleventyNavigation:
  order: 1
---

# Page Test

{% sections %}{% endsections %}
