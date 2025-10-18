import React from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { WelcomeTitle } from './WelcomeTitle';
import { QuickAccessCard } from './QuickAccessCard';
import { MetricsCard } from './MetricsCard';
import { RecentServicesCard } from './RecentServicesCard';

export const DevOpsCanvasHomePage = () => {
  const configApi = useApi(configApiRef);
  const orgName = configApi.getOptionalString('organization.name') || 'DevOpsCanvas';

  return (
    <Page themeId="home">
      <Header title={`Welcome to ${orgName}`} subtitle="Your Developer Portal">
        <SupportButton>
          DevOpsCanvas provides a comprehensive platform for managing your
          software development lifecycle with built-in security, compliance,
          and best practices.
        </SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Dashboard">
          <Typography variant="body1">
            Monitor your services, track scorecards, and access development tools
          </Typography>
        </ContentHeader>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WelcomeTitle />
          </Grid>
          
          <Grid item lg={4} md={6} xs={12}>
            <QuickAccessCard />
          </Grid>
          
          <Grid item lg={4} md={6} xs={12}>
            <MetricsCard />
          </Grid>
          
          <Grid item lg={4} md={12} xs={12}>
            <RecentServicesCard />
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Golden Path Workflow
                </Typography>
                <Typography variant="body1" paragraph>
                  Follow our Golden Path to create production-ready services:
                </Typography>
                <Box component="ol" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body2" paragraph>
                    <strong>Create Service:</strong> Use our templates to scaffold new services
                  </Typography>
                  <Typography component="li" variant="body2" paragraph>
                    <strong>Develop:</strong> Write code with built-in security and best practices
                  </Typography>
                  <Typography component="li" variant="body2" paragraph>
                    <strong>Build & Sign:</strong> Automated CI/CD with keyless container signing
                  </Typography>
                  <Typography component="li" variant="body2" paragraph>
                    <strong>Deploy:</strong> GitOps-based deployment with policy enforcement
                  </Typography>
                  <Typography component="li" variant="body2" paragraph>
                    <strong>Monitor:</strong> Track scorecards and observability metrics
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};