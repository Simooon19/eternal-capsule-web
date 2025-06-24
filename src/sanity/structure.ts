import { StructureBuilder, DefaultDocumentNodeResolver } from 'sanity/desk';
import { DocumentsIcon, UsersIcon, TagIcon, CogIcon, ChartUpwardIcon, StarIcon } from '@sanity/icons';

// https://www.sanity.io/docs/structure-builder-cheat-sheet

// Custom document node for better editing experience
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  // For now, just return the default form view
  // FUTURE: Preview components for live memorial views can be added here
  // when we build dedicated preview components for each memorial type
  return S.document().views([S.view.form()]);
};

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Eternal Capsule Admin')
    .items([
      // MEMORIAL MANAGEMENT
      S.listItem()
        .title('Memorials')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Memorial Management')
            .items([
              S.listItem()
                .title('All Memorials')
                .icon(DocumentsIcon)
                .child(
                  S.documentTypeList('memorial')
                    .title('All Memorials')
                    .filter('_type == "memorial"')
                    .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                ),

              S.listItem()
                .title('By Status')
                .icon(CogIcon)
                .child(
                  S.list()
                    .title('Memorials by Status')
                    .items([
                      S.listItem()
                        .title('📝 Draft')
                        .child(
                          S.documentTypeList('memorial')
                            .title('Draft Memorials')
                            .filter('_type == "memorial" && status == "draft"')
                            .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                        ),
                      
                      S.listItem()
                        .title('⏳ Pending Review')
                        .child(
                          S.documentTypeList('memorial')
                            .title('Pending Review')
                            .filter('_type == "memorial" && status == "pending"')
                            .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                        ),
                      
                      S.listItem()
                        .title('✅ Published')
                        .child(
                          S.documentTypeList('memorial')
                            .title('Published Memorials')
                            .filter('_type == "memorial" && status == "published"')
                            .defaultOrdering([{ field: 'viewCount', direction: 'desc' }])
                        ),
                      
                      S.listItem()
                        .title('🔄 Needs Changes')
                        .child(
                          S.documentTypeList('memorial')
                            .title('Needs Changes')
                            .filter('_type == "memorial" && status == "revision"')
                            .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                        ),
                      
                      S.listItem()
                        .title('📦 Archived')
                        .child(
                          S.documentTypeList('memorial')
                            .title('Archived Memorials')
                            .filter('_type == "memorial" && status == "archived"')
                            .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                        ),
                    ])
                ),

              S.listItem()
                .title('NFC Enabled')
                .icon(StarIcon)
                .child(
                  S.documentTypeList('memorial')
                    .title('NFC-Enabled Memorials')
                    .filter('_type == "memorial" && nfcIntegration.enabled == true')
                    .defaultOrdering([{ field: 'nfcIntegration.scanCount', direction: 'desc' }])
                ),

              S.listItem()
                .title('Most Viewed')
                .icon(ChartUpwardIcon)
                .child(
                  S.documentTypeList('memorial')
                    .title('Most Viewed Memorials')
                    .filter('_type == "memorial" && status == "published"')
                    .defaultOrdering([{ field: 'viewCount', direction: 'desc' }])
                ),

              S.listItem()
                .title('Recent Activity')
                .child(
                  S.documentTypeList('memorial')
                    .title('Recently Updated')
                    .filter('_type == "memorial"')
                    .defaultOrdering([{ field: 'updatedAt', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // FAMILY & CONTACTS
      S.listItem()
        .title('People & Contacts')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('People & Contacts')
            .items([
              S.listItem()
                .title('Users')
                .child(
                  S.documentTypeList('user')
                    .title('All Users')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),

              S.listItem()
                .title('Funeral Homes')
                .child(
                  S.documentTypeList('funeralHome')
                    .title('Funeral Homes')
                    .defaultOrdering([{ field: 'name', direction: 'asc' }])
                ),

              S.listItem()
                .title('Guestbook Entries')
                .child(
                  S.documentTypeList('guestbookEntry')
                    .title('All Guestbook Entries')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // ANALYTICS & INSIGHTS
      S.listItem()
        .title('Analytics & Insights')
        .icon(ChartUpwardIcon)
        .child(
          S.list()
            .title('Analytics & Insights')
            .items([
              S.listItem()
                .title('Search Analytics')
                .child(
                  S.documentTypeList('searchLog')
                    .title('Search Logs')
                    .defaultOrdering([{ field: 'timestamp', direction: 'desc' }])
                ),

              // FUTURE: Custom analytics dashboard components can be integrated here
              S.listItem()
                .title('Performance Overview')
                .child(
                  S.documentTypeList('memorial')
                    .title('Performance Overview')
                    .filter('_type == "memorial" && status == "published"')
                    .defaultOrdering([{ field: 'viewCount', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      // QUICK ACTIONS
      S.listItem()
        .title('Quick Actions')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Quick Actions')
            .items([
              S.listItem()
                .title('📝 Create New Memorial')
                .child(
                  S.documentTypeList('memorial')
                    .title('Create Memorial')
                    .child(S.document().schemaType('memorial'))
                ),

              S.listItem()
                .title('👥 Add Funeral Home')
                .child(
                  S.documentTypeList('funeralHome')
                    .title('Add Funeral Home')
                    .child(S.document().schemaType('funeralHome'))
                ),

              // FUTURE: Tag management interface with bulk operations for memorial organization
              S.listItem()
                .title('🏷️ Memorial Tags')
                .child(
                  S.documentTypeList('memorial')
                    .title('Manage Memorial Tags')
                    .filter('_type == "memorial"')
                    .defaultOrdering([{ field: 'title', direction: 'asc' }])
                ),
            ])
        ),

      S.divider(),

      // ADMIN ONLY SECTIONS
      ...S.documentTypeListItems().filter(
        (listItem) => !['memorial', 'user', 'funeralHome', 'guestbookEntry', 'searchLog'].includes(listItem.getId()!)
      ),
    ]);

// Helper function to create filtered lists
export const createFilteredList = (
  S: StructureBuilder,
  title: string,
  filter: string,
  ordering?: { field: string; direction: 'asc' | 'desc' }[]
) => {
  return S.documentTypeList('memorial')
    .title(title)
    .filter(filter)
    .defaultOrdering(ordering || [{ field: 'updatedAt', direction: 'desc' }]);
};
