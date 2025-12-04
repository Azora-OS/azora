# Setup AWS Secrets Manager
Write-Host "🔐 Setting up AWS Secrets Manager..." -ForegroundColor Cyan

# Check AWS CLI
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found. Install from: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Check credentials
Write-Host "Checking AWS credentials..." -ForegroundColor Yellow
aws sts get-caller-identity | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ AWS credentials not configured" -ForegroundColor Red
    exit 1
}

Write-Host "✅ AWS credentials valid" -ForegroundColor Green

# Load .env file
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Loaded .env file" -ForegroundColor Green
} else {
    Write-Host "⚠️ No .env file found" -ForegroundColor Yellow
}

# Create secrets
$secrets = @(
    @{name="azora/database/url"; env="DATABASE_URL"},
    @{name="azora/jwt/secret"; env="JWT_SECRET"},
    @{name="azora/stripe/secret"; env="STRIPE_SECRET_KEY"},
    @{name="azora/openai/key"; env="OPENAI_API_KEY"},
    @{name="azora/supabase/key"; env="SUPABASE_SERVICE_ROLE_KEY"}
)

foreach ($secret in $secrets) {
    $value = [Environment]::GetEnvironmentVariable($secret.env)
    if ($value) {
        Write-Host "Creating secret: $($secret.name)..." -ForegroundColor Yellow
        aws secretsmanager create-secret --name $secret.name --secret-string $value 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Created: $($secret.name)" -ForegroundColor Green
        } else {
            aws secretsmanager update-secret --secret-id $secret.name --secret-string $value
            Write-Host "🔄 Updated: $($secret.name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️ Skipping $($secret.name) - no value in .env" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ AWS Secrets setup complete!" -ForegroundColor Green
