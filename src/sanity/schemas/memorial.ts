import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'memorial',
  title: 'Memorial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'born',
      title: 'Born',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bornAt',
      title: 'Birth Location',
      type: 'object',
      fields: [
        {
          name: 'location',
          title: 'Location',
          type: 'string',
          description: 'City, Country',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          description: 'Click on the map to set the location',
          validation: (Rule) => Rule.required(),
        },
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
    defineField({
      name: 'died',
      title: 'Died',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'diedAt',
      title: 'Death Location',
      type: 'object',
      fields: [
        {
          name: 'location',
          title: 'Location',
          type: 'string',
          description: 'City, Country',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          description: 'Click on the map to set the location',
          validation: (Rule) => Rule.required(),
        },
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'storyBlocks',
      title: 'Story',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'born',
      media: 'gallery.0',
    },
  },
}) 