import { defineField, defineType } from 'sanity'

export const supplementReferenceCardType = defineType({
  name: 'supplementReferenceCard',
  title: 'Supplement card',
  type: 'object',
  fields: [
    defineField({
      name: 'supplementSlug',
      title: 'Supplement slug',
      description: 'Slug from the Supabase catalog (e.g. zinc-picolinate).',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { slug: 'supplementSlug' },
    prepare({ slug }) {
      return { title: 'Supplement card', subtitle: slug }
    },
  },
})
