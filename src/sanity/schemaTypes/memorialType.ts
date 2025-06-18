import { defineField, defineType } from 'sanity';
import { LocationInput } from '../components/LocationInput';

export default defineType({
  name: 'memorial',
  title: 'Memorial',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Optional subtitle or life motto',
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bornAt',
      title: 'Birth Information',
      type: 'object',
      fields: [
        {
          name: 'date',
          title: 'Date of Birth',
          type: 'date',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'location',
          title: 'Birth Location',
          type: 'string',
          description: 'City, Country',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          description: 'Click on the map to set the location',
        },
      ],
      options: {
        collapsible: true,
        collapsed: false,
      },
    }),
    defineField({
      name: 'diedAt',
      title: 'Death Information',
      type: 'object',
      fields: [
        {
          name: 'date',
          title: 'Date of Passing',
          type: 'date',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'location',
          title: 'Death Location',
          type: 'string',
          description: 'City, Country',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          description: 'Click on the map to set the location',
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
      name: 'videos',
      title: 'Video Memories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'video',
              title: 'Video File',
              type: 'file',
              options: {
                accept: 'video/*',
              },
            },
            {
              name: 'title',
              title: 'Video Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'audioMemories',
      title: 'Audio Memories',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'audio',
              title: 'Audio File',
              type: 'file',
              options: {
                accept: 'audio/*',
              },
            },
            {
              name: 'title',
              title: 'Audio Title',
              type: 'string',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'timeline',
      title: 'Life Timeline',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'date',
              title: 'Date',
              type: 'date',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Event Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 3,
            },
            {
              name: 'image',
              title: 'Event Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative Text',
                },
              ],
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'date',
              media: 'image',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Veteran', value: 'veteran' },
          { title: 'Musician', value: 'musician' },
          { title: 'Teacher', value: 'teacher' },
          { title: 'Artist', value: 'artist' },
          { title: 'Doctor', value: 'doctor' },
          { title: 'Parent', value: 'parent' },
          { title: 'Grandparent', value: 'grandparent' },
          { title: 'Sports', value: 'sports' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Business Owner', value: 'business-owner' },
        ],
      },
    }),
    defineField({
      name: 'privacy',
      title: 'Privacy Setting',
      type: 'string',
      options: {
        list: [
          { title: 'Public', value: 'public' },
          { title: 'Link Only', value: 'link-only' },
          { title: 'Password Protected', value: 'password-protected' },
        ],
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'password',
      title: 'Access Password',
      type: 'string',
      hidden: ({ document }) => document?.privacy !== 'password-protected',
      validation: (Rule) => 
        Rule.custom((password, context) => {
          const privacy = (context.document as any)?.privacy;
          if (privacy === 'password-protected' && !password) {
            return 'Password is required for password-protected memorials';
          }
          return true;
        }),
    }),
    defineField({
      name: 'nfcTagUid',
      title: 'NFC Tag UID',
      type: 'string',
      readOnly: true,
      description: 'Automatically generated unique identifier for NFC tag',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Published', value: 'published' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Deleted', value: 'deleted' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'owner',
      title: 'Memorial Owner',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'Family member who owns this memorial',
    }),
    defineField({
      name: 'editors',
      title: 'Funeral Home Editors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'user' }],
        },
      ],
      description: 'Funeral home staff who can edit this memorial',
    }),
    // Analytics fields
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'scanCount',
      title: 'Scan Count',
      type: 'number',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'lastScanned',
      title: 'Last Scanned',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'deletedAt',
      title: 'Deleted At',
      type: 'datetime',
      readOnly: true,
      hidden: ({ document }) => document?.status !== 'deleted',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'bornAt.date',
      media: 'gallery.0',
      status: 'status',
    },
    prepare({ title, subtitle, media, status }) {
      return {
        title,
        subtitle: subtitle ? `Born: ${new Date(subtitle).getFullYear()}` : 'No birth date',
        media,
        description: `Status: ${status}`,
      };
    },
  },
}); 