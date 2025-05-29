# Local Development Guide

## Overview

This guide provides patterns and best practices for local development of the TLS Portal system, including standalone testing, Firebase emulator usage, and development workflows.

## Development Environment Setup

### Port Configuration

The standard port allocation for local development:

| Service | Port | Description |
|---------|------|-------------|
| Frontend (React) | 3000 | Vite dev server for React app |
| Backend API | 3001 | Express server |
| Firebase Emulator UI | 4000 | Emulator suite dashboard |
| Firestore Emulator | 8080 | Database emulator |
| Auth Emulator | 9099 | Authentication emulator |
| Storage Emulator | 9199 | File storage emulator |

### Starting the Development Environment

#### Full Stack with Emulators
```bash
./scripts/dev-firebase.sh
```
This starts:
- Firebase emulators
- Backend API server
- Frontend development server

#### Without Emulators
```bash
./scripts/dev.sh
```
Starts only:
- Backend API server
- Frontend development server

#### Individual Services
```bash
yarn dev:backend    # Backend only
yarn dev:frontend   # Frontend only
yarn emulators      # Firebase emulators only
```

## Standalone Testing Patterns

### 1. Static HTML Test Pages

Create standalone HTML files for testing specific features without the full React build process:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Component Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your test content -->
    <script>
        const API_URL = 'http://localhost:3001/api';
        // Test code here
    </script>
</body>
</html>
```

**Benefits:**
- No build process required
- Fast iteration
- Direct API testing
- Isolated component development

### 2. API Health Checking

Implement automatic API status checking in test pages:

```javascript
async function checkAPI() {
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        // Update UI with status
    } catch (error) {
        // Show API not running message
    }
}

// Check periodically
setInterval(checkAPI, 5000);
```

### 3. Form Testing Patterns

#### Phone Number Formatting
```javascript
function formatPhone(input) {
    const numbers = input.replace(/\D/g, '');
    const match = numbers.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return input;
}

// Auto-format on input
document.querySelector('input[type="tel"]').addEventListener('input', (e) => {
    e.target.value = formatPhone(e.target.value);
});
```

#### Form Submission Pattern
```javascript
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(`${API_URL}/endpoint`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        // Handle response
    } catch (error) {
        // Handle error
    }
});
```

## Firebase Emulator Usage

### Configuration

The emulators are configured in `firebase.json`:
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Connecting to Emulators

#### From Backend Code
```javascript
if (process.env.USE_EMULATOR === 'true') {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}
```

#### From Frontend Code
```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (window.location.hostname === 'localhost') {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### Emulator UI Features

Access the emulator UI at `http://localhost:4000` to:
- View and edit Firestore data
- Manage test users
- Monitor security rules evaluation
- Import/export data

## Local Development Workflows

### 1. Component Development Workflow

1. Create standalone HTML test file
2. Implement component with mock data
3. Test against local API
4. Integrate into React app
5. Remove test file or move to examples

### 2. API Development Workflow

1. Start backend in watch mode
2. Use test HTML or REST client
3. Monitor logs for errors
4. Test with emulators
5. Verify with frontend

### 3. Full Stack Feature Workflow

1. Start all services with emulators
2. Create feature branch
3. Implement backend endpoint
4. Create/update frontend component
5. Test end-to-end flow
6. Verify in emulator UI

## SSL for Subdomain Testing

### Setting Up Local SSL

1. Install mkcert:
```bash
brew install mkcert  # macOS
mkcert -install
```

2. Generate certificates:
```bash
mkcert "*.localhost" localhost 127.0.0.1 ::1
```

3. Configure Vite for HTTPS:
```javascript
// vite.config.ts
export default {
  server: {
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    }
  }
}
```

### Testing Subdomains Locally

1. Add to `/etc/hosts`:
```
127.0.0.1 smit1234.localhost
127.0.0.1 john5678.localhost
```

2. Access via:
```
https://smit1234.localhost:3000
```

## Environment Variables

### Local Development Variables
```bash
# .env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
USE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
```

### Switching Environments
```bash
# Use different env files
cp config/dev.env .env      # Local development
cp config/staging.env .env   # Staging config
```

## Debugging Tips

### 1. Check Service Status
- Backend health: `http://localhost:3001/health`
- Emulator UI: `http://localhost:4000`
- Frontend: `http://localhost:3000`

### 2. Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
```

#### Emulator Connection Failed
- Ensure `USE_EMULATOR=true` is set
- Check emulator ports are free
- Verify Firebase project ID matches

#### CORS Errors
- Check `ALLOWED_ORIGINS` includes frontend URL
- Ensure credentials are included in requests

### 3. Logging

#### Backend Logging
```javascript
console.log('[API]', 'Request received:', req.method, req.path);
console.error('[ERROR]', error.message, error.stack);
```

#### Frontend Logging
```javascript
if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', data);
}
```

## Testing Strategies

### 1. Manual Testing with Static Pages
- Quick iteration on UI components
- Direct API endpoint testing
- Form validation testing

### 2. API Testing with REST Clients
- Use Postman, Insomnia, or curl
- Test authentication flows
- Verify error handling

### 3. End-to-End Testing
- Use Playwright or Cypress
- Test critical user flows
- Verify subdomain routing

## Performance Optimization

### 1. Development Build Optimization
```json
// vite.config.ts optimizations
{
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}
```

### 2. Mock Data Generation
```javascript
// Generate test clients
function generateTestClients(count) {
    return Array.from({ length: count }, (_, i) => ({
        firstName: `Test${i}`,
        lastName: `User${i}`,
        email: `test${i}@example.com`,
        mobile: `(555) 555-${String(i).padStart(4, '0')}`
    }));
}
```

## Best Practices

1. **Always use emulators** for local development
2. **Keep test files** in a dedicated directory
3. **Document API changes** in test files
4. **Use consistent ports** across the team
5. **Commit emulator exports** for test data
6. **Monitor console** for warnings
7. **Test offline scenarios** with emulators
8. **Use standalone pages** for rapid prototyping

## Troubleshooting Checklist

- [ ] All required services running?
- [ ] Correct environment variables set?
- [ ] Ports available and not blocked?
- [ ] Firebase emulators initialized?
- [ ] API health check passing?
- [ ] CORS configured correctly?
- [ ] SSL certificates valid (if using)?
- [ ] Browser cache cleared?

## Server Configuration Patterns

### What We Learned
- Compression middleware disabled due to TypeScript compatibility
- Trust proxy required for Cloud Run deployment
- Environment-based static file serving pattern

### Why This Works
- Progressive enhancement approach (compression can be re-enabled later)
- Cloud Run compatibility from day one
- Clear production vs development behavior

### Implementation Pattern
```typescript
// Trust proxy - required for Cloud Run
app.set('trust proxy', true);

// Compression - commented out due to TypeScript issue
// app.use(compression());

// Serve static files in production only
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../../../public');
  app.use(express.static(publicPath));
  
  // Catch all route - serve React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}
```

### Gotchas
- TypeScript issue with compression types prevents middleware use
- Static file serving only active in production mode
- Trust proxy setting critical for proper IP handling in Cloud Run

## Firebase Configuration Patterns

### What We Learned
- Environment-based initialization (production vs development)
- Automatic emulator detection via environment variables
- Single initialization guard pattern

### Why This Works
- Cloud Run uses automatic service account credentials
- Local development seamlessly connects to emulators
- Prevents double initialization errors

### Implementation Pattern
```typescript
let initialized = false;

export function initializeFirebase() {
  if (initialized) return;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Cloud Run automatically uses the service account credentials
      initializeApp();
    } else {
      // In development, use project ID and connect to emulators
      const projectId = process.env.FIREBASE_PROJECT_ID || 'tls-portal-dev';
      
      initializeApp({ projectId });
      
      // Connect to emulators if available
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log('Using Firestore emulator:', process.env.FIRESTORE_EMULATOR_HOST);
      }
    }
    
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}
```

### When to Use
- Always check FIRESTORE_EMULATOR_HOST for local development
- Use default credentials in production environments
- Initialize once at server startup, not per request