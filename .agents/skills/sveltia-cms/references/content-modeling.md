# Content Modeling

Planning collections and fields for a site, with complete example configurations for common site types: blogs, documentation, portfolios, corporate, personal, event, music, recipe, education and nonprofit sites. The examples are shown in YAML only; see `config.md` for the TOML, JSON and JavaScript equivalents.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Content Modeling Guide

Sveltia CMS is a general-purpose content management system that can be adapted to various use cases. How to structure your collections and design your content models depends on your project requirements. Here are some guidelines and examples to help you get started.

### Planning Your Content Model

Content modeling is primarily a non-technical task that requires an understanding of your content and how it will be used. It’s recommended to involve content editors and stakeholders in the planning process to ensure the content model meets everyone’s needs. If you are building a site for a client, collaborate with them to understand their content requirements and workflows.

### Understanding Content Models

A content model defines the structure and organization of your content within Sveltia CMS. It consists of [collections](https://sveltiacms.app/en/docs/collections), which are groups of related content items, and [fields](https://sveltiacms.app/en/docs/fields), which define the properties of each content item.

When designing your content model, consider the following:

- **Content types**: Identify the different types of content you need to manage (e.g. blog posts, products, pages).
- **Collections**: Decide whether to use [entry collections](https://sveltiacms.app/en/docs/collections/entries) (for multiple similar items) or [file collections](https://sveltiacms.app/en/docs/collections/files) (for individual files) based on your content types.
- **Fields**: Define the fields required for each content type, including their data types and validation rules.
- **Relationships**: Determine if there are any relationships between different content types that need to be represented (e.g. authors for blog posts, categories for products).

### Tips for Designing Content Models

Some best practices for designing effective content models in Sveltia CMS include:

- **Plan ahead**: Take the time to think through your content structure before creating collections and fields. This will help avoid unnecessary changes later.
- **Keep it simple**: Start with a basic structure and expand as needed. Avoid overcomplicating your content model.
- **Use meaningful names**: Choose clear and descriptive names for collections and fields to make them easier to understand.
- **Leverage field types**: Utilize the [various field types](https://sveltiacms.app/en/docs/fields#field-types) available in Sveltia CMS to capture different kinds of data effectively.
- **Plan for scalability**: Consider how your content model may need to evolve over time and design it to accommodate future changes.
- **Test and iterate**: Regularly review and refine your content model based on feedback from content editors and users.

### Using Relations Between Collections

Sveltia CMS supports [Relation fields](https://sveltiacms.app/en/docs/fields/relation) that allow you to create relationships between different collections. This is useful for linking related content items, such as associating blog posts with authors or products with categories.

When using relations, consider the following:

- **Cardinality**: Decide whether the relationship is one-to-one, one-to-many or many-to-many, and configure the Relation field accordingly.
- **Performance**: Be mindful of the potential performance implications of complex relationships, especially with large datasets.
- **User experience**: Ensure that the relationship is intuitive for content editors, providing clear labels and options in the CMS interface.

### Examples of Content Models

Here are some common content models for different types of websites and applications, along with suggestions on how to structure your collections and fields.

#### Blog or News Site

- **Posts**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for blog posts or news articles, organized by date and linked to tags and authors via Relation fields. A status field keeps unfinished posts off the site. For a review process with pull requests, consider the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) instead.
- **Tags**: entry collection for managing available tags, linked to posts via a Relation field. For more details, see our [how-to](https://sveltiacms.app/en/docs/how-tos#using-entry-tags-for-categorization) on this topic.
- **Authors**: entry collection for managing the list of authors, linked to posts via a Relation field.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like About or Contact.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: posts
    label: Posts
    label_singular: Post
    folder: /content/posts
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    summary: '{{title}} ({{date}})'
    sortable_fields:
      fields: [date, title]
      default: { field: date, direction: descending }
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, default: '{{now}}' }
      - name: author
        label: Author
        widget: relation
        collection: authors
        display_fields: [name]
        required: false
      - name: tags
        label: Tags
        widget: relation
        collection: tags
        multiple: true
        required: false
      - name: status
        label: Status
        widget: select
        options: [draft, published, archived]
        default: draft
      - { name: featured_image, label: Featured Image, widget: image, required: false }
      - { name: excerpt, label: Excerpt, widget: text, required: false }
      - { name: body, label: Body, widget: richtext }
  - name: tags
    label: Tags
    label_singular: Tag
    folder: /content/tags
    fields:
      - { name: title, label: Title }
  - name: authors
    label: Authors
    label_singular: Author
    folder: /content/authors
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: email, label: Email, required: false }
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact Page
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Documentation Site

- **Documents**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for documentation pages, linked to versions and categories via Relation fields.
- **Versions**: entry collection for managing available versions (e.g. v1.0, v2.0), linked to documentation pages via a Relation field.
- **Categories**: entry collection for organizing documentation by category, linked to documents via a Relation field.
- **Tutorials**: entry collection for step-by-step tutorials and guides.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like Getting Started or FAQ.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: documents
    label: Documents
    label_singular: Document
    folder: /content/docs
    sortable_fields:
      fields: [sidebar_position, title]
      default: { field: sidebar_position, direction: ascending }
    fields:
      - { name: title, label: Title }
      - { name: version, label: Version, widget: relation, collection: versions }
      - name: category
        label: Category
        widget: relation
        collection: categories
        display_fields: [name]
      - { name: sidebar_position, label: Sidebar Position, widget: number, required: false }
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: search_keywords, label: Search Keywords, required: false }
      - { name: body, label: Body, widget: richtext }
  - name: versions
    label: Versions
    label_singular: Version
    folder: /content/versions
    fields:
      - { name: title, label: Version Number, hint: 'e.g. v1.0' }
  - name: categories
    label: Categories
    label_singular: Category
    folder: /content/categories
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: order, label: Order, widget: number, required: false }
  - name: tutorials
    label: Tutorials
    label_singular: Tutorial
    folder: /content/tutorials
    fields:
      - { name: title, label: Title }
      - name: difficulty
        label: Difficulty
        widget: select
        options: [beginner, intermediate, advanced]
      - name: estimated_time
        label: Estimated Time (minutes)
        widget: number
        required: false
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: content, label: Content, widget: richtext }
  - name: pages
    label: Pages
    files:
      - name: getting_started
        label: Getting Started
        file: /content/pages/getting-started.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: faq
        label: FAQ
        file: /content/pages/faq.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Portfolio Site

- **Portfolio items**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for portfolio items, linked to categories and skills via Relation fields.
- **Categories**: entry collection for managing available categories (e.g. Web Design, Branding, Photography), linked to portfolio items via a Relation field.
- **Skills**: entry collection for managing the list of skills or technologies used (e.g. React, Figma, CSS), linked to portfolio items via a Relation field.
- **Testimonials**: entry collection for client testimonials, linked to portfolio items via a Relation field.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like About Me or Services.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: portfolio
    label: Portfolio Items
    label_singular: Portfolio Item
    folder: /content/portfolio
    sortable_fields:
      fields: [year, title]
      default: { field: year, direction: descending }
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - { name: project_url, label: Project URL, required: false }
      - name: categories
        label: Categories
        widget: relation
        collection: categories
        multiple: true
        required: false
      - name: skills
        label: Skills
        widget: relation
        collection: skills
        multiple: true
        required: false
      - { name: year, label: Year, widget: number, required: false }
      - name: status
        label: Status
        widget: select
        options: [in_progress, completed, archived]
        default: completed
  - name: categories
    label: Categories
    label_singular: Category
    folder: /content/categories
    fields:
      - { name: title, label: Title }
  - name: skills
    label: Skills
    label_singular: Skill
    folder: /content/skills
    fields:
      - { name: title, label: Title }
  - name: testimonials
    label: Testimonials
    label_singular: Testimonial
    folder: /content/testimonials
    identifier_field: client_name
    fields:
      - { name: client_name, label: Client Name }
      - { name: testimonial_text, label: Testimonial, widget: text }
      - { name: company, label: Company, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: rating, label: Rating, widget: select, options: [1, 2, 3, 4, 5], required: false }
      - { name: project, label: Project, widget: relation, collection: portfolio, required: false }
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Me
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: services
        label: Services
        file: /content/pages/services.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Corporate Website

- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like Home, About Us, Services and Contact.
- **Services**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for services offered.
- **Products**: entry collection for products or offerings.
- **Brands**: entry collection for brand information, linked to products via a Relation field.
- **Clients**: entry collection for client logos or profiles, linked to testimonials and case studies via Relation fields.
- **Testimonials**: entry collection for client testimonials, linked to clients via a Relation field.
- **Case studies**: entry collection for case studies, linked to clients via a Relation field.
- **Leadership**: entry collection for team members.
- **Locations**: entry collection for office locations, linked to job openings via a Relation field.
- **Careers**: entry collection for job openings.
- **News**: entry collection for news or press releases.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: pages
    label: Pages
    files:
      - name: home
        label: Home
        file: /content/pages/home.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: about
        label: About Us
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: services
        label: Services
        file: /content/pages/services.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
  - name: services
    label: Services
    label_singular: Service
    folder: /content/services
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: description, label: Description, widget: richtext }
      - { name: icon, label: Icon, widget: image, required: false }
      - { name: price, label: Price, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: products
    label: Products
    label_singular: Product
    folder: /content/products
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: sku, label: SKU }
      - name: brand
        label: Brand
        widget: relation
        collection: brands
        display_fields: [name]
        required: false
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: price, label: Price, widget: number, value_type: float, required: false }
      - { name: image, label: Image, widget: image, required: false }
      - { name: in_stock, label: In Stock, widget: boolean, default: true }
  - name: brands
    label: Brands
    label_singular: Brand
    folder: /content/brands
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: logo, label: Logo, widget: image, required: false }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: website, label: Website, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: clients
    label: Clients
    label_singular: Client
    folder: /content/clients
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: logo, label: Logo, widget: image, required: false }
      - { name: website, label: Website, required: false }
      - { name: contact_person, label: Contact Person, required: false }
  - name: testimonials
    label: Testimonials
    label_singular: Testimonial
    folder: /content/testimonials
    identifier_field: contact_person
    fields:
      - name: client
        label: Client
        widget: relation
        collection: clients
        display_fields: [name]
      - { name: contact_person, label: Contact Person }
      - { name: testimonial_text, label: Testimonial, widget: text }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: rating, label: Rating, widget: select, options: [1, 2, 3, 4, 5], required: false }
  - name: case_studies
    label: Case Studies
    label_singular: Case Study
    folder: /content/case-studies
    fields:
      - { name: title, label: Title }
      - name: client
        label: Client
        widget: relation
        collection: clients
        display_fields: [name]
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - { name: results, label: Results, widget: richtext, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: leadership
    label: Leadership
    label_singular: Team Member
    folder: /content/leadership
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: role, label: Role }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: email, label: Email, required: false }
      - name: social_links
        label: Social Links
        label_singular: Social Link
        widget: keyvalue
        required: false
  - name: locations
    label: Locations
    label_singular: Location
    folder: /content/locations
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: address, label: Address, required: false }
      - { name: city, label: City, required: false }
      - { name: country, label: Country, required: false }
      - { name: phone, label: Phone, required: false }
      - { name: email, label: Email, required: false }
      - { name: map_url, label: Map URL, required: false }
  - name: careers
    label: Careers
    label_singular: Job Opening
    folder: /content/careers
    identifier_field: job_title
    fields:
      - { name: job_title, label: Job Title }
      - { name: description, label: Description, widget: richtext, required: false }
      - name: location
        label: Location
        widget: relation
        collection: locations
        display_fields: [name]
        required: false
      - name: employment_type
        label: Employment Type
        widget: select
        options: [full-time, part-time, contract]
      - { name: application_url, label: Application URL, required: false }
  - name: news
    label: News
    label_singular: News Item
    folder: /content/news
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, default: '{{now}}', required: false }
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: content, label: Content, widget: richtext, required: false }
```

#### Personal Website

- **Posts**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for blog posts. Unlike the blog example above, tags are entered freely in a simple [List](https://sveltiacms.app/en/docs/fields/list) field instead of being managed in a separate collection, which is enough for a small site with a single author.
- **Projects**: entry collection for personal projects or side projects.
- **About**, **Contact** and **Site Settings**: [singletons](https://sveltiacms.app/en/docs/collections/singletons) for one-off pages and site-wide settings like the site title, description and social links. Singletons appear directly in the sidebar, so they are easier to reach than files in a file collection when there are only a few of them.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: posts
    label: Posts
    label_singular: Post
    folder: /content/posts
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    summary: '{{title}} ({{date}})'
    sortable_fields:
      fields: [date, title]
      default: { field: date, direction: descending }
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, default: '{{now}}' }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: excerpt, label: Excerpt, widget: text, required: false }
      - { name: featured_image, label: Featured Image, widget: image, required: false }
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: body, label: Body, widget: richtext }
  - name: projects
    label: Projects
    label_singular: Project
    folder: /content/projects
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - { name: url, label: URL, required: false }
      - { name: technologies, label: Technologies, widget: list, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
singletons:
  - name: about
    label: About
    file: /content/pages/about.md
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
  - name: contact
    label: Contact
    file: /content/pages/contact.md
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
  - name: settings
    label: Site Settings
    file: /data/settings.yaml
    fields:
      - { name: site_title, label: Site Title }
      - { name: description, label: Description, widget: text, required: false }
      - name: social_links
        label: Social Links
        label_singular: Social Link
        widget: keyvalue
        key_label: Service
        value_label: URL
        required: false
```

#### Event Management Site

- **Events**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for events, linked to categories, locations and organizers via Relation fields. Whether an event is upcoming or past is determined by its date, so only cancellation needs to be set manually.
- **Categories**: entry collection for event categories (e.g. Conference, Webinar, Workshop), linked to events via a Relation field.
- **Locations**: entry collection for available venues, linked to events via a Relation field.
- **Organizers**: entry collection for event organizers, linked to events via a Relation field.
- **Speakers**: entry collection for event speakers.
- **Sessions**: entry collection for event sessions, linked to events and speakers via Relation fields. Each session points to its event, rather than each event listing its sessions, so that adding a session doesn’t require editing the event.
- **Sponsors**: entry collection for event sponsors, linked to events via a Relation field.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like Event Guidelines or FAQ.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: events
    label: Events
    label_singular: Event
    folder: /content/events
    identifier_field: name
    summary: '{{name}} ({{date}})'
    sortable_fields:
      fields: [date, name]
      default: { field: date, direction: descending }
    fields:
      - { name: name, label: Name }
      - { name: date, label: Date, widget: datetime }
      - name: category
        label: Category
        widget: relation
        collection: categories
        required: false
      - name: location
        label: Location
        widget: relation
        collection: locations
        display_fields: [name]
        required: false
      - name: organizers
        label: Organizers
        widget: relation
        collection: organizers
        display_fields: [name]
        multiple: true
        required: false
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: registration_url, label: Registration URL, required: false }
      - { name: capacity, label: Capacity, widget: number, required: false }
      - { name: canceled, label: Canceled, widget: boolean, default: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: categories
    label: Categories
    label_singular: Category
    folder: /content/categories
    fields:
      - { name: title, label: Title }
  - name: locations
    label: Locations
    label_singular: Location
    folder: /content/locations
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: address, label: Address, required: false }
      - { name: city, label: City, required: false }
      - { name: capacity, label: Capacity, widget: number, required: false }
      - { name: map_url, label: Map URL, required: false }
  - name: organizers
    label: Organizers
    label_singular: Organizer
    folder: /content/organizers
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: role, label: Role, required: false }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
  - name: speakers
    label: Speakers
    label_singular: Speaker
    folder: /content/speakers
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: website, label: Website, required: false }
  - name: sessions
    label: Sessions
    label_singular: Session
    folder: /content/sessions
    fields:
      - { name: title, label: Title }
      - { name: event, label: Event, widget: relation, collection: events, display_fields: [name] }
      - name: speaker
        label: Speaker
        widget: relation
        collection: speakers
        display_fields: [name]
        required: false
      - { name: time, label: Time, widget: datetime, required: false }
      - { name: duration, label: Duration (minutes), widget: number, required: false }
      - { name: room, label: Room, required: false }
      - { name: description, label: Description, widget: richtext, required: false }
  - name: sponsors
    label: Sponsors
    label_singular: Sponsor
    folder: /content/sponsors
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: logo, label: Logo, widget: image, required: false }
      - { name: website, label: Website, required: false }
      - name: sponsorship_level
        label: Sponsorship Level
        widget: select
        options: [bronze, silver, gold, platinum]
      - name: events
        label: Events
        widget: relation
        collection: events
        display_fields: [name]
        multiple: true
        required: false
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: pages
    label: Pages
    files:
      - name: guidelines
        label: Event Guidelines
        file: /content/pages/guidelines.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: faq
        label: FAQ
        file: /content/pages/faq.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Music Band Website

- **Albums**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for albums, linked to tracks via a Relation field.
- **Tracks**: entry collection for tracks within each album, linked to albums via a Relation field.
- **Members**: entry collection for band members.
- **Tour dates**: entry collection for tour dates, linked to locations via a Relation field.
- **Locations**: entry collection for available venues, linked to tour dates via a Relation field.
- **Media**: entry collection for band media including photos and concert videos, linked to tour dates via a Relation field, organized by date with featured media highlighted on the gallery page.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like About the Band or Contact.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/media
public_folder: /media
collections:
  - name: albums
    label: Albums
    label_singular: Album
    folder: /content/albums
    sortable_fields:
      fields: [release_date, title]
      default: { field: release_date, direction: descending }
    fields:
      - { name: title, label: Title }
      - { name: release_date, label: Release Date, widget: datetime, type: date, required: false }
      - name: tracklist
        label: Tracklist
        widget: relation
        collection: tracks
        multiple: true
        required: false
      - { name: cover_image, label: Cover Image, widget: image, required: false }
      - { name: description, label: Description, widget: richtext, required: false }
      - name: genre
        label: Genre
        widget: select
        options: [Rock, Pop, Jazz, Electronic]
        required: false
      - name: streaming_links
        label: Streaming Links
        label_singular: Streaming Link
        widget: keyvalue
        key_label: Service
        value_label: URL
        required: false
  - name: tracks
    label: Tracks
    label_singular: Track
    folder: /content/tracks
    fields:
      - { name: title, label: Title }
      - { name: duration, label: Duration (seconds), widget: number, required: false }
      - { name: audio_url, label: Audio URL, required: false }
      - { name: lyrics, label: Lyrics, widget: richtext, required: false }
      - { name: featured_artist, label: Featured Artist, required: false }
  - name: members
    label: Members
    label_singular: Member
    folder: /content/members
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: role, label: Role }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - name: social_links
        label: Social Links
        label_singular: Social Link
        widget: keyvalue
        required: false
  - name: tour_dates
    label: Tour Dates
    label_singular: Tour Date
    folder: /content/tour-dates
    identifier_field: event_name
    summary: '{{event_name}} ({{date}})'
    sortable_fields:
      fields: [date, event_name]
      default: { field: date, direction: ascending }
    fields:
      - { name: event_name, label: Event Name }
      - { name: date, label: Date, widget: datetime }
      - name: location
        label: Location
        widget: relation
        collection: locations
        display_fields: [name]
        required: false
      - { name: ticket_url, label: Ticket URL, required: false }
      - { name: sold_out, label: Sold Out, widget: boolean, default: false }
  - name: locations
    label: Locations
    label_singular: Location
    folder: /content/locations
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: city, label: City, required: false }
      - { name: country, label: Country, required: false }
      - { name: capacity, label: Capacity, widget: number, required: false }
  - name: media
    label: Media
    label_singular: Media Item
    folder: /content/media
    sortable_fields:
      fields: [date, title]
      default: { field: date, direction: descending }
    fields:
      - { name: title, label: Title }
      - { name: type, label: Type, widget: select, options: [photo, video] }
      - { name: files, label: Files, widget: file, multiple: true, required: false }
      - { name: date, label: Date, widget: datetime, required: false }
      - name: event
        label: Event
        widget: relation
        collection: tour_dates
        display_fields: [event_name]
        required: false
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: pages
    label: Pages
    files:
      - name: about
        label: About the Band
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Recipe Website

- **Recipes**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for recipes, linked to categories, ingredients and chefs via Relation fields. Each ingredient is listed with its quantity and unit, which are stored in the recipe rather than in the ingredient, because they vary from recipe to recipe.
- **Categories**: entry collection for recipe categories (e.g. Appetizers, Desserts, Main Courses), linked to recipes via a Relation field.
- **Ingredients**: entry collection for available ingredients, linked to recipes via a Relation field.
- **Chefs**: entry collection for chefs, linked to recipes via a Relation field.
- **Cooking tips**: entry collection for cooking tips.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like About or Contact.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: recipes
    label: Recipes
    label_singular: Recipe
    folder: /content/recipes
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext, required: false }
      - name: categories
        label: Categories
        widget: relation
        collection: categories
        multiple: true
        required: false
      - name: ingredients
        label: Ingredients
        label_singular: Ingredient
        widget: list
        summary: '{{quantity}} {{unit}} {{ingredient}}'
        fields:
          - name: ingredient
            label: Ingredient
            widget: relation
            collection: ingredients
            display_fields: [name]
          - { name: quantity, label: Quantity, widget: number, value_type: float, required: false }
          - { name: unit, label: Unit, required: false, hint: 'e.g. g, ml, cups' }
      - name: chef
        label: Chef
        widget: relation
        collection: chefs
        display_fields: [name]
        required: false
      - { name: instructions, label: Instructions, widget: richtext }
      - { name: prep_time, label: Prep Time (minutes), widget: number, required: false }
      - { name: cooking_time, label: Cooking Time (minutes), widget: number, required: false }
      - { name: servings, label: Servings, widget: number, required: false }
      - { name: difficulty, label: Difficulty, widget: select, options: [easy, medium, hard] }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
  - name: categories
    label: Categories
    label_singular: Category
    folder: /content/categories
    fields:
      - { name: title, label: Title }
  - name: ingredients
    label: Ingredients
    label_singular: Ingredient
    folder: /content/ingredients
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: image, label: Image, widget: image, required: false }
  - name: chefs
    label: Chefs
    label_singular: Chef
    folder: /content/chefs
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: specialties, label: Specialties, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: website, label: Website, required: false }
  - name: cooking_tips
    label: Cooking Tips
    label_singular: Cooking Tip
    folder: /content/cooking-tips
    fields:
      - { name: title, label: Title }
      - name: category
        label: Category
        widget: select
        options: [techniques, equipment, ingredients, storage]
        required: false
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - { name: content, label: Content, widget: richtext }
  - name: pages
    label: Pages
    files:
      - name: about
        label: About
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Educational Platform

- **Courses**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for courses, linked to instructors, categories, lessons and locations via Relation fields.
- **Instructors**: entry collection for instructors, linked to courses and blog posts via Relation fields.
- **Lessons**: entry collection for lessons within each course, linked to courses via a Relation field.
- **Categories**: entry collection for course categories (e.g. Web Development, Design, Business), linked to courses via a Relation field.
- **Locations**: entry collection for available venues (for in-person courses), linked to courses via a Relation field.
- **Testimonials**: entry collection for student testimonials, linked to courses via a Relation field.
- **Events**: entry collection for upcoming educational events (workshops, webinars).
- **Blog posts**: entry collection for educational articles and updates, linked to instructors (as authors) and tags via Relation fields.
- **Tags**: entry collection for managing blog post tags, linked to blog posts via a Relation field.
- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like About Us or Contact.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: courses
    label: Courses
    label_singular: Course
    folder: /content/courses
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext }
      - name: instructor
        label: Instructor
        widget: relation
        collection: instructors
        display_fields: [name]
      - name: categories
        label: Categories
        widget: relation
        collection: categories
        multiple: true
        required: false
      - name: location
        label: Location
        widget: relation
        collection: locations
        display_fields: [name]
        required: false
      - { name: enrollment_link, label: Enrollment Link, required: false }
      - { name: level, label: Level, widget: select, options: [beginner, intermediate, advanced] }
      - { name: price, label: Price, widget: number, value_type: float, required: false }
      - name: status
        label: Status
        widget: select
        options: [draft, published, archived]
        default: draft
  - name: instructors
    label: Instructors
    label_singular: Instructor
    folder: /content/instructors
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: email, label: Email, required: false }
      - { name: contact_info, label: Contact Info, widget: keyvalue, required: false }
      - { name: expertise, label: Expertise, required: false }
  - name: lessons
    label: Lessons
    label_singular: Lesson
    folder: /content/lessons
    sortable_fields:
      fields: [order, title]
      default: { field: order, direction: ascending }
    fields:
      - { name: title, label: Title }
      - { name: course, label: Course, widget: relation, collection: courses }
      - { name: order, label: Order, widget: number, required: false }
      - { name: video_url, label: Video URL, required: false }
      - { name: resources, label: Resources, widget: list, required: false }
      - { name: content, label: Content, widget: richtext, required: false }
  - name: categories
    label: Categories
    label_singular: Category
    folder: /content/categories
    fields:
      - { name: title, label: Title }
  - name: locations
    label: Locations
    label_singular: Location
    folder: /content/locations
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: city, label: City, required: false }
      - { name: address, label: Address, required: false }
  - name: testimonials
    label: Testimonials
    label_singular: Testimonial
    folder: /content/testimonials
    identifier_field: student_name
    fields:
      - { name: student_name, label: Student Name }
      - { name: course, label: Course, widget: relation, collection: courses, required: false }
      - { name: testimonial_text, label: Testimonial, widget: text }
      - { name: rating, label: Rating, widget: select, options: [1, 2, 3, 4, 5], required: false }
      - { name: photo, label: Photo, widget: image, required: false }
  - name: events
    label: Events
    label_singular: Event
    folder: /content/events
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: registration_url, label: Registration URL, required: false }
      - { name: capacity, label: Capacity, widget: number, required: false }
  - name: posts
    label: Blog Posts
    label_singular: Blog Post
    folder: /content/posts
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, default: '{{now}}' }
      - name: author
        label: Author
        widget: relation
        collection: instructors
        display_fields: [name]
        required: false
      - name: tags
        label: Tags
        widget: relation
        collection: tags
        multiple: true
        required: false
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: featured_image, label: Featured Image, widget: image, required: false }
      - { name: body, label: Body, widget: richtext }
  - name: tags
    label: Tags
    label_singular: Tag
    folder: /content/tags
    fields:
      - { name: title, label: Title }
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Us
        file: /content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

#### Nonprofit Organization Site

- **Pages**: [file collection](https://sveltiacms.app/en/docs/collections/files) for static pages like Mission, Programs, Leadership, Donate and Contact.
- **News**: [entry collection](https://sveltiacms.app/en/docs/collections/entries) for news related to the organization.
- **Events**: entry collection for upcoming events.
- **Locations**: entry collection for available venues, linked to events via a Relation field.
- **Board Members**: entry collection for board members, linked to the Leadership page via a Relation field.
- **Programs**: entry collection for programs offered by the organization, linked to the Programs page via a Relation field.
- **Volunteer Opportunities**: entry collection for volunteer roles.
- **Success Stories**: entry collection for success stories.
- **Partners**: entry collection for partner organizations.
- **Sponsors**: entry collection for sponsors.
- **Campaigns**: entry collection for fundraising campaigns.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: pages
    label: Pages
    files:
      - name: mission
        label: Mission
        file: /content/pages/mission.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: programs
        label: Programs
        file: /content/pages/programs.md
        fields:
          - { name: title, label: Title }
          - name: programs
            label: Programs
            widget: relation
            collection: programs
            display_fields: [name]
            multiple: true
            required: false
          - { name: body, label: Body, widget: richtext }
      - name: leadership
        label: Leadership
        file: /content/pages/leadership.md
        fields:
          - { name: title, label: Title }
          - name: board_members
            label: Board Members
            widget: relation
            collection: board_members
            display_fields: [name]
            multiple: true
            required: false
          - { name: body, label: Body, widget: richtext }
      - name: donate
        label: Donate
        file: /content/pages/donate.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact
        file: /content/pages/contact.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
  - name: news
    label: News
    label_singular: News Item
    folder: /content/news
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, default: '{{now}}' }
      - { name: featured_image, label: Featured Image, widget: image, required: false }
      - { name: author, label: Author, required: false }
      - { name: published, label: Published, widget: boolean, default: false }
      - { name: content, label: Content, widget: richtext }
  - name: events
    label: Events
    label_singular: Event
    folder: /content/events
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: date, label: Date, widget: datetime }
      - name: location
        label: Location
        widget: relation
        collection: locations
        display_fields: [name]
        required: false
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: registration_url, label: Registration URL, required: false }
      - { name: featured, label: Featured, widget: boolean, default: false }
  - name: locations
    label: Locations
    label_singular: Location
    folder: /content/locations
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: address, label: Address, required: false }
      - { name: city, label: City, required: false }
      - { name: capacity, label: Capacity, widget: number, required: false }
  - name: board_members
    label: Board Members
    label_singular: Board Member
    folder: /content/board-members
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: role, label: Role }
      - { name: bio, label: Bio, widget: richtext, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
      - { name: email, label: Email, required: false }
  - name: programs
    label: Programs
    label_singular: Program
    folder: /content/programs
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: description, label: Description, widget: richtext }
      - { name: goals, label: Goals, widget: list, required: false }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - { name: budget, label: Budget, widget: number, required: false }
      - { name: impact, label: Impact, widget: richtext, required: false }
  - name: volunteer_opportunities
    label: Volunteer Opportunities
    label_singular: Volunteer Opportunity
    folder: /content/volunteer
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: requirements, label: Requirements, widget: list, required: false }
      - name: commitment
        label: Commitment
        widget: select
        options: [flexible, regular, one-time]
      - { name: application_url, label: Application URL, required: false }
  - name: success_stories
    label: Success Stories
    label_singular: Success Story
    folder: /content/success-stories
    fields:
      - { name: title, label: Title }
      - { name: featured_image, label: Featured Image, widget: image, required: false }
      - { name: author, label: Author, required: false }
      - { name: date, label: Date, widget: datetime, required: false }
      - { name: impact_metric, label: Impact Metric, required: false }
      - { name: content, label: Content, widget: richtext }
  - name: partners
    label: Partners
    label_singular: Partner
    folder: /content/partners
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: logo, label: Logo, widget: image, required: false }
      - { name: website, label: Website, required: false }
      - { name: partnership_type, label: Partnership Type, required: false }
  - name: sponsors
    label: Sponsors
    label_singular: Sponsor
    folder: /content/sponsors
    identifier_field: name
    fields:
      - { name: name, label: Name }
      - { name: description, label: Description, widget: richtext, required: false }
      - { name: logo, label: Logo, widget: image, required: false }
      - { name: website, label: Website, required: false }
      - name: sponsorship_level
        label: Sponsorship Level
        widget: select
        options: [bronze, silver, gold, platinum]
  - name: campaigns
    label: Campaigns
    label_singular: Campaign
    folder: /content/campaigns
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, widget: richtext }
      - { name: goal_amount, label: Goal Amount, widget: number, required: false }
      - name: raised_amount
        label: Raised Amount
        widget: number
        required: false
        hint: Update this manually as donations come in.
      - { name: end_date, label: End Date, widget: datetime }
      - { name: images, label: Images, widget: image, multiple: true, required: false }
      - name: status
        label: Status
        widget: select
        options: [active, completed, paused]
        default: active
```

### Real-World Examples

To see how others have structured their content models using Sveltia CMS, check out our [Showcase](https://sveltiacms.app/en/showcase) page. It features a variety of websites using Sveltia CMS. Most of them include a link to their source code, which can provide valuable insights into different content modeling approaches.

Source: https://sveltiacms.app/en/docs/content-modeling
