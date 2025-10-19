import React, { useEffect, useState } from 'react';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  SupportButton,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import { Grid, Typography, Card, CardContent, Box, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloudIcon from '@material-ui/icons/Cloud';
import TimelineIcon from '@material-ui/icons/Timeline';
import SecurityIcon from '@material-ui/icons/Security';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import GitHubIcon from '@material-ui/icons/GitHub';
import DashboardIcon from '@material-ui/icons/Dashboard';

const useStyles = makeStyles(theme => ({
  statsCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '& .MuiCardContent-root': {
      padding: theme.spacing(3),
    },
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  featureCard: {
    height: '100%',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  featureIcon: {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  platformLink: {
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  statusChip: {
    marginLeft: theme.spacing(1),
  },
}));

interface PlatformStats {
  components: number;
  systems: number;
  apis: number;
  templates: number;
  users: number;
  teams: number;
}

interface PlatformInfo {
  name: string;
  version: string;
  environment: string;
  features: {
    gitops: boolean;
    observability: boolean;
    security: boolean;
    finops: boolean;
  };
  endpoints: {
    controlPlane: string;
    argocd: string;
    grafana: string;
    prometheus: string;
  };
  statistics: PlatformStats;
}

export const DevOpsCanvasDashboard = () => {
  const classes = useStyles();
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatformInfo = async () => {
      try {
        const response = await fetch('/api/devopscanvas/platform/info');
        const data = await response.json();
        setPlatformInfo(data);
      } catch (error) {
        console.error('Failed to fetch platform info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformInfo();
  }, []);

  if (loading) {
    return <Progress />;
  }

  const stats = platformInfo?.statistics || {
    components: 0,
    systems: 0,
    apis: 0,
    templates: 0,
    users: 0,
    teams: 0,
  };

  return (
    <Page themeId="tool">
      <Header
        title="DevOpsCanvas Platform Dashboard"
        subtitle="Your comprehensive DevOps platform overview"
      >
        <SupportButton>
          Welcome to the DevOpsCanvas Platform Dashboard. Here you can monitor
          your platform services, access key tools, and track platform metrics.
        </SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Platform Overview">
          <Box display="flex" alignItems="center">
            <Typography variant="body1">
              Platform Status: 
            </Typography>
            <Chip 
              label="Operational" 
              color="primary" 
              size="small" 
              className={classes.statusChip}
            />
          </Box>
        </ContentHeader>

        <Grid container spacing={3}>
          {/* Platform Statistics */}
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.components}
                </Typography>
                <Typography className={classes.statLabel}>
                  Components
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.templates}
                </Typography>
                <Typography className={classes.statLabel}>
                  Templates
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.systems}
                </Typography>
                <Typography className={classes.statLabel}>
                  Systems
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.apis}
                </Typography>
                <Typography className={classes.statLabel}>
                  APIs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.users}
                </Typography>
                <Typography className={classes.statLabel}>
                  Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card className={classes.statsCard}>
              <CardContent>
                <Typography className={classes.statNumber}>
                  {stats.teams}
                </Typography>
                <Typography className={classes.statLabel}>
                  Teams
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Features */}
          <Grid item xs={12} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <GitHubIcon className={classes.featureIcon} />
                  <Typography variant="h6" gutterBottom>
                    GitOps
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Automated deployment and configuration management with ArgoCD
                  </Typography>
                  <Box mt={2}>
                    <a 
                      href="https://argocd.devopscanvas.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={classes.platformLink}
                    >
                      <Chip label="Open ArgoCD" color="primary" clickable />
                    </a>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <TimelineIcon className={classes.featureIcon} />
                  <Typography variant="h6" gutterBottom>
                    Observability
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Comprehensive monitoring, logging, and alerting with Prometheus and Grafana
                  </Typography>
                  <Box mt={2}>
                    <a 
                      href="https://grafana.devopscanvas.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={classes.platformLink}
                    >
                      <Chip label="Open Grafana" color="primary" clickable />
                    </a>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <SecurityIcon className={classes.featureIcon} />
                  <Typography variant="h6" gutterBottom>
                    Security
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Policy enforcement, vulnerability scanning, and compliance monitoring
                  </Typography>
                  <Box mt={2}>
                    <Chip label="View Policies" color="primary" clickable />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card className={classes.featureCard}>
              <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                  <AccountBalanceIcon className={classes.featureIcon} />
                  <Typography variant="h6" gutterBottom>
                    FinOps
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Cost management, optimization, and financial operations for cloud resources
                  </Typography>
                  <Box mt={2}>
                    <Chip label="View Costs" color="primary" clickable />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <InfoCard title="Quick Actions">
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        🚀 Create New Service
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Use our golden path templates to create new services with best practices built-in.
                      </Typography>
                      <Chip label="Go to Templates" color="primary" clickable />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📋 Browse Service Catalog
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Discover and explore all services, APIs, and components in your platform.
                      </Typography>
                      <Chip label="Open Catalog" color="primary" clickable />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        📊 View Service Health
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Monitor service quality, performance, and compliance scorecards.
                      </Typography>
                      <Chip label="View Scorecards" color="primary" clickable />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};