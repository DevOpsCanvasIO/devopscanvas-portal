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
import { 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  Chip, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles(theme => ({
  radarContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  ringChip: {
    margin: theme.spacing(0.5),
    fontWeight: 'bold',
  },
  adoptChip: {
    backgroundColor: '#93c47d',
    color: 'white',
  },
  trialChip: {
    backgroundColor: '#93d2c2',
    color: 'white',
  },
  assessChip: {
    backgroundColor: '#fbdb84',
    color: 'black',
  },
  holdChip: {
    backgroundColor: '#efafa9',
    color: 'black',
  },
  quadrantCard: {
    height: '100%',
    '& .MuiCardContent-root': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  },
  entryRow: {
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

interface TechRadarEntry {
  id: string;
  title: string;
  quadrant: string;
  ring: string;
  description: string;
}

interface TechRadarRing {
  id: string;
  name: string;
  color: string;
}

interface TechRadarQuadrant {
  id: string;
  name: string;
}

interface TechRadarData {
  rings: TechRadarRing[];
  quadrants: TechRadarQuadrant[];
  entries: TechRadarEntry[];
}

export const TechRadarPage = () => {
  const classes = useStyles();
  const [radarData, setRadarData] = useState<TechRadarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechRadar = async () => {
      try {
        const response = await fetch('/api/tech-radar');
        const data = await response.json();
        setRadarData(data);
      } catch (error) {
        console.error('Failed to fetch tech radar:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechRadar();
  }, []);

  if (loading) {
    return <Progress />;
  }

  if (!radarData) {
    return (
      <Page themeId="tool">
        <Header title="DevOpsCanvas Tech Radar" />
        <Content>
          <Alert severity="error">
            Failed to load Tech Radar data. Please try again later.
          </Alert>
        </Content>
      </Page>
    );
  }

  const getRingChipClass = (ringId: string) => {
    switch (ringId) {
      case 'adopt': return classes.adoptChip;
      case 'trial': return classes.trialChip;
      case 'assess': return classes.assessChip;
      case 'hold': return classes.holdChip;
      default: return '';
    }
  };

  const groupedEntries = radarData.quadrants.reduce((acc, quadrant) => {
    acc[quadrant.id] = radarData.entries.filter(entry => entry.quadrant === quadrant.id);
    return acc;
  }, {} as { [key: string]: TechRadarEntry[] });

  return (
    <Page themeId="tool">
      <Header
        title="DevOpsCanvas Tech Radar"
        subtitle="Technology adoption and platform standards"
      >
        <SupportButton>
          The DevOpsCanvas Tech Radar helps teams understand which technologies are recommended,
          being evaluated, or should be avoided. It provides guidance on technology adoption
          across the platform.
        </SupportButton>
      </Header>
      <Content>
        <ContentHeader title="Technology Landscape">
          <Box display="flex" flexWrap="wrap" alignItems="center">
            <Typography variant="body1" style={{ marginRight: 16 }}>
              Adoption Levels:
            </Typography>
            {radarData.rings.map((ring) => (
              <Chip
                key={ring.id}
                label={ring.name}
                className={`${classes.ringChip} ${getRingChipClass(ring.id)}`}
                size="small"
              />
            ))}
          </Box>
        </ContentHeader>

        {/* Visual Radar Placeholder */}
        <Box className={classes.radarContainer}>
          <Typography variant="h4" color="textSecondary">
            🎯 Interactive Tech Radar
          </Typography>
        </Box>

        {/* Technology Quadrants */}
        <Grid container spacing={3}>
          {radarData.quadrants.map((quadrant) => (
            <Grid item xs={12} md={6} key={quadrant.id}>
              <Card className={classes.quadrantCard}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {quadrant.name}
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Technology</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedEntries[quadrant.id]?.map((entry) => (
                          <TableRow key={entry.id} className={classes.entryRow}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {entry.title}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {entry.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={entry.ring.toUpperCase()}
                                className={`${classes.ringChip} ${getRingChipClass(entry.ring)}`}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box mt={4}>
          <InfoCard title="Understanding the Tech Radar">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Adoption Rings
                </Typography>
                <Box mb={2}>
                  <Chip label="ADOPT" className={`${classes.ringChip} ${classes.adoptChip}`} />
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    Technologies we have high confidence in and actively use across the platform.
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Chip label="TRIAL" className={`${classes.ringChip} ${classes.trialChip}`} />
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    Technologies worth pursuing with the understanding that enterprises should gain experience.
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Chip label="ASSESS" className={`${classes.ringChip} ${classes.assessChip}`} />
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    Technologies that are promising and have clear potential value but need more evaluation.
                  </Typography>
                </Box>
                <Box mb={2}>
                  <Chip label="HOLD" className={`${classes.ringChip} ${classes.holdChip}`} />
                  <Typography variant="body2" style={{ marginTop: 8 }}>
                    Technologies not recommended for new projects. Existing usage should be reconsidered.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Technology Quadrants
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Languages & Frameworks:</strong> Programming languages, development frameworks, and runtime environments.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Tools:</strong> Development tools, deployment tools, and operational utilities.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Platforms:</strong> Infrastructure platforms, cloud services, and runtime platforms.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Techniques:</strong> Development practices, architectural patterns, and methodologies.
                </Typography>
              </Grid>
            </Grid>
          </InfoCard>
        </Box>
      </Content>
    </Page>
  );
};