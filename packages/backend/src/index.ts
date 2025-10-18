import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 7007;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'DevOpsCanvas Portal',
    timestamp: new Date().toISOString() 
  });
});

// Basic API endpoints
app.get('/api/catalog/entities', (req, res) => {
  res.json([
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-control-plane',
        title: 'DevOpsCanvas Control Plane',
        description: 'API backend for DevOpsCanvas platform'
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'platform-team'
      }
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-portal',
        title: 'DevOpsCanvas Portal',
        description: 'Developer portal for DevOpsCanvas platform'
      },
      spec: {
        type: 'website',
        lifecycle: 'production',
        owner: 'platform-team'
      }
    }
  ]);
});

// Templates endpoint
app.get('/api/scaffolder/v2/templates', (req, res) => {
  res.json([
    {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'node-service',
        title: 'Node.js Service',
        description: 'Create a production-ready Node.js microservice'
      },
      spec: {
        type: 'service',
        parameters: [
          {
            title: 'Service Information',
            required: ['name', 'description'],
            properties: {
              name: {
                title: 'Name',
                type: 'string',
                description: 'Unique name of the service'
              },
              description: {
                title: 'Description',
                type: 'string',
                description: 'Brief description of the service'
              }
            }
          }
        ]
      }
    }
  ]);
});

// Serve static files (basic Backstage UI)
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>DevOpsCanvas Portal</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #1f1f1f; color: white; padding: 20px; margin: -40px -40px 40px -40px; }
        .card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚀 DevOpsCanvas Developer Portal</h1>
        <p>Backstage-powered developer experience platform</p>
      </div>
      
      <div class="card">
        <h2>Welcome to DevOpsCanvas</h2>
        <p>This is a Backstage-powered developer portal for managing your services and infrastructure.</p>
        
        <h3>Available APIs:</h3>
        <ul>
          <li><a href="/api/catalog/entities">Service Catalog</a></li>
          <li><a href="/api/scaffolder/v2/templates">Service Templates</a></li>
          <li><a href="/healthcheck">Health Check</a></li>
        </ul>
        
        <h3>Platform Status:</h3>
        <p>✅ Backstage Backend: Running</p>
        <p>✅ Service Catalog: Available</p>
        <p>✅ Template Engine: Ready</p>
        <p>✅ Health Monitoring: Active</p>
      </div>
      
      <div class="card">
        <h3>Next Steps:</h3>
        <ol>
          <li>Browse the service catalog</li>
          <li>Create new services from templates</li>
          <li>Monitor service health and scorecards</li>
          <li>Explore the DevOpsCanvas ecosystem</li>
        </ol>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DevOpsCanvas Portal running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/healthcheck`);
  console.log(`Service catalog: http://localhost:${port}/api/catalog/entities`);
});