import { defineArrayMember, defineField, defineType } from 'sanity';

export const projectSchema = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fieldsets: [{ name: 'seo', title: 'Search & social', options: { collapsible: true, collapsed: true } }],
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'status', type: 'string', options: { list: ['live', 'built'], layout: 'radio' }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'year', type: 'number', validation: (Rule) => Rule.required().integer().min(2000).max(2100) }),
    defineField({ name: 'order', type: 'number', initialValue: 0, validation: (Rule) => Rule.required().integer().min(0) }),
    defineField({ name: 'oneLiner', title: 'One-line summary', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'screenshots',
      title: 'Project screenshots',
      description: 'Optional screenshots shown before The Problem section.',
      type: 'array',
      of: [defineArrayMember({
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'caption', type: 'string' })
        ]
      })]
    }),
    defineField({ name: 'techStack', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' }, validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: 'problem', type: 'text', rows: 5, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'system',
      title: 'System flow',
      type: 'array',
      of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
        defineField({ name: 'sub', title: 'Supporting label', type: 'string', validation: (Rule) => Rule.required() })
      ], preview: { select: { title: 'title', subtitle: 'sub' } } })],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({ name: 'buildFeatures', type: 'array', of: [{ type: 'string' }], validation: (Rule) => Rule.required().min(1) }),
    defineField({
      name: 'notes',
      title: 'Engineering notes',
      type: 'array',
      of: [defineArrayMember({ type: 'object', fields: [
        defineField({ name: 'challenge', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
        defineField({ name: 'decision', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
        defineField({ name: 'tradeoff', type: 'text', rows: 2, validation: (Rule) => Rule.required() })
      ], preview: { select: { title: 'challenge', subtitle: 'decision' } } })],
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: 'metrics', type: 'array', of: [{ type: 'string' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'liveUrl', type: 'url' }),
    defineField({ name: 'githubUrl', type: 'url' }),
    defineField({ name: 'seoTitle', title: 'SEO title override', type: 'string', fieldset: 'seo', validation: (Rule) => Rule.max(70) }),
    defineField({ name: 'seoDescription', title: 'Meta description override', type: 'text', rows: 3, fieldset: 'seo', validation: (Rule) => Rule.max(180) }),
    defineField({
      name: 'seoImage',
      title: 'Social preview image',
      type: 'image',
      fieldset: 'seo',
      description: 'Recommended: 1200 × 630 px. Falls back to the first screenshot, then the site default.',
      fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string' })]
    })
  ],
  orderings: [{ title: 'Manual order', name: 'manualOrder', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'status' } }
});
