import { defineField, defineType } from 'sanity';

export const certificationSchema = defineType({
  name: 'certification',
  title: 'Certification',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Certificate name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'issuer', title: 'Issuer', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'url', title: 'Certificate URL', type: 'url', description: 'Optional verification or certificate link.' })
  ],
  preview: { select: { title: 'name', subtitle: 'issuer' } }
});
