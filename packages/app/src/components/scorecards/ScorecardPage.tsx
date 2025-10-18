import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import {
  Page,
  Header,
  Content,
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { CheckCircle, Error, Warning } from '@material-ui/icons';

interface Scorecard {
  service: string;
  score: number;
  metrics: {
    security: number;
    reliability: number;
    performance: number;
    maintainability: number;
  };
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    score: number;
  }>;
  lastUpdated: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass':
      return <CheckCircle style={{ color: '#4caf50' }} />;
    case 'fail':
      return <Error style={{ color: '#f44336' }} />;
    case 'warning':
      return <Warning style={{ color: '#ff9800' }} />;
    default:
      return null;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  return '#f44336';
};

export const ScorecardPage = () => {
  const configApi = useApi(configApiRef);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = configApi.getOptionalString('devopscanvas.apiBaseUrl') || 
    'http://localhost:3000';

  useEffect(() => {
    const fetchScorecards = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/scorecards`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setScorecards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scorecards');
      } finally {
        setLoading(false);
      }
    };

    fetchScorecards();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Service Scorecards" />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Service Scorecards" />
        <Content>
          <ResponseErrorPanel error={new Error(error)} />
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header title="Service Scorecards" subtitle="Track service quality and compliance" />
      <Content>
        <ContentHeader title="Scorecards Overview">
          <Typography variant="body1">
            Monitor service quality across security, reliability, performance, and maintainability
          </Typography>
        </ContentHeader>

        <Grid container spacing={3}>
          {scorecards.map((scorecard) => (
            <Grid item lg={6} md={12} xs={12} key={scorecard.service}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="h3">
                      {scorecard.service}
                    </Typography>
                    <Chip
                      label={`${scorecard.score}%`}
                      style={{
                        backgroundColor: getScoreColor(scorecard.score),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Security
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={scorecard.metrics.security}
                        style={{ marginBottom: 8 }}
                      />
                      <Typography variant="caption">
                        {scorecard.metrics.security}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Reliability
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={scorecard.metrics.reliability}
                        style={{ marginBottom: 8 }}
                      />
                      <Typography variant="caption">
                        {scorecard.metrics.reliability}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Performance
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={scorecard.metrics.performance}
                        style={{ marginBottom: 8 }}
                      />
                      <Typography variant="caption">
                        {scorecard.metrics.performance}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Maintainability
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={scorecard.metrics.maintainability}
                        style={{ marginBottom: 8 }}
                      />
                      <Typography variant="caption">
                        {scorecard.metrics.maintainability}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recent Checks
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Check</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Score</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scorecard.checks.slice(0, 3).map((check, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  {getStatusIcon(check.status)}
                                  <Typography variant="body2" style={{ marginLeft: 8 }}>
                                    {check.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="textSecondary">
                                  {check.message}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {check.score}%
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  <Typography variant="caption" color="textSecondary" style={{ marginTop: 16 }}>
                    Last updated: {new Date(scorecard.lastUpdated).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {scorecards.length === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="textSecondary">
                No scorecards available
              </Typography>
              <Typography variant="body2" align="center" color="textSecondary">
                Deploy some services to see their quality scorecards here
              </Typography>
            </CardContent>
          </Card>
        )}
      </Content>
    </Page>
  );
};