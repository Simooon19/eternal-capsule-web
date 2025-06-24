import { defineField, defineType } from 'sanity';
import { LocationInput, RestingPlaceInput } from '../components/LocationInput';

export default defineType({
  name: 'memorial',
  title: 'Memorial',
  type: 'document',
  groups: [
    {
      name: 'essential',
      title: '👤 Essential Information',
      default: true,
    },
    {
      name: 'content',
      title: '📝 Stories & Media',
    },
    {
      name: 'technology',
      title: '📱 QR & NFC Access',
    },
    {
      name: 'settings',
      title: '⚙️ Settings & Privacy',
    },
  ],
  fields: [
    // BASIC INFORMATION GROUP
    defineField({
      name: 'title',
      title: 'Full Name',
      type: 'string',
      group: 'essential',
      validation: (Rule) => Rule.required(),
      description: 'The full name of the person being memorialized',
    }),
    defineField({
      name: 'preferredName',
      title: 'Preferred Name',
      type: 'string',
      group: 'essential',
      description: 'How they liked to be called (nickname, shortened name)',
    }),
    defineField({
      name: 'subtitle',
      title: 'Memorial Subtitle',
      type: 'string',
      group: 'essential',
      description: 'Life motto, profession, or memorable phrase',
      placeholder: 'e.g., "Loving Father and Teacher" or "Forever in our hearts"',
    }),
    defineField({
      name: 'slug',
      title: 'Memorial URL',
      type: 'slug',
      group: 'essential',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input: string) => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, ''),
      },
      validation: (Rule) => Rule.required(),
      description: 'This creates the web address for the memorial',
    }),
    defineField({
      name: 'personalInfo',
      title: 'Life Information',
      type: 'object',
      group: 'essential',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'dateOfBirth',
          title: 'Date of Birth',
          type: 'date',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'dateOfDeath',
          title: 'Date of Passing',
          type: 'date',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'birthLocation',
          title: 'Place of Birth',
          type: 'object',
          description: 'Where they were born',
          fields: [
            {
              name: 'location',
              title: 'City, Country',
              type: 'string',
              description: 'e.g., "Stockholm, Sweden" or "New York, USA"',
              placeholder: 'Enter city, country',
            },
            {
              name: 'coordinates',
              title: 'GPS Coordinates',
              type: 'geopoint',
              readOnly: true,
              description: 'Automatically filled when location is entered',
            },
          ],
          components: {
            input: LocationInput,
          },
        },
        {
          name: 'deathLocation',
          title: 'Place of Passing',
          type: 'object',
          description: 'Where they passed away',
          fields: [
            {
              name: 'location',
              title: 'City, Country',
              type: 'string',
              description: 'e.g., "Stockholm, Sweden" or "New York, USA"',
              placeholder: 'Enter city, country',
            },
            {
              name: 'coordinates',
              title: 'GPS Coordinates',
              type: 'geopoint',
              readOnly: true,
              description: 'Automatically filled when location is entered',
            },
          ],
          components: {
            input: LocationInput,
          },
        },
        {
          name: 'restingPlace',
          title: 'Final Resting Place',
          type: 'object',
          description: 'Cemetery or final resting location',
          fields: [
            {
              name: 'cemetery',
              title: 'Cemetery/Memorial Site Name',
              type: 'string',
              placeholder: 'e.g., Skogskyrkogården, Arlington National Cemetery',
            },
            {
              name: 'location',
              title: 'City, Country',
              type: 'string',
              description: 'Location of the cemetery/memorial site',
              placeholder: 'Enter city, country',
            },
            {
              name: 'section',
              title: 'Section/Plot Details',
              type: 'string',
              placeholder: 'e.g., Section A, Plot 15, or Urn Garden 3',
              description: 'Specific location within the cemetery (optional)',
            },
            {
              name: 'coordinates',
              title: 'GPS Coordinates',
              type: 'geopoint',
              description: 'Exact location for visitors to find the grave/memorial',
            },
          ],
          components: {
            input: RestingPlaceInput,
          },
        },
        {
          name: 'age',
          title: 'Age at Passing',
          type: 'number',
          validation: (Rule) => Rule.min(0).max(150),
          description: 'Automatically calculated from birth and death dates if not provided',
        },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Main Memorial Photo',
      type: 'image',
      group: 'essential',
      options: { 
        hotspot: true,
        metadata: ['palette'],
      },
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
          title: 'Photo Caption',
        },
        {
          name: 'blackAndWhite',
          title: 'Display in Black & White',
          type: 'boolean',
          initialValue: false,
          description: 'Show this photo in grayscale for a more solemn tone',
        },
      ],
      validation: (Rule) => Rule.required(),
      description: 'The main photo that represents this person',
    }),

    // CONTENT & MEDIA GROUP
    defineField({
      name: 'biography',
      title: 'Life Story',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
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
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: true,
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
      description: 'Tell their story in rich detail with text and photos',
    }),
    defineField({
      name: 'timeline',
      title: 'Life Timeline',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'year',
              title: 'Year',
              type: 'number',
              validation: (Rule) => Rule.required().min(1900).max(new Date().getFullYear()),
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
              name: 'photo',
              title: 'Event Photo',
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
              subtitle: 'year',
              media: 'photo',
            },
            prepare({ title, subtitle, media }) {
              return {
                title: title || 'Untitled Event',
                subtitle: subtitle ? `${subtitle}` : 'No year',
                media,
              };
            },
          },
        },
      ],
      description: 'Key moments and milestones in their life',
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'image',
          options: { 
            hotspot: true,
            metadata: ['palette', 'exif', 'location'],
          },
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
            {
              name: 'year',
              type: 'number',
              title: 'Year Taken',
              validation: (Rule) => Rule.min(1900).max(new Date().getFullYear()),
            },
            {
              name: 'featured',
              type: 'boolean',
              title: 'Featured Photo',
              description: 'Show prominently in gallery',
              initialValue: false,
            },
          ],
        },
      ],
      description: 'Collection of photos celebrating their life',
    }),
    defineField({
      name: 'videos',
      title: 'Video Memories',
      type: 'array',
      group: 'content',
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
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Video Title',
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
              name: 'thumbnail',
              title: 'Custom Thumbnail',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'duration',
              title: 'Duration (seconds)',
              type: 'number',
              description: 'Video length in seconds',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              media: 'thumbnail',
            },
          },
        },
      ],
      description: 'Video tributes and memories',
    }),
    defineField({
      name: 'audioMemories',
      title: 'Audio Memories',
      type: 'array',
      group: 'content',
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
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'title',
              title: 'Audio Title',
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
              name: 'transcript',
              title: 'Transcript',
              type: 'text',
              description: 'Text transcript of the audio',
            },
            {
              name: 'duration',
              title: 'Duration (seconds)',
              type: 'number',
            },
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
          },
        },
      ],
      description: 'Voice recordings, music, or other audio memories',
    }),

    // ACCESS & TECHNOLOGY GROUP
    defineField({
      name: 'nfcIntegration',
      title: 'NFC Tag Integration',
      type: 'object',
      group: 'technology',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        {
          name: 'enabled',
          title: 'Enable NFC Access',
          type: 'boolean',
          initialValue: false,
          description: 'Allow visitors to scan an NFC tag at the gravesite',
        },
        {
          name: 'tagId',
          title: 'NFC Tag ID',
          type: 'string',
          description: 'Unique identifier for the physical NFC tag',
          hidden: ({ parent }) => !parent?.enabled,
          validation: (Rule) => 
            Rule.custom((tagId, context) => {
              const enabled = (context.parent as any)?.enabled;
              if (enabled && !tagId) {
                return 'Tag ID is required when NFC is enabled';
              }
              return true;
            }),
        },
        {
          name: 'tagStatus',
          title: 'Tag Status',
          type: 'string',
          options: {
            list: [
              { title: 'Not Programmed', value: 'pending' },
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' },
              { title: 'Needs Replacement', value: 'replacement' },
            ],
          },
          initialValue: 'pending',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'installDate',
          title: 'Installation Date',
          type: 'date',
          description: 'When the NFC tag was installed at the gravesite',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'lastScanned',
          title: 'Last Scanned',
          type: 'datetime',
          readOnly: true,
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'scanCount',
          title: 'Total Scans',
          type: 'number',
          readOnly: true,
          initialValue: 0,
          hidden: ({ parent }) => !parent?.enabled,
        },
      ],
    }),
    defineField({
      name: 'qrCode',
      title: 'QR Code Settings',
      type: 'object',
      group: 'technology',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        {
          name: 'enabled',
          title: 'Enable QR Code',
          type: 'boolean',
          initialValue: true,
          description: 'Generate a QR code for easy mobile access',
        },
        {
          name: 'customUrl',
          title: 'Custom QR URL',
          type: 'url',
          description: 'Optional custom URL for the QR code (defaults to memorial URL)',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'style',
          title: 'QR Code Style',
          type: 'string',
          options: {
            list: [
              { title: 'Standard Black', value: 'standard' },
              { title: 'High Contrast', value: 'high-contrast' },
              { title: 'Memorial Theme', value: 'themed' },
            ],
          },
          initialValue: 'standard',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'downloadCount',
          title: 'Downloads',
          type: 'number',
          readOnly: true,
          initialValue: 0,
          description: 'Number of times QR code was downloaded',
          hidden: ({ parent }) => !parent?.enabled,
        },
      ],
    }),

    // PRIVACY & SETTINGS GROUP
    defineField({
      name: 'privacy',
      title: 'Privacy Level',
      type: 'string',
      group: 'settings',
              options: {
          list: [
            { title: 'Public', value: 'public' },
            { title: 'Link Only', value: 'link-only' },
            { title: 'Password Protected', value: 'password-protected' },
            { title: 'Family Only', value: 'family-only' },
          ],
          layout: 'radio',
        },
        description: 'Public: Anyone can view • Link Only: Direct link required • Password Protected: Requires password • Family Only: Approved family members only',
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'accessPassword',
      title: 'Access Password',
      type: 'string',
      group: 'settings',
      hidden: ({ document }) => document?.privacy !== 'password-protected',
      validation: (Rule) => 
        Rule.custom((password, context) => {
          const privacy = (context.document as any)?.privacy;
          if (privacy === 'password-protected' && !password) {
            return 'Password is required for password-protected memorials';
          }
          if (password && password.length < 6) {
            return 'Password must be at least 6 characters';
          }
          return true;
        }),
    }),
    defineField({
      name: 'guestbookSettings',
      title: 'Guestbook Settings',
      type: 'object',
      group: 'settings',
      fields: [
        {
          name: 'enabled',
          title: 'Enable Guestbook',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'requireApproval',
          title: 'Require Approval',
          type: 'boolean',
          initialValue: false,
          description: 'All guestbook entries must be approved before showing',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'allowAnonymous',
          title: 'Allow Anonymous Posts',
          type: 'boolean',
          initialValue: true,
          description: 'Visitors can post without providing their name',
          hidden: ({ parent }) => !parent?.enabled,
        },
        {
          name: 'notifyEmails',
          title: 'Notification Emails',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Email addresses to notify of new guestbook entries',
          hidden: ({ parent }) => !parent?.enabled,
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Memorial Tags',
      type: 'array',
      group: 'settings',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Veteran', value: 'veteran' },
          { title: 'Musician', value: 'musician' },
          { title: 'Teacher', value: 'teacher' },
          { title: 'Artist', value: 'artist' },
          { title: 'Doctor', value: 'doctor' },
          { title: 'Nurse', value: 'nurse' },
          { title: 'Parent', value: 'parent' },
          { title: 'Grandparent', value: 'grandparent' },
          { title: 'Sports Fan', value: 'sports' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Business Owner', value: 'business-owner' },
          { title: 'Community Leader', value: 'community-leader' },
          { title: 'Traveler', value: 'traveler' },
          { title: 'Book Lover', value: 'book-lover' },
          { title: 'Gardener', value: 'gardener' },
          { title: 'Chef/Cook', value: 'chef' },
        ],
      },
      description: 'Tags help people discover and filter memorials',
    }),
    defineField({
      name: 'status',
      title: 'Publication Status',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Pending Review', value: 'pending' },
          { title: 'Published', value: 'published' },
          { title: 'Needs Changes', value: 'revision' },
          { title: 'Archived', value: 'archived' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'funeralHome',
      title: 'Funeral Home',
      type: 'reference',
      group: 'settings',
      to: [{ type: 'funeralHome' }],
      description: 'The funeral home managing this memorial',
    }),
    defineField({
      name: 'familyContacts',
      title: 'Family Contacts',
      type: 'array',
      group: 'settings',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Contact Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'relationship',
              title: 'Relationship',
              type: 'string',
              options: {
                list: [
                  'Spouse', 'Child', 'Parent', 'Sibling', 
                  'Grandchild', 'Other Family', 'Friend',
                ],
              },
            },
            {
              name: 'email',
              title: 'Email',
              type: 'email',
            },
            {
              name: 'phone',
              title: 'Phone',
              type: 'string',
            },
            {
              name: 'canEdit',
              title: 'Can Edit Memorial',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'primaryContact',
              title: 'Primary Contact',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'relationship',
            },
          },
        },
      ],
      description: 'Family members and contacts for this memorial',
    }),

    // Basic tracking fields (simplified)
    defineField({
      name: 'viewCount',
      title: 'Total Views',
      type: 'number',
      group: 'settings',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'createdAt',
      title: 'Created',
      type: 'datetime',
      group: 'settings',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      group: 'settings',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'personalInfo.dateOfBirth',
      media: 'heroImage',
      status: 'status',
      nfcEnabled: 'nfcIntegration.enabled',
    },
    prepare({ title, subtitle, media, status, nfcEnabled }) {
      const statusEmoji = {
        draft: '📝',
        pending: '⏳',
        published: '✅',
        revision: '🔄',
        archived: '📦',
      }[status as string] || '❓';

      return {
        title: `${statusEmoji} ${title || 'Untitled Memorial'}`,
        subtitle: subtitle ? 
          `Born: ${new Date(subtitle).getFullYear()}${nfcEnabled ? ' • NFC Enabled' : ''}` : 
          'No birth date',
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
    {
      title: 'Name Z-A',
      name: 'nameDesc',
      by: [{ field: 'title', direction: 'desc' }],
    },
    {
      title: 'Recently Created',
      name: 'createdDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Recently Updated',
      name: 'updatedDesc',
      by: [{ field: 'updatedAt', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'viewsDesc',
      by: [{ field: 'viewCount', direction: 'desc' }],
    },
  ],
}); 