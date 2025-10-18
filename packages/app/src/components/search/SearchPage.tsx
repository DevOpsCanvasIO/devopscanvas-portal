import React from 'react';
import { Grid, List, ListItem, ListItemText, Paper } from '@material-ui/core';
import { CatalogSearchResultListItem } from '@backstage/plugin-catalog';
import { DocsResultListItem } from '@backstage/plugin-techdocs';

import {
  DefaultResultListItem,
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchType,
  useSearch,
} from '@backstage/plugin-search-react';
import {
  CatalogIcon,
  Content,
  DocsIcon,
  Header,
  Page,
} from '@backstage/core-components';

const SearchPage = () => {
  const { types } = useSearch();
  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <SearchBar />
          </Grid>
          <Grid item xs={3}>
            <SearchType
              values={['techdocs', 'software-catalog']}
              name="type"
              defaultValue="software-catalog"
            />
            <Paper>
              <SearchFilter.Select
                className=""
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                className=""
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <SearchResult>
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
              <DocsResultListItem icon={<DocsIcon />} />
              <DefaultResultListItem />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export const searchPage = <SearchPage />;