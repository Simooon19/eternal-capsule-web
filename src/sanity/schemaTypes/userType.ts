import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Family Owner', value: 'family-owner' },
          { title: 'Funeral Home Editor', value: 'funeral-home-editor' },
          { title: 'Admin', value: 'admin' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'permissions',
      title: 'Permissions',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Create Memorial', value: 'create-memorial' },
          { title: 'Edit Memorial', value: 'edit-memorial' },
          { title: 'Delete Memorial', value: 'delete-memorial' },
          { title: 'Moderate Guestbook', value: 'moderate-guestbook' },
          { title: 'View Analytics', value: 'view-analytics' },
          { title: 'Manage Users', value: 'manage-users' },
          { title: 'Export Data', value: 'export-data' },
        ],
      },
    }),
    defineField({
      name: 'funeralHome',
      title: 'Funeral Home',
      type: 'reference',
      to: [{ type: 'funeralHome' }],
      hidden: ({ document }) => document?.role !== 'funeral-home-editor',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
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
      title: 'name',
      subtitle: 'email',
      role: 'role',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, role, isActive }) {
      return {
        title,
        subtitle,
        description: `${role} ${isActive ? '(Active)' : '(Inactive)'}`,
      };
    },
  },
});