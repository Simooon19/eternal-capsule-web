import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'memorialVersion',
  title: 'Memorial Version',
  type: 'document',
  fields: [
    defineField({
      name: 'memorial',
      title: 'Memorial',
      type: 'reference',
      to: [{ type: 'memorial' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Version Number',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'data',
      title: 'Memorial Data',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'subtitle',
          title: 'Subtitle',
          type: 'string',
        },
        {
          name: 'storyBlocks',
          title: 'Story Blocks',
          type: 'array',
          of: [{ type: 'block' }],
        },
        {
          name: 'gallery',
          title: 'Gallery',
          type: 'array',
          of: [{ type: 'image' }],
        },
        {
          name: 'timeline',
          title: 'Timeline',
          type: 'array',
          of: [{ type: 'object' }],
        },
      ],
    }),
    defineField({
      name: 'changedBy',
      title: 'Changed By',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'changeReason',
      title: 'Change Reason',
      type: 'string',
      description: 'Optional reason for the change',
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
      title: 'memorial.title',
      version: 'version',
      changedBy: 'changedBy.name',
      createdAt: 'createdAt',
    },
    prepare({ title, version, changedBy, createdAt }) {
      return {
        title: `${title} - v${version}`,
        subtitle: `Changed by ${changedBy}`,
        description: new Date(createdAt).toLocaleDateString(),
      };
    },
  },
});