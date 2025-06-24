import { defineField, defineType } from 'sanity';

export const searchLogType = defineType({
  name: 'searchLog',
  title: 'Search Log',
  type: 'document',
  fields: [
    defineField({
      name: 'query',
      title: 'Search Query',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'filters',
      title: 'Search Filters',
      type: 'object',
      fields: [
        defineField({
          name: 'dateRange',
          title: 'Date Range',
          type: 'object',
          fields: [
            defineField({ name: 'start', title: 'Start Date', type: 'string' }),
            defineField({ name: 'end', title: 'End Date', type: 'string' }),
          ],
        }),
        defineField({
          name: 'funeralHome',
          title: 'Funeral Home',
          type: 'string',
        }),
        defineField({
          name: 'location',
          title: 'Location Filter',
          type: 'object',
          fields: [
            defineField({ name: 'city', title: 'City', type: 'string' }),
            defineField({ name: 'state', title: 'State', type: 'string' }),
            defineField({ name: 'country', title: 'Country', type: 'string' }),
          ],
        }),
        defineField({
          name: 'tags',
          title: 'Tags',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'mediaType',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              { title: 'Photos', value: 'photos' },
              { title: 'Videos', value: 'videos' },
              { title: 'Audio', value: 'audio' },
              { title: 'Documents', value: 'documents' },
            ],
          },
        }),
        defineField({
          name: 'sortBy',
          title: 'Sort By',
          type: 'string',
          options: {
            list: [
              { title: 'Relevance', value: 'relevance' },
              { title: 'Date Descending', value: 'date_desc' },
              { title: 'Date Ascending', value: 'date_asc' },
              { title: 'Name A-Z', value: 'name_asc' },
              { title: 'Name Z-A', value: 'name_desc' },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'resultsCount',
      title: 'Results Count',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userId',
      title: 'User ID',
      type: 'string',
    }),
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'userAgent',
      title: 'User Agent',
      type: 'string',
    }),
    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
    }),
    defineField({
      name: 'clickedResults',
      title: 'Clicked Results',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'memorialId',
              title: 'Memorial ID',
              type: 'string',
            }),
            defineField({
              name: 'position',
              title: 'Position in Results',
              type: 'number',
            }),
            defineField({
              name: 'clickedAt',
              title: 'Clicked At',
              type: 'datetime',
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'query',
      subtitle: 'timestamp',
      resultsCount: 'resultsCount',
    },
    prepare(selection) {
      const { title, subtitle, resultsCount } = selection;
      return {
        title: `"${title}"`,
        subtitle: `${new Date(subtitle).toLocaleDateString()} • ${resultsCount} results`,
      };
    },
  },
}); 