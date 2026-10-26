import { defineArrayMember, defineField } from 'sanity';

export const carouselImageMember = defineArrayMember({
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'caption', type: 'string' })
  ]
});
