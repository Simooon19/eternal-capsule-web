import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'guestbookEntry',
  title: 'Guestbook Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'memorial',
      title: 'Memorial',
      type: 'reference',
      to: [{ type: 'memorial' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'message',
      status: 'status',
    },
    prepare({ title, subtitle, status }) {
      return {
        title: `${title} (${status})`,
        subtitle: subtitle?.slice(0, 50) + (subtitle?.length > 50 ? '...' : ''),
      };
    },
  },
}); 