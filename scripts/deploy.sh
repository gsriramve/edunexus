#!/bin/bash
# ===========================================
# EduNexus Deployment Script
# ===========================================
# Usage: ./scripts/deploy.sh [web|api|all] [--skip-build]
#
# Examples:
#   ./scripts/deploy.sh all          # Build and deploy everything
#   ./scripts/deploy.sh web          # Build and deploy web only
#   ./scripts/deploy.sh api          # Build and deploy API only
#   ./scripts/deploy.sh all --skip-build  # Deploy without rebuilding

set -e

# Configuration
SSH_KEY="${SSH_KEY:-infrastructure/terraform/edunexus-key.pem}"
SERVER="${SERVER:-15.206.243.177}"
SSH_USER="${SSH_USER:-ec2-user}"
REMOTE_DIR="${REMOTE_DIR:-~/edunexus}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SERVICE="${1:-all}"
SKIP_BUILD=false

for arg in "$@"; do
    if [ "$arg" == "--skip-build" ]; then
        SKIP_BUILD=true
    fi
done

# Helper functions
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

# Check SSH key exists
check_ssh_key() {
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH key not found at $SSH_KEY"
        log_info "Set SSH_KEY environment variable or ensure the key exists"
        exit 1
    fi
}

# SSH helper
ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SERVER" "$@"
}

# SCP helper
scp_cmd() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$@"
}

# Sync files to server
sync_files() {
    log_info "Syncing files to server..."

    # Create a list of files to sync (excluding node_modules, .git, etc.)
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.next' \
        --exclude 'dist' \
        --exclude '.terraform' \
        --exclude '*.tfstate*' \
        --exclude '*.pem' \
        -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
        . "$SSH_USER@$SERVER:$REMOTE_DIR/"

    log_success "Files synced successfully"
}

# Clean up Docker on server
cleanup_docker() {
    log_info "Cleaning up Docker disk space..."
    ssh_cmd "docker system prune -af && docker builder prune -af" || true
    log_success "Docker cleanup complete"
}

# Build and deploy web
deploy_web() {
    log_info "Deploying web application..."

    if [ "$SKIP_BUILD" = false ]; then
        log_info "Building web container (this may take 5-7 minutes)..."
        ssh_cmd "cd $REMOTE_DIR && docker-compose build web"
    fi

    log_info "Starting web container..."
    ssh_cmd "cd $REMOTE_DIR && docker-compose up -d web"

    log_success "Web deployment complete"
}

# Build and deploy API
deploy_api() {
    log_info "Deploying API application..."

    if [ "$SKIP_BUILD" = false ]; then
        log_info "Building API container (this may take 7-10 minutes)..."
        ssh_cmd "cd $REMOTE_DIR && docker-compose build api"
    fi

    log_info "Starting API container..."
    ssh_cmd "cd $REMOTE_DIR && docker-compose up -d api"

    log_info "Running database migrations..."
    ssh_cmd "cd $REMOTE_DIR && docker-compose exec -T api npx prisma migrate deploy" || {
        log_warning "Migration failed, trying db push..."
        ssh_cmd "cd $REMOTE_DIR && docker-compose exec -T api npx prisma db push"
    }

    log_success "API deployment complete"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Check container status
    ssh_cmd "cd $REMOTE_DIR && docker-compose ps"

    # Health checks
    log_info "Running health checks..."

    if [ "$SERVICE" = "web" ] || [ "$SERVICE" = "all" ]; then
        if ssh_cmd "curl -sf http://localhost:3000 > /dev/null"; then
            log_success "Web application is healthy"
        else
            log_warning "Web application health check failed"
        fi
    fi

    if [ "$SERVICE" = "api" ] || [ "$SERVICE" = "all" ]; then
        if ssh_cmd "curl -sf http://localhost:3001/api/leads > /dev/null 2>&1"; then
            log_success "API is healthy"
        else
            log_warning "API health check returned non-200 (may be expected)"
        fi
    fi
}

# Main execution
main() {
    echo ""
    echo "==========================================="
    echo "  EduNexus Deployment Script"
    echo "==========================================="
    echo ""

    check_ssh_key

    log_info "Deploying service: $SERVICE"
    log_info "Skip build: $SKIP_BUILD"
    echo ""

    # Sync files first
    sync_files

    # Clean up Docker space
    cleanup_docker

    # Deploy based on service
    case "$SERVICE" in
        web)
            deploy_web
            ;;
        api)
            deploy_api
            ;;
        all)
            deploy_api
            deploy_web
            ;;
        *)
            log_error "Unknown service: $SERVICE"
            log_info "Valid options: web, api, all"
            exit 1
            ;;
    esac

    # Verify deployment
    verify_deployment

    echo ""
    log_success "Deployment completed successfully!"
    echo ""
    echo "  Web: http://$SERVER"
    echo "  API: http://$SERVER/api"
    echo ""
}

main
