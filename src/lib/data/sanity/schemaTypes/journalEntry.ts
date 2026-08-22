import { defineArrayMember, defineField, defineType } from 'sanity';
import { ReadTimeInput } from '../components/ReadTimeInput';

export const journalEntrySchema = defineType({
  name: 'journalEntry',
  title: 'Journal entry',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'readTime',
      title: 'Read time',
      type: 'number',
      initialValue: 1,
      components: { input: ReadTimeInput },
      validation: (Rule) => Rule.required().integer().min(1)
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'body',
      title: 'Journal body',
      description: 'Add and reorder text paragraphs and images.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'journalTextBlock',
          title: 'Text paragraph',
          type: 'object',
          fields: [
            defineField({ name: 'text', type: 'text', rows: 7, validation: (Rule) => Rule.required() })
          ],
          preview: {
            select: { title: 'text' },
            prepare: ({ title }) => ({ title: title || 'Text paragraph' })
          }
        }),
        defineArrayMember({
          type: 'image',
          title: 'Body image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'caption', type: 'string' })
          ]
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'schemaType',
      title: 'Structured data type',
      type: 'string',
      initialValue: 'Article',
      options: { list: [{ title: 'Article', value: 'Article' }], layout: 'radio' },
      validation: (Rule) => Rule.required()
    })
  ],
  orderings: [{ title: 'Newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'date' } }
});
