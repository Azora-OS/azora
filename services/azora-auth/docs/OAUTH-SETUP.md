# OAuth Integration Setup

## Supported Providers

- Google OAuth 2.0
- GitHub OAuth

## Configuration

### Environment Variables

Add to `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4004/api/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:4004/api/oauth/github/callback
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:4004/api/oauth/google/callback` (dev)
   - `https://yourdomain.com/api/oauth/google/callback` (prod)
6. Copy Client ID and Client Secret to `.env`

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: Azora
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:4004/api/oauth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## OAuth Flow

### Google Login

```
1. User clicks "Login with Google"
2. Redirect to: GET /api/oauth/google
3. User authorizes on Google
4. Google redirects to: GET /api/oauth/google/callback?code=...
5. Server exchanges code for tokens
6. Server returns JWT tokens and user info
```

### GitHub Login

```
1. User clicks "Login with GitHub"
2. Redirect to: GET /api/oauth/github
3. User authorizes on GitHub
4. GitHub redirects to: GET /api/oauth/github/callback?code=...
5. Server exchanges code for tokens
6. Server returns JWT tokens and user info
```

## API Endpoints

### Initiate Google OAuth
```
GET /api/oauth/google
```

### Google Callback
```
GET /api/oauth/google/callback?code=...
Response: { accessToken, refreshToken, user }
```

### Initiate GitHub OAuth
```
GET /api/oauth/github
```

### GitHub Callback
```
GET /api/oauth/github/callback?code=...
Response: { accessToken, refreshToken, user }
```

## Error Handling

All OAuth endpoints return errors in format:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Testing

Test OAuth flow locally:
1. Start auth service: `npm start`
2. Navigate to: `http://localhost:4004/api/oauth/google`
3. Complete OAuth flow
4. Verify JWT tokens returned
