# Configuration Variables & Secrets Management Strategy

## Architecture

### Production Environment
- **Google Secrets Manager**: Centralized storage for all sensitive credentials with versioning and audit capabilities
- **Cloud Run**: Seamlessly injects secrets as configuration variables at runtime
- **Firebase**: Leverages service account authentication for secure access

### Development Environment  
- **Local .env files**: Developer-specific configuration for local testing
- **Firebase emulators**: Provide offline development capabilities with local configuration
- **Template-based approach**: Example files guide developers in setting up their environment

## Environment Structure

The project uses a layered approach to environment configuration:

- **`config/env.template`**: Committed template showing all required variables with safe placeholder values
- **`config/dev.env`**: Development configuration values (git-ignored)
- **`config/prod.env`**: Production configuration values (git-ignored)

## Configuration Variable Categories

### Public Configuration
These values are safe to include in templates and documentation:
- Firebase project identification
- Development server ports
- Allowed CORS origins
- Feature flags
- Non-sensitive API endpoints

### Sensitive Credentials
These values are stored exclusively in Google Secrets Manager:
- JWT secrets for authentication
- Firebase service account credentials
- API keys and tokens
- OAuth client secrets
- Database connection strings

## Development Workflow

### Initial Setup
```bash
# Check prerequisites including Google Cloud SDK
./scripts/check-prerequisites.sh

# Run complete project setup
./scripts/init-all.sh

# Validate environment configuration
./scripts/validate-env.sh
```

### Environment Management
```bash
# Start development with Firebase emulators
./scripts/dev.sh

# Validate all required environment variables are set
./scripts/validate-env.sh
```

## Security Implementation

### Version Control
The `.gitignore` file ensures security by excluding:
- All `.env` files
- Firebase service account files
- Node modules and build outputs
- Local emulator data
- Any file containing actual secret values

### Template Files
The project includes `env.template` as a committed reference showing:
- All required environment variables
- Safe placeholder values
- Clear documentation for each variable
- Proper formatting examples

## Google Cloud Integration

### Secrets Manager Features
- **Automatic versioning**: Track changes to secrets over time
- **Access control**: IAM-based permissions for secret access
- **Audit logging**: Complete visibility into secret usage
- **Regional replication**: High availability for production secrets

### Cloud Run Deployment
- Secrets automatically mounted as environment variables
- No manual secret handling in production code
- Automatic rotation support
- Zero-downtime secret updates

## Firebase Configuration

### Service Account Management
- Development uses Firebase Admin SDK with local credentials
- Production uses Cloud Run's implicit authentication
- Emulators provide offline development without real credentials

### Multi-Environment Support
- Separate Firebase projects for development and production
- Environment-specific security rules
- Isolated data between environments

## Validation Tools

### Environment Validation Script
The `validate-env.sh` script provides:
- Comprehensive checks for all required variables
- Format validation for specific variable types
- Clear error messages for missing configuration
- Integration with the development workflow

## Best Practices

### Local Development
- Copy `.env.example` to `.env` for initial setup
- Update values with your development credentials
- Never commit actual secret values
- Use Firebase emulators for offline development

### Production Deployment
- All secrets managed through Google Secrets Manager
- Cloud Run handles secret injection automatically
- No manual secret management required
- Automated deployment through CI/CD pipelines

## GitHub App Environment Variables

When using the Claude GitHub App, the following environment variables may be configured:

### Optional GitHub App Configuration

```bash
# .github/workflows/claude-review.yml environment
CLAUDE_REVIEW_LEVEL=standard        # Options: minimal, standard, comprehensive
CLAUDE_AUTO_SUGGEST=true            # Enable automatic code suggestions
CLAUDE_SECURITY_SCAN=true           # Enable security vulnerability scanning
CLAUDE_PERFORMANCE_CHECK=true       # Enable performance analysis
```

### GitHub Actions Secrets

Configure these in your GitHub repository settings:

```bash
# Repository Settings > Secrets and variables > Actions
GOOGLE_CLOUD_PROJECT_ID            # Your GCP project ID
GOOGLE_CLOUD_SERVICE_ACCOUNT       # Service account for deployments
FIREBASE_PROJECT_ID                # Firebase project identifier
```

The Claude GitHub App handles its own authentication and doesn't require additional API keys.

This strategy ensures secure, scalable management of environment variables and secrets across all deployment environments while maintaining developer productivity.
