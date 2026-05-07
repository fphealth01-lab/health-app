import { defineField, defineType } from 'sanity'

export const pullQuoteType = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    }),
  ],
  preview: {
    select: { quote: 'quote', attribution: 'attribution' },
    prepare({ quote, attribution }) {
      return {
        title: quote ? `${quote.slice(0, 60)}…` : 'Pull quote',
        subtitle: attribution,
      }
    },
  },
})
