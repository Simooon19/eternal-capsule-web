import { defineField, defineType } from 'sanity';
import { LocationInput } from '../components/LocationInput';

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
      title: 'Date of Birth',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bornAt',
      title: 'Birth Location',
      type: 'object',
      components: {
        input: LocationInput
      },
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
          readOnly: true,
        },
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
    defineField({
      name: 'died',
      title: 'Date of Passing',
      type: 'date',
      validation: (Rule) => [
        Rule.required(),
        Rule.min(Rule.valueOfField('born')).error('Date of passing must be after date of birth'),
      ],
    }),
    defineField({
      name: 'diedAt',
      title: 'Death Location',
      type: 'object',
      components: {
        input: LocationInput
      },
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
          readOnly: true,
        },
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
    defineField({
      name: 'storyBlocks',
      title: 'Life Story',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'ntagUid',
      title: 'NFC Tag UID',
      type: 'string',
      readOnly: true,
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
      title: 'name',
      subtitle: 'born',
      media: 'gallery.0',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: `${new Date(subtitle).getFullYear()} - ${new Date(media?.died).getFullYear()}`,
        media,
      };
    },
  },
}); 