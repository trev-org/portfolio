# Writing an article

1. Copy `_template.mdx` to a lowercase, kebab-case filename such as
   `building-my-portfolio.mdx`. The filename becomes the URL slug.
2. Update the YAML frontmatter between the `---` markers. Dates must use
   `YYYY-MM-DD`.
3. Write the article body below the metadata. The page renders the title and
   description, so begin the body with prose or a level-two heading.
4. Keep `draft: true` while writing. Drafts are visible locally but excluded
   from production builds.
5. Set `draft: false`, commit the file, and deploy to publish it.

Images can be stored in `public/articles/` and referenced as
`/articles/image-name.jpg`.
