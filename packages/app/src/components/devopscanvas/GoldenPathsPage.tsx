import { useEffect, useState } from 'react';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  SupportButton,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Chip, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CodeIcon from '@material-ui/icons/Code';
import WebIcon from '@material-ui/icons/Web';
import CloudIcon from '@material-ui/icons/Cloud';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';

const useStyles = makeStyles(theme => ({
  pathCard: {
    height: '100%',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  pathIcon: {
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  maturityChip: {
    marginLeft: theme.spacing(1),
  },
  usageIndicator: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  techChip: {
    margin: theme.spacing(0.5),
  },
  createButton: {
    marginTop: theme.spacing(2),
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    },
  },
}));

interface GoldenPath {
  name: string;
  title: string;
  description: string;
  template: string;
  technologies: string[];
  maturity: string;
  usage: string;
}

const pathIcons: { [key: string]: React.ComponentType } = {
  microservice: CodeIcon,
  frontend: WebIcon,
  infrastructure: CloudIcon,
};

const maturityColors: { [key: string]: 'primary' | 'secondary' | 'default' } = {
  stable: 'primary',
  beta: 'secondary',
  alpha: 'default',
};

const usageColors: { [key: string]: 'primary' | 'secondary' | 'default' } = {
  high: 'primary',
  medium: 'secondary',
  low: 'default',
};

export const GoldenPathsPage = () => {
  const classes = useStyles();
  const [goldenPaths, setGoldenPaths] = useState<GoldenPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoldenPaths = async () => {
      try {
        const response = await fetch('/api/devopscanvas/golden-paths');
        const data = await response.json();
        setGoldenPaths(data);
      } catch (error) {
        console.error('Failed to fetch golden paths:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoldenPaths();
  }, []);

  if (loading) {
    return <Progress />;
  }

  return (
    <Page themeId="tool">
      <Header
        title="DevOpsCanvas Golden Paths"
        subtitle="Standardized development workflows with best practices built-in"
      >
        <SupportButton>
          Golden Paths are pre-configured templates that embody DevOpsCanvas best practices.
          They provide a standardized way to create new services with observability, security,
          and deployment automation built-in from day one.
        </SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Available Golden Paths">
          <Typography variant="body1">
            Choose from our curated collection of proven development patterns
          </Typography>
        </ContentHeader>

        <Grid container spacing={3}>
          {goldenPaths.map((path) => {
            const IconComponent = pathIcons[path.name] || CodeIcon;
            
            return (
              <Grid item xs={12} md={4} key={path.name}>
                <Card className={classes.pathCard}>
                  <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                      <Box className={classes.pathIcon}>
                        <IconComponent />
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <Typography variant="h5" gutterBottom>
                          {path.title || path.name}
                        </Typography>
                        <Chip 
                          label={path.maturity} 
                          color={maturityColors[path.maturity] || 'default'}
                          size="small" 
                          className={classes.maturityChip}
                        />
                      </Box>

                      <Typography variant="body2" color="textSecondary" paragraph>
                        {path.description}
                      </Typography>

                      <Box className={classes.usageIndicator}>
                        <TrendingUpIcon fontSize="small" />
                        <Typography variant="caption" style={{ marginLeft: 4 }}>
                          Usage: 
                        </Typography>
                        <Chip 
                          label={path.usage} 
                          color={usageColors[path.usage] || 'default'}
                          size="small" 
                          style={{ marginLeft: 4 }}
                        />
                      </Box>

                      <Box mt={2} mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Technologies:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" justifyContent="center">
                          {path.technologies.map((tech) => (
                            <Chip 
                              key={tech}
                              label={tech}
                              size="small"
                              variant="outlined"
                              className={classes.techChip}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        className={classes.createButton}
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          // Navigate to scaffolder with this template
                          window.location.href = `/create/templates/default/template/${path.template}`;
                        }}
                      >
                        Use This Template
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box mt={4}>
          <InfoCard title="What are Golden Paths?">
            <Typography variant="body1" paragraph>
              Golden Paths are opinionated, pre-configured templates that represent the "golden" or 
              recommended way to build and deploy services on the DevOpsCanvas platform. They include:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Built-in Best Practices"
                  secondary="Security, observability, and deployment patterns pre-configured"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="GitOps Integration"
                  secondary="Automatic CI/CD pipeline setup with ArgoCD deployment"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Monitoring & Alerting"
                  secondary="Prometheus metrics, Grafana dashboards, and alerting rules included"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Security Compliance"
                  secondary="Container scanning, policy enforcement, and security best practices"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Documentation"
                  secondary="Comprehensive README, API docs, and runbooks generated automatically"
                />
              </ListItem>
            </List>
          </InfoCard>
        </Box>
      </Content>
    </Page>
  );
};