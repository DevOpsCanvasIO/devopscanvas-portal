import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { HomePageCompanyLogo } from '@backstage/plugin-home';

const useStyles = makeStyles(theme => ({
  searchBarInput: {
    maxWidth: '60vw',
    margin: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '50px',
    boxShadow: theme.shadows[1],
  },
  searchBarOutline: {
    borderStyle: 'none',
  },
}));

export const DevOpsCanvasHomePage = () => {
  const classes = useStyles();

  return (
    <Page themeId="home">
      <Header title="Welcome to DevOpsCanvas" pageTitleOverride="Home">
        <HeaderLabel label="Owner" value="Platform Team" />
        <HeaderLabel label="Lifecycle" value="Production" />
      </Header>
      <Content>
        <ContentHeader title="🚀 DevOpsCanvas Developer Portal">
          <SupportButton>
            Your one-stop platform for managing services, templates, and infrastructure.
          </SupportButton>
        </ContentHeader>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <HomePageCompanyLogo />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <div style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
              <h2>🎯 Platform Features</h2>
              <ul>
                <li>📋 <strong>Service Catalog</strong> - Discover and manage all your services</li>
                <li>🏗️ <strong>Templates</strong> - Create new services from golden path templates</li>
                <li>📊 <strong>Scorecards</strong> - Monitor service health and compliance</li>
                <li>📚 <strong>Documentation</strong> - Centralized technical documentation</li>
                <li>🔍 <strong>Search</strong> - Find services, APIs, and documentation quickly</li>
              </ul>
            </div>
          </Grid>
          
          <Grid item xs={12}>
            <div style={{ padding: '2rem', background: '#e3f2fd', borderRadius: '8px', marginTop: '2rem' }}>
              <h2>🚀 Quick Actions</h2>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3>📋 Browse Catalog</h3>
                    <p>Explore all registered services and components</p>
                    <a href="/catalog" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      View Catalog →
                    </a>
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3>🏗️ Create Service</h3>
                    <p>Use templates to scaffold new services</p>
                    <a href="/create" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      Create Service →
                    </a>
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3>📊 View Scorecards</h3>
                    <p>Monitor service health and compliance</p>
                    <a href="/scorecards" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      View Scorecards →
                    </a>
                  </div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <h3>📚 Documentation</h3>
                    <p>Access technical documentation</p>
                    <a href="/docs" style={{ textDecoration: 'none', color: '#1976d2' }}>
                      Browse Docs →
                    </a>
                  </div>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};