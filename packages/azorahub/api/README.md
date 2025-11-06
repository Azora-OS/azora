# Azorahub REST API

The comprehensive REST API for Azorahub - The Living Operating System ecosystem.

## Overview

Azorahub REST API provides programmatic access to all Azorahub features, including repository management, user operations, AI services, and analytics. Built with modern development practices and comprehensive security.

## 🚀 Key Features

### Core Functionality
- **Repository Management**: Full CRUD operations for repositories
- **User Management**: Authentication, profiles, and permissions
- **Issue & PR Tracking**: Complete issue and pull request lifecycle
- **Branch Management**: Create, merge, and manage branches
- **CI/CD Integration**: Build, test, and deployment pipelines

### AI-Powered Services
- **Code Completion**: Intelligent code suggestions
- **Code Explanation**: AI-powered code analysis and documentation
- **Bug Detection**: Automated vulnerability and issue detection
- **Code Review**: AI-assisted code review and recommendations

### Analytics & Insights
- **Repository Analytics**: Comprehensive metrics and insights
- **User Analytics**: Activity patterns and contributions
- **Performance Metrics**: System performance and health monitoring
- **Business Intelligence**: Advanced analytics for decision making

### Security Features
- **OAuth 2.0 Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Vulnerability Scanning**: Automated security vulnerability detection
- **Audit Logging**: Comprehensive audit trail for all operations

## 📚 Documentation

### Getting Started

1. **Create an Account**: Sign up at [azorahub.com](https://azorahub.com)
2. **Generate API Token**: Create a personal access token in settings
3. **Make Your First Request**: Use the token to authenticate requests

### Authentication

```bash
# Using curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.azorahub.com/v1/user

# Using JavaScript
const response = await fetch('https://api.azorahub.com/v1/user', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### Quick Examples

#### List Your Repositories
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.azorahub.com/v1/repos?type=owner&sort=updated"
```

#### Create a New Repository
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-awesome-project",
    "description": "An awesome project built with Azorahub",
    "private": false,
    "auto_init": true
  }' \
  https://api.azorahub.com/v1/repos
```

#### Get AI Code Completion
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "function calculateArea(radius) {",
    "language": "javascript",
    "max_tokens": 100
  }' \
  https://api.azorahub.com/v1/ai/complete
```

## 🔧 SDKs & Libraries

Official SDKs are available for:

### JavaScript/TypeScript
```bash
npm install @azorahub/api
```

```javascript
import { AzorahubAPI } from '@azorahub/api';

const api = new AzorahubAPI({ token: 'YOUR_TOKEN' });
const repos = await api.repos.list({ type: 'owner' });
```

### Python
```bash
pip install azorahub-api
```

```python
from azorahub import AzorahubAPI

api = AzorahubAPI(token='YOUR_TOKEN')
repos = api.repos.list(type='owner')
```

### Go
```bash
go get github.com/azorahub/go-api
```

```go
import "github.com/azorahub/go-api"

client := azorahub.NewClient("YOUR_TOKEN")
repos, err := client.Repositories.List(context.Background(), nil)
```

### Rust
```bash
cargo add azorahub-api
```

```rust
use azorahub_api::AzorahubClient;

let client = AzorahubClient::new("YOUR_TOKEN");
let repos = client.repositories().list().await?;
```

### Java
```xml
<dependency>
    <groupId>com.azorahub</groupId>
    <artifactId>azorahub-api</artifactId>
    <version>1.0.0</version>
</dependency>
```

```java
AzorahubClient client = new AzorahubClient("YOUR_TOKEN");
List<Repository> repos = client.repositories().list();
```

## 📊 Rate Limits

| Plan | Requests per Hour | Concurrent Requests |
|------|-------------------|---------------------|
| Free | 1,000 | 10 |
| Pro | 5,000 | 50 |
| Enterprise | 50,000 | 500 |

Rate limit headers are included in every response:
- `X-RateLimit-Limit`: Your rate limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## 🛡️ Security

### Best Practices
- **Use HTTPS**: Always communicate over HTTPS
- **Secure Token Storage**: Never expose tokens in client-side code
- **Least Privilege**: Use tokens with minimal required scopes
- **Token Rotation**: Regularly rotate your access tokens
- **Monitor Usage**: Keep track of API usage and unusual activity

### Supported Scopes
- `repo`: Full repository access
- `read:repo`: Read-only repository access
- `user`: User profile access
- `admin:org`: Organization administration
- `ai`: AI services access
- `analytics`: Analytics and metrics access

## 🌍 Endpoints

### Base URLs
- **Production**: `https://api.azorahub.com/v1`
- **Staging**: `https://staging-api.azorahub.com/v1`
- **Development**: `http://localhost:3000/v1`

### API Reference

#### User Management
- `GET /user` - Get authenticated user
- `GET /user/{username}` - Get user by username
- `PATCH /user` - Update user profile

#### Repositories
- `GET /repos` - List repositories
- `POST /repos` - Create repository
- `GET /repos/{owner}/{repo}` - Get repository
- `PATCH /repos/{owner}/{repo}` - Update repository
- `DELETE /repos/{owner}/{repo}` - Delete repository

#### Issues & Pull Requests
- `GET /repos/{owner}/{repo}/issues` - List issues
- `POST /repos/{owner}/{repo}/issues` - Create issue
- `GET /repos/{owner}/{repo}/pulls` - List pull requests
- `POST /repos/{owner}/{repo}/pulls` - Create pull request

#### AI Services
- `POST /ai/complete` - Code completion
- `POST /ai/explain` - Explain code
- `POST /ai/analyze` - Analyze code for issues
- `POST /ai/review` - Code review suggestions

#### Analytics
- `GET /analytics/repos/{owner}/{repo}` - Repository analytics
- `GET /analytics/users/{username}` - User analytics
- `GET /analytics/orgs/{org}` - Organization analytics

## 🧪 Testing

### Sandbox Environment
Test your integration in our sandbox environment:
- **URL**: `https://sandbox-api.azorahub.com/v1`
- **Authentication**: Use sandbox tokens
- **Data**: Isolated test data that resets daily

### Test Data Generator
Use our test data generator to create realistic test scenarios:
```bash
curl -X POST \
  -H "Authorization: Bearer SANDBOX_TOKEN" \
  https://sandbox-api.azorahub.com/v1/test/generate-data \
  -d '{"type": "repository", "count": 10}'
```

## 📈 Monitoring & Debugging

### Request Tracing
Every API request includes a unique request ID in the `X-Request-ID` header. Use this ID for debugging and support requests.

### Webhooks
Configure webhooks to receive real-time notifications:
- Repository events (push, fork, star)
- Issue and PR events
- User activity events
- System events

### Status Monitoring
Check API status and uptime:
- **Status Page**: [status.azorahub.com](https://status.azorahub.com)
- **API Health**: `https://api.azorahub.com/v1/health`
- **Incident History**: Available on status page

## 🆘 Support

### Getting Help
- **Documentation**: [docs.azorahub.com/api](https://docs.azorahub.com/api)
- **API Reference**: [api.azorahub.com/docs](https://api.azorahub.com/docs)
- **Community Forum**: [community.azorahub.com](https://community.azorahub.com)
- **Discord**: [discord.azorahub.com](https://discord.azorahub.com)

### Reporting Issues
- **Bug Reports**: [GitHub Issues](https://github.com/azorahub/api/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/azorahub/api/discussions)
- **Security Issues**: security@azorahub.com

### Contact
- **Email**: api-support@azorahub.com
- **Twitter**: @azorahubapi
- **Support Portal**: [support.azorahub.com](https://support.azorahub.com)

## 📄 License

This API is available under the MIT License. See [LICENSE](./LICENSE) for details.

---

**Built with ❤️ by the Azorahub Team**
