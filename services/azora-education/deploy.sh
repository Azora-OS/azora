#!/bin/bash

# Azora Education Service Deployment Script
# This script handles the complete deployment of the Azora Education service

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="azora-education"
DOCKER_IMAGE="azora/education:latest"
DOCKER_CONTAINER="azora-education-app"
DOCKER_NETWORK="azora-network"
BACKUP_DIR="/opt/azora/backups"
LOG_DIR="/var/log/azora"
CONFIG_DIR="/etc/azora/education"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if Node.js is installed (for local development)
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed. Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    log_success "Dependencies check completed"
}

create_directories() {
    log_info "Creating necessary directories..."

    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $LOG_DIR
    sudo mkdir -p $CONFIG_DIR
    sudo mkdir -p /opt/azora/education/uploads
    sudo mkdir -p /opt/azora/education/cache
    sudo mkdir -p /opt/azora/education/temp

    # Set proper permissions
    sudo chown -R $USER:$USER /opt/azora/education
    sudo chown -R $USER:$USER $LOG_DIR

    log_success "Directories created successfully"
}

setup_docker_network() {
    log_info "Setting up Docker network..."

    if ! docker network ls | grep -q $DOCKER_NETWORK; then
        docker network create $DOCKER_NETWORK
        log_success "Docker network '$DOCKER_NETWORK' created"
    else
        log_info "Docker network '$DOCKER_NETWORK' already exists"
    fi
}

build_docker_image() {
    log_info "Building Docker image..."

    cd /workspaces/azora-os/services/azora-education

    # Build the Docker image
    docker build -t $DOCKER_IMAGE -f docker/Dockerfile .

    log_success "Docker image built successfully"
}

setup_environment() {
    log_info "Setting up environment configuration..."

    cd /workspaces/azora-os/services/azora-education

    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        log_warning "Environment file created from template. Please update .env with your configuration."
    fi

    # Copy environment to config directory
    sudo cp .env $CONFIG_DIR/

    log_success "Environment configuration completed"
}

start_services() {
    log_info "Starting Azora Education services..."

    cd /workspaces/azora-os/services/azora-education

    # Start with Docker Compose
    docker-compose up -d

    # Wait for services to be healthy
    log_info "Waiting for services to start..."
    sleep 30

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        docker-compose logs
        exit 1
    fi
}

run_database_migrations() {
    log_info "Running database migrations..."

    cd /workspaces/azora-os/services/azora-education

    # Run database initialization
    docker-compose exec app npm run migrate

    log_success "Database migrations completed"
}

seed_database() {
    log_info "Seeding database with initial data..."

    cd /workspaces/azora-os/services/azora-education

    # Seed the database
    docker-compose exec app npm run seed

    log_success "Database seeding completed"
}

setup_ssl() {
    log_info "Setting up SSL certificates..."

    # Check if certbot is available
    if command -v certbot &> /dev/null; then
        # Get SSL certificate
        sudo certbot certonly --webroot -w /opt/azora/education/public -d education.azora.world

        # Configure nginx for SSL
        sudo cp nginx/ssl.conf /etc/nginx/sites-available/azora-education
        sudo ln -sf /etc/nginx/sites-available/azora-education /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx

        log_success "SSL setup completed"
    else
        log_warning "Certbot not found. SSL setup skipped. Install certbot for SSL certificates."
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring..."

    # Install monitoring tools if not present
    if ! command -v htop &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y htop iotop ncdu
    fi

    # Setup log rotation
    sudo tee /etc/logrotate.d/azora-education > /dev/null <<EOF
/var/log/azora/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload azora-education
    endscript
}
EOF

    log_success "Monitoring setup completed"
}

create_backup_script() {
    log_info "Creating backup script..."

    sudo tee /usr/local/bin/azora-education-backup > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/azora/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="azora-education_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker exec azora-education-mongo mongodump --out /backup/$BACKUP_NAME

# Backup uploads
tar -czf $BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz /opt/azora/education/uploads

# Backup configuration
tar -czf $BACKUP_DIR/${BACKUP_NAME}_config.tar.gz /etc/azora/education

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "azora-education_*" -type d -mtime +30 -exec rm -rf {} +

echo "Backup completed: $BACKUP_NAME"
EOF

    sudo chmod +x /usr/local/bin/azora-education-backup

    # Setup cron job for automated backups
    (crontab -l ; echo "0 2 * * * /usr/local/bin/azora-education-backup") | crontab -

    log_success "Backup script created and scheduled"
}

run_health_checks() {
    log_info "Running health checks..."

    # Check if the application is responding
    if curl -f http://localhost:4200/health > /dev/null 2>&1; then
        log_success "Application health check passed"
    else
        log_error "Application health check failed"
        exit 1
    fi

    # Check database connectivity
    if docker-compose exec -T mongo mongo --eval "db.stats()" > /dev/null 2>&1; then
        log_success "Database health check passed"
    else
        log_error "Database health check failed"
        exit 1
    fi
}

show_deployment_info() {
    log_success "Azora Education Service deployed successfully!"
    echo ""
    echo "Service Information:"
    echo "==================="
    echo "Application URL: http://localhost:4200"
    echo "API Documentation: http://localhost:4200/api-docs"
    echo "Health Check: http://localhost:4200/health"
    echo ""
    echo "Container Status:"
    docker-compose ps
    echo ""
    echo "Logs:"
    echo "docker-compose logs -f"
    echo ""
    echo "Management Commands:"
    echo "Start: docker-compose up -d"
    echo "Stop: docker-compose down"
    echo "Restart: docker-compose restart"
    echo "Backup: sudo /usr/local/bin/azora-education-backup"
    echo ""
    echo "Configuration Files:"
    echo "Environment: /etc/azora/education/.env"
    echo "Logs: /var/log/azora/"
    echo "Backups: /opt/azora/backups/"
    echo ""
    log_warning "Remember to:"
    echo "1. Update the .env file with production values"
    echo "2. Configure SSL certificates for HTTPS"
    echo "3. Set up monitoring and alerting"
    echo "4. Configure firewall rules"
    echo "5. Set up log aggregation"
}

main() {
    echo "Azora Education Service Deployment"
    echo "=================================="

    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            create_directories
            setup_docker_network
            build_docker_image
            setup_environment
            start_services
            run_database_migrations
            seed_database
            setup_monitoring
            create_backup_script
            run_health_checks
            show_deployment_info
            ;;
        "start")
            log_info "Starting services..."
            cd /workspaces/azora-os/services/azora-education
            docker-compose up -d
            run_health_checks
            ;;
        "stop")
            log_info "Stopping services..."
            cd /workspaces/azora-os/services/azora-education
            docker-compose down
            ;;
        "restart")
            log_info "Restarting services..."
            cd /workspaces/azora-os/services/azora-education
            docker-compose restart
            run_health_checks
            ;;
        "backup")
            log_info "Running backup..."
            sudo /usr/local/bin/azora-education-backup
            ;;
        "logs")
            log_info "Showing logs..."
            cd /workspaces/azora-os/services/azora-education
            docker-compose logs -f
            ;;
        "status")
            log_info "Service status:"
            cd /workspaces/azora-os/services/azora-education
            docker-compose ps
            ;;
        "update")
            log_info "Updating services..."
            cd /workspaces/azora-os/services/azora-education
            git pull
            build_docker_image
            docker-compose up -d
            run_health_checks
            ;;
        *)
            echo "Usage: $0 {deploy|start|stop|restart|backup|logs|status|update}"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"