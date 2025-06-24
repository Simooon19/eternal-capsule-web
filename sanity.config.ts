/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure, defaultDocumentNode } from './src/sanity/structure';
import { apiVersion, dataset, projectId } from './src/sanity/env';
import { nfcTool } from './src/sanity/plugins/nfcTool';

export default defineConfig({
  name: 'default',
  title: 'Eternal Capsule',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    deskTool({ 
      structure,
      defaultDocumentNode,
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    nfcTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});
