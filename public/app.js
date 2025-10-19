// DevOpsCanvas Portal Frontend JavaScript

let platformData = null;
let goldenPaths = [];
let techRadar = null;
let catalogEntities = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadPlatformData();
    showPage('dashboard');
});

// Load platform data from APIs
async function loadPlatformData() {
    try {
        // Load platform info
        const platformResponse = await fetch('/api/devopscanvas/platform/info');
        platformData = await platformResponse.json();
        updateDashboardStats();
        
        // Load golden paths
        const pathsResponse = await fetch('/api/devopscanvas/golden-paths');
        goldenPaths = await pathsResponse.json();
        updateGoldenPaths();
        
        // Load tech radar
        const radarResponse = await fetch('/api/tech-radar');
        techRadar = await radarResponse.json();
        updateTechRadar();
        
        // Load catalog entities
        const catalogResponse = await fetch('/api/catalog/entities');
        catalogEntities = await catalogResponse.json();
        updateCatalog();
        
    } catch (error) {
        console.error('Failed to load platform data:', error);
        showError('Failed to load platform data. Please refresh the page.');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    if (!platformData || !platformData.statistics) return;
    
    const stats = platformData.statistics;
    document.getElementById('components-count').textContent = stats.components || 0;
    document.getElementById('templates-count').textContent = stats.templates || 0;
    document.getElementById('systems-count').textContent = stats.systems || 0;
    document.getElementById('apis-count').textContent = stats.apis || 0;
    document.getElementById('users-count').textContent = stats.users || 0;
    document.getElementById('teams-count').textContent = stats.teams || 0;
}

// Update golden paths display
function updateGoldenPaths() {
    const container = document.getElementById('golden-paths-grid');
    if (!container || !goldenPaths.length) return;
    
    container.innerHTML = goldenPaths.map(path => `
        <div class="feature-card">
            <div class="material-icons feature-icon">${getPathIcon(path.name)}</div>
            <div class="feature-title">${path.title || path.name}</div>
            <div class="feature-description">${path.description}</div>
            <div style="margin: 16px 0;">
                <span class="chip ${path.maturity || 'stable'}">${(path.maturity || 'stable').toUpperCase()}</span>
                <span style="margin-left: 8px; font-size: 12px; color: #666;">
                    Usage: ${path.usage || 'medium'}
                </span>
            </div>
            <div style="margin-bottom: 16px;">
                ${(path.technologies || []).map(tech => 
                    `<span style="display: inline-block; background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 11px; margin: 2px;">${tech}</span>`
                ).join('')}
            </div>
            <a href="/create/templates/default/template/${path.template}" class="feature-link">
                Use Template
                <span class="material-icons">arrow_forward</span>
            </a>
        </div>
    `).join('');
}

// Update tech radar display
function updateTechRadar() {
    const container = document.getElementById('tech-radar-content');
    if (!container || !techRadar || !techRadar.entries) return;
    
    container.innerHTML = techRadar.entries.map(entry => `
        <div class="table-row">
            <div>
                <div style="font-weight: 500; margin-bottom: 4px;">${entry.title}</div>
                <div style="font-size: 12px; color: #666;">${entry.description}</div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ${entry.quadrant.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
            </div>
            <span class="chip ${entry.ring}">${entry.ring.toUpperCase()}</span>
        </div>
    `).join('');
}

// Update service catalog display
function updateCatalog() {
    const container = document.getElementById('catalog-content');
    if (!container || !catalogEntities.length) return;
    
    container.innerHTML = catalogEntities.map(entity => `
        <div class="table-row">
            <div>
                <div style="font-weight: 500; margin-bottom: 4px;">
                    ${entity.metadata.title || entity.metadata.name}
                </div>
                <div style="font-size: 12px; color: #666;">
                    ${entity.metadata.description || 'No description available'}
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px;">
                    ${entity.kind} • ${entity.spec?.type || 'Unknown'} • ${entity.spec?.lifecycle || 'Unknown'}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 11px; color: #666;">Owner</div>
                <div style="font-size: 12px; font-weight: 500;">${entity.spec?.owner || 'Unknown'}</div>
            </div>
        </div>
    `).join('');
}

// Get icon for golden path
function getPathIcon(pathName) {
    const icons = {
        'microservice': 'code',
        'frontend': 'web',
        'infrastructure': 'cloud'
    };
    return icons[pathName] || 'extension';
}

// Show specific page
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageId + '-page');
    if (page) {
        page.classList.remove('hidden');
    }
    
    // Add active class to selected nav item
    const navItem = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'dashboard': 'DevOpsCanvas Platform Dashboard',
        'golden-paths': 'Golden Paths',
        'tech-radar': 'Technology Radar',
        'catalog': 'Service Catalog',
        'create': 'Create Service',
        'api-docs': 'API Documentation',
        'docs': 'Documentation',
        'security': 'Security',
        'finops': 'FinOps'
    };
    
    document.getElementById('page-title').textContent = titles[pageId] || 'DevOpsCanvas Portal';
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const content = document.querySelector('.content');
    content.insertBefore(errorDiv, content.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Handle navigation clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('[onclick*="showPage"]')) {
        e.preventDefault();
        const match = e.target.getAttribute('onclick').match(/showPage\('([^']+)'\)/);
        if (match) {
            showPage(match[1]);
        }
    }
});

// Auto-refresh data every 5 minutes
setInterval(loadPlatformData, 5 * 60 * 1000);