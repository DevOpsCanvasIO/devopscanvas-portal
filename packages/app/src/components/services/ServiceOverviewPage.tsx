import React from 'react';
import { Grid, Card, CardContent, Typography, Chip, Button } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  ContentHeader,
} from '@backstage/core-components';

const mockServices = [
  {
    name: 'devopscanvas-control-plane',
    description: 'API backend for DevOpsCanvas platform',
    type: 'service',
    lifecycle: 'production',
    owner: 'platform-team',
    status: 'Running',
    version: '2.1.0',
    lastDeployed: '2025-10-18T16:00:00Z',
  },
  {
    name: 'devopscanvas-portal',
    description: 'Developer portal for DevOpsCanvas platform',
    type: 'website',
    lifecycle: 'production',
    owner: 'platform-team',
    status: 'Running',
    version: '2.1.0',
    lastDeployed: '2025-10-18T17:00:00Z',
  },
];

export const ServiceOverviewPage = () => {
  return (
    <Page themeId="service">
      <Header title="Service Overview" />
      <Content>
        <ContentHeader title="🔧 DevOpsCanvas Services">
          Overview of all services in the DevOpsCanvas platform.
        </ContentHeader>
        
        <Grid container spacing={3}>
          {mockServices.map((service) => (
            <Grid item xs={12} md={6} key={service.name}>
              <Card>
                <CardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <Typography variant="h6" component="h2">
                      {service.name}
                    </Typography>
                    <Chip 
                      label={service.status} 
                      color={service.status === 'Running' ? 'primary' : 'default'}
                      size="small"
                    />
                  </div>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {service.description}
                  </Typography>
                  
                  <div style={{ margin: '1rem 0' }}>
                    <Typography variant="body2">
                      <strong>Type:</strong> {service.type}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Lifecycle:</strong> {service.lifecycle}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Owner:</strong> {service.owner}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Version:</strong> {service.version}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Deployed:</strong> {new Date(service.lastDeployed).toLocaleString()}
                    </Typography>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                    <Button size="small" variant="outlined">
                      Logs
                    </Button>
                    <Button size="small" variant="outlined">
                      Metrics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Actions
          </Typography>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" href="/create">
              Create New Service
            </Button>
            <Button variant="outlined" href="/catalog">
              Browse All Components
            </Button>
            <Button variant="outlined" href="/scorecards">
              View Scorecards
            </Button>
          </div>
        </div>
      </Content>
    </Page>
  );
};