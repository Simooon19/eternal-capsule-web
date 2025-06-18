import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'funeralHome',
  title: 'Funeral Home',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Funeral Home Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        {
          name: 'street',
          title: 'Street Address',
          type: 'string',
        },
        {
          name: 'city',
          title: 'City',
          type: 'string',
        },
        {
          name: 'state',
          title: 'State/Province',
          type: 'string',
        },
        {
          name: 'zipCode',
          title: 'ZIP/Postal Code',
          type: 'string',
        },
        {
          name: 'country',
          title: 'Country',
          type: 'string',
        },
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
        },
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'string',
          validation: (Rule) => Rule.email(),
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url',
        },
      ],
    }),
    defineField({
      name: 'subscription',
      title: 'Subscription Plan',
      type: 'object',
      fields: [
        {
          name: 'plan',
          title: 'Plan Type',
          type: 'string',
          options: {
            list: [
              { title: 'Free', value: 'free' },
              { title: 'Basic', value: 'basic' },
              { title: 'Professional', value: 'professional' },
              { title: 'Enterprise', value: 'enterprise' },
            ],
          },
          initialValue: 'free',
        },
        {
          name: 'maxMemorials',
          title: 'Max Memorials',
          type: 'number',
          initialValue: 5,
        },
        {
          name: 'stripeCustomerId',
          title: 'Stripe Customer ID',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'subscriptionId',
          title: 'Subscription ID',
          type: 'string',
          readOnly: true,
        },
        {
          name: 'subscriptionStatus',
          title: 'Subscription Status',
          type: 'string',
          options: {
            list: [
              { title: 'Active', value: 'active' },
              { title: 'Past Due', value: 'past_due' },
              { title: 'Canceled', value: 'canceled' },
              { title: 'Unpaid', value: 'unpaid' },
            ],
          },
        },
        {
          name: 'nextBillingDate',
          title: 'Next Billing Date',
          type: 'datetime',
        },
      ],
    }),
    defineField({
      name: 'settings',
      title: 'Settings',
      type: 'object',
      fields: [
        {
          name: 'allowPublicMemorials',
          title: 'Allow Public Memorials',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'requireApproval',
          title: 'Require Memorial Approval',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'customBranding',
          title: 'Custom Branding',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'emailNotifications',
          title: 'Email Notifications',
          type: 'boolean',
          initialValue: true,
        },
      ],
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
      subtitle: 'subscription.plan',
      media: 'logo',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, isActive }) {
      return {
        title,
        subtitle: `${subtitle} plan`,
        media,
        description: isActive ? 'Active' : 'Inactive',
      };
    },
  },
});