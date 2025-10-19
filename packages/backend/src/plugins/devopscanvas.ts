import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { Router } from 'express';

export const devopscanvasModule = createBackendModule({
  pluginId: 'devopscanvas',
  moduleId: 'default',
  register(reg) {
    reg.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, logger }) {
        logger.info('Initializing DevOpsCanvas backend module');
        
        const router = Router();

  // DevOpsCanvas Platform Info API
  router.get('/api/devopscanvas/platform/info', (req, res) => {
    res.json({
      name: 'DevOpsCanvas Platform',
      version: '2.1.0',
      environment: 'production',
      features: {
        gitops: true,
        observability: true,
        security: true,
        finops: true
      },
      endpoints: {
        controlPlane: 'http://devopscanvas-control-plane.devopscanvas.svc.cluster.local:3000',
        argocd: 'https://argocd.devopscanvas.io',
        grafana: 'https://grafana.devopscanvas.io',
        prometheus: 'https://prometheus.devopscanvas.io'
      },
      statistics: {
        components: 5,
        systems: 1,
        apis: 3,
        templates: 3,
        users: 3,
        teams: 6
      }
    });
  });

  // DevOpsCanvas Golden Paths API
  router.get('/api/devopscanvas/golden-paths', (req, res) => {
    res.json([
      {
        name: 'microservice',
        title: 'Microservice',
        description: 'Standard microservice with observability and GitOps',
        template: 'devopscanvas-microservice',
        technologies: ['nodejs', 'kubernetes', 'prometheus'],
        maturity: 'stable',
        usage: 'high'
      },
      {
        name: 'frontend',
        title: 'Frontend Application',
        description: 'Modern frontend application with CI/CD',
        template: 'devopscanvas-frontend',
        technologies: ['react', 'typescript', 'kubernetes'],
        maturity: 'stable',
        usage: 'medium'
      },
      {
        name: 'infrastructure',
        title: 'Infrastructure Component',
        description: 'Infrastructure as Code with Terraform',
        template: 'devopscanvas-infrastructure',
        technologies: ['terraform', 'aws', 'kubernetes'],
        maturity: 'beta',
        usage: 'low'
      }
    ]);
  });

  // Tech Radar API
  router.get('/api/tech-radar', (req, res) => {
    res.json({
      rings: [
        { id: 'adopt', name: 'ADOPT', color: '#93c47d' },
        { id: 'trial', name: 'TRIAL', color: '#93d2c2' },
        { id: 'assess', name: 'ASSESS', color: '#fbdb84' },
        { id: 'hold', name: 'HOLD', color: '#efafa9' }
      ],
      quadrants: [
        { id: 'languages-frameworks', name: 'Languages & Frameworks' },
        { id: 'tools', name: 'Tools' },
        { id: 'platforms', name: 'Platforms' },
        { id: 'techniques', name: 'Techniques' }
      ],
      entries: [
        {
          id: 'kubernetes',
          title: 'Kubernetes',
          quadrant: 'platforms',
          ring: 'adopt',
          description: 'Container orchestration platform'
        },
        {
          id: 'typescript',
          title: 'TypeScript',
          quadrant: 'languages-frameworks',
          ring: 'adopt',
          description: 'Typed JavaScript for better development experience'
        },
        {
          id: 'backstage',
          title: 'Backstage',
          quadrant: 'tools',
          ring: 'adopt',
          description: 'Developer portal platform'
        },
        {
          id: 'argocd',
          title: 'ArgoCD',
          quadrant: 'tools',
          ring: 'adopt',
          description: 'GitOps continuous delivery'
        },
        {
          id: 'prometheus',
          title: 'Prometheus',
          quadrant: 'tools',
          ring: 'adopt',
          description: 'Monitoring and alerting'
        }
      ]
    });
  });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/api/devopscanvas',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

export default devopscanvasModule;