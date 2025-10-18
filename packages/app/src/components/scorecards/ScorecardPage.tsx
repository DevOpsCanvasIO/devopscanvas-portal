import React from 'react';
import { Grid, Card, CardContent, Typography, Chip } from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  ContentHeader,
} from '@backstage/core-components';

const mockScorecards = [
  {
    service: 'devopscanvas-control-plane',
    score: 85,
    status: 'Good',
    checks: {
      security: 'Pass',
      performance: 'Pass',
      reliability: 'Warning',
      documentation: 'Pass',
    }
  },
  {
    service: 'devopscanvas-portal',
    score: 92,
    status: 'Excellent',
    checks: {
      security: 'Pass',
      performance: 'Pass',
      reliability: 'Pass',
      documentation: 'Pass',
    }
  },
];

export const ScorecardPage = () => {
  return (
    <Page themeId="tool">
      <Header title="Service Scorecards" />
      <Content>
        <ContentHeader title="📊 Service Health & Compliance Scorecards">
          Monitor the health, security, and compliance of all your services.
        </ContentHeader>
        
        <Grid container spacing={3}>
          {mockScorecards.map((scorecard) => (
            <Grid item xs={12} md={6} key={scorecard.service}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {scorecard.service}
                  </Typography>
                  
                  <div style={{ margin: '1rem 0' }}>
                    <Typography variant="h4" component="div" style={{ display: 'inline-block', marginRight: '1rem' }}>
                      {scorecard.score}%
                    </Typography>
                    <Chip 
                      label={scorecard.status} 
                      color={scorecard.score >= 90 ? 'primary' : scorecard.score >= 70 ? 'default' : 'secondary'}
                    />
                  </div>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Health Checks:
                  </Typography>
                  
                  <Grid container spacing={1}>
                    {Object.entries(scorecard.checks).map(([check, status]) => (
                      <Grid item xs={6} key={check}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            marginRight: '0.5rem',
                            color: status === 'Pass' ? 'green' : status === 'Warning' ? 'orange' : 'red'
                          }}>
                            {status === 'Pass' ? '✅' : status === 'Warning' ? '⚠️' : '❌'}
                          </span>
                          <Typography variant="body2">
                            {check.charAt(0).toUpperCase() + check.slice(1)}
                          </Typography>
                        </div>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Content>
    </Page>
  );
};