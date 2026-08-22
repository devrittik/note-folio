import { defineField, defineType } from 'sanity';

export const skillGroupSchema = defineType({
  name: 'skillGroup',
  title: 'Skill group',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'items',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (Rule) => Rule.required().min(1)
    })
  ],
  preview: { select: { title: 'label' } }
});
