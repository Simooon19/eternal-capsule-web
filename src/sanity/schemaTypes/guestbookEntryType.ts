import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'guestbookEntry',
  title: 'Guestbook Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
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
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'emoji',
              title: 'Emoji',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'count',
              title: 'Count',
              type: 'number',
              initialValue: 0,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'flagged',
      title: 'Flagged for Review',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'author',
      subtitle: 'message',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({ title, subtitle, status, createdAt }) {
      return {
        title,
        subtitle: subtitle.substring(0, 100) + (subtitle.length > 100 ? '...' : ''),
        description: `${status} - ${new Date(createdAt).toLocaleDateString()}`,
      };
    },
  },
}); 