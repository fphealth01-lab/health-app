import { defineArrayMember, defineField, defineType } from 'sanity'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: '1–2 sentences for SEO meta description.',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(320),
    }),
    defineField({
      name: 'featured_image',
      title: 'Featured image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'featured_image_url',
      title: 'Featured image URL (placeholder / external)',
      description:
        'Use for placeholder images (e.g. picsum.photos). Will be replaced pre-launch by the uploaded image above.',
      type: 'url',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'goals',
      title: 'Goals',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'goal' }] })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'supplements_mentioned',
      title: 'Supplements mentioned (slugs)',
      description: 'Catalog slugs for internal linking to /supplements/[slug].',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({ type: 'block' }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'caption', type: 'string', title: 'Caption' }),
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
        defineArrayMember({ type: 'articleCallout' }),
        defineArrayMember({ type: 'supplementReferenceCard' }),
        defineArrayMember({ type: 'pullQuote' }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'meta_title',
      title: 'Meta title (optional)',
      type: 'string',
    }),
    defineField({
      name: 'meta_description',
      title: 'Meta description (optional)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'published_at',
      title: 'Published at',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updated_at',
      title: 'Updated at',
      type: 'datetime',
    }),
    defineField({
      name: 'reading_time_minutes',
      title: 'Reading time (minutes)',
      description: 'Optional override; otherwise computed on the site from body length.',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(120),
    }),
  ],
  preview: {
    select: { title: 'title', media: 'featured_image', published: 'published_at' },
    prepare({ title, media, published }) {
      return {
        title: title ?? 'Article',
        media,
        subtitle: published
          ? new Date(published).toLocaleDateString()
          : 'Draft',
      }
    },
  },
})
