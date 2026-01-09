#!/bin/bash
# EduNexus EC2 Bootstrap Script
# This script runs on first boot to set up the server

set -e

# Log output
exec > >(tee /var/log/user-data.log) 2>&1
echo "Starting EduNexus server setup at $(date)"

# Update system
echo "Updating system packages..."
dnf update -y

# Install Docker
echo "Installing Docker..."
dnf install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
echo "Installing Nginx..."
dnf install -y nginx
systemctl enable nginx

# Install PostgreSQL client
echo "Installing PostgreSQL client..."
dnf install -y postgresql15

# Install Git
echo "Installing Git..."
dnf install -y git

# Install certbot for SSL
echo "Installing Certbot..."
dnf install -y certbot python3-certbot-nginx

# Create app directory
echo "Creating application directory..."
mkdir -p /home/ec2-user/edunexus
chown ec2-user:ec2-user /home/ec2-user/edunexus

# Create environment file with database credentials
echo "Creating environment file..."
cat > /home/ec2-user/edunexus/.env << 'ENVEOF'
# Database
DATABASE_URL=postgresql://${db_username}:${db_password}@${db_host}:5432/${db_name}?schema=public

# Redis (Docker internal)
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# API Configuration
PORT=3001
NODE_ENV=production
ML_SERVICE_URL=http://ml-service:8000

# AWS S3
AWS_REGION=${aws_region}
AWS_S3_BUCKET=${s3_bucket}

# Web URLs (update after domain setup)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk Authentication (add your keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Email (add your SendGrid key)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@edunexus.io

# Payments (add your Razorpay keys)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=

# AI Services (add your keys)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ENVEOF

chown ec2-user:ec2-user /home/ec2-user/edunexus/.env
chmod 600 /home/ec2-user/edunexus/.env

# Create Nginx configuration
echo "Configuring Nginx..."
cat > /etc/nginx/conf.d/edunexus.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    # Increase max body size for file uploads
    client_max_body_size 100M;

    # Web app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    # ML Service (internal, optional external access)
    location /ml {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

# Test and start Nginx
nginx -t
systemctl start nginx

# Create helper scripts
echo "Creating helper scripts..."

# Deploy script
cat > /home/ec2-user/deploy.sh << 'DEPLOYEOF'
#!/bin/bash
set -e
cd /home/ec2-user/edunexus

echo "Pulling latest code..."
git pull origin main

echo "Building Docker images..."
docker-compose --profile app build

echo "Starting services..."
docker-compose --profile app up -d

echo "Checking service status..."
docker-compose ps

echo "Deployment complete!"
DEPLOYEOF
chmod +x /home/ec2-user/deploy.sh
chown ec2-user:ec2-user /home/ec2-user/deploy.sh

# SSL setup script
cat > /home/ec2-user/setup-ssl.sh << 'SSLEOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./setup-ssl.sh your-domain.com"
    exit 1
fi
DOMAIN=$1
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
echo "SSL configured for $DOMAIN"
SSLEOF
chmod +x /home/ec2-user/setup-ssl.sh
chown ec2-user:ec2-user /home/ec2-user/setup-ssl.sh

# Database restore script
cat > /home/ec2-user/restore-db.sh << 'RESTOREEOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: ./restore-db.sh backup-file.dump"
    exit 1
fi
BACKUP_FILE=$1
source /home/ec2-user/edunexus/.env
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
echo "Restoring database from $BACKUP_FILE to $DB_HOST..."
pg_restore -h $DB_HOST -U ${db_username} -d ${db_name} -F c $BACKUP_FILE
echo "Database restored!"
RESTOREEOF
chmod +x /home/ec2-user/restore-db.sh
chown ec2-user:ec2-user /home/ec2-user/restore-db.sh

echo "Setup complete at $(date)"
echo "Next steps:"
echo "1. Clone the repository: cd ~/edunexus && git clone https://github.com/gsriramve/edunexus.git ."
echo "2. Update .env with your API keys"
echo "3. Run ./deploy.sh to start the application"
