import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { TechDocsSearchResultListItem } from '@backstage/plugin-techdocs';

import {
  DefaultResultListItem,
  SearchBar,
  SearchFilter,
  SearchResult,
} from '@backstage/plugin-search-react';
import {
  CatalogIcon,
  Content,
  DocsIcon,
  Header,
  Page,
} from '@backstage/core-components';

const SearchPage = () => {
  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <SearchBar />
          </Grid>
          <Grid item xs={3}>
            <Paper>
              <SearchFilter.Select
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <SearchResult>
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
              <TechDocsSearchResultListItem icon={<DocsIcon />} />
              <DefaultResultListItem />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;