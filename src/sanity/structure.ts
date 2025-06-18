import { StructureBuilder } from 'sanity/desk';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('memorial').title('Memorials'),
    ]);
