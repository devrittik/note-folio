import { defineField, defineType } from 'sanity';

export const educationSchema = defineType({
  name: 'education',
  title: 'Education record',
  type: 'object',
  fields: [
    defineField({ name: 'period', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'institution', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'qualification', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'detail', type: 'string' })
  ],
  preview: { select: { title: 'qualification', subtitle: 'institution' } }
});
