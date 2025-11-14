# E-Commerce Product Listing Module

A full-stack eCommerce product listing application built with React frontend, Laravel backend API, and PostgreSQL database.

## 📁 Project Structure

```
e-commerce/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/   # API Controllers (ProductController, AuthController)
│   │   │   ├── Requests/       # Form Validation (ProductRequest, LoginRequest, RegisterRequest)
│   │   │   └── Resources/     # API Resources (ProductResource)
│   │   ├── Models/             # Eloquent Models (Product, User)
│   │   └── Traits/             # Reusable Traits (ResponseFormatter)
│   ├── database/
│   │   ├── migrations/         # Database Migrations
│   │   ├── factories/          # Model Factories
│   │   └── seeders/            # Database Seeders
│   ├── routes/
│   │   └── api.php             # API Routes
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           └── products/   # Product Images Storage
│   └── public/                 # Public Directory
│
├── frontend/                   # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/           # API Services
│   │   │   └── api.js
│   │   ├── App.jsx             # Main App Component
│   │   └── main.jsx            # Entry Point
│   ├── package.json
│   └── vite.config.js
│
└── README.md                   # This file
```

## 🚀 How to Run the Project

### Prerequisites

- **PHP 8.2+** with extensions: pgsql, mbstring, xml, gd, curl, bcmath
- **Composer** (PHP package manager)
- **Node.js 18+** and npm
- **PostgreSQL** database
- **Git**

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install PHP dependencies:**

```bash
composer install
```

3. **Copy environment file:**

```bash
cp .env.example .env
```

4. **Generate application key:**

```bash
php artisan key:generate
```

5. **Configure database in `.env` file:**

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. **Run migrations:**

```bash
php artisan migrate
```

7. **Seed database (creates 20 sample products with images):**

```bash
php artisan db:seed
```

8. **Create storage symlink (required for image uploads):**

```bash
php artisan storage:link
```

9. **Start development server:**

```bash
php artisan serve
```

Backend API will be available at: `http://localhost:8000/api`

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Testing the Application

1. **Open browser:** `http://localhost:3000`
2. **View products:** Product listing is public (no login required)
3. **Add product:** Click "Add Product" → Login/Register → Fill form → Submit
4. **Test API directly:**

```bash
# Get all products
curl http://localhost:8000/api/products

# Register user
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## ☁️ AWS Deployment Guide

### Architecture Overview

```
Internet
   │
   ▼
┌─────────────────────┐
│   CloudFront (CDN)   │
│  - Frontend (S3)     │
│  - Product Images    │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│   EC2 Instance      │
│  - Laravel API      │
│  - Nginx            │
│  - PHP-FPM          │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────┐
│   RDS PostgreSQL    │
│  - Product Database │
└─────────────────────┘

┌─────────────────────┐
│   S3 Buckets        │
│  - Frontend Files   │
│  - Product Images   │
└─────────────────────┘
```

### Step 1: RDS PostgreSQL Setup

1. **Create RDS Instance:**

   - Go to AWS Console → RDS → Create database
   - Engine: PostgreSQL 15.4
   - Template: Free tier (dev) or Production
   - Instance class: `db.t3.micro` (free tier) or `db.t3.small` (production)
   - Storage: 20 GB General Purpose SSD
   - Database name: `ecommerce`
   - Master username: `admin`
   - Master password: [Generate strong password]
   - Public access: Yes (for development) / No (for production)
   - Create database

2. **Configure Security Group:**

   - Create security group: `rds-sg`
   - Add inbound rule: PostgreSQL (port 5432) from EC2 security group

3. **Note connection details:**
   - Endpoint: `ecommerce-db.xxxxx.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `ecommerce`

### Step 2: EC2 Instance Setup

1. **Launch EC2 Instance:**

   - Go to AWS Console → EC2 → Launch instance
   - Name: `ecommerce-backend`
   - AMI: Amazon Linux 2023
   - Instance type: `t3.small` (2 vCPU, 2GB RAM)
   - Key pair: Create new or use existing
   - Network settings: Allow HTTP (80), HTTPS (443), SSH (22)
   - Storage: 20 GB gp3
   - Launch instance

2. **Create Security Group:**

   - Name: `ec2-backend-sg`
   - Inbound rules:
     - SSH (22) from your IP
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0

3. **Connect to EC2:**

```bash
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
```

4. **Install Dependencies on EC2:**

```bash
# Update system
sudo yum update -y

# Install PHP 8.2
sudo amazon-linux-extras enable php8.2
sudo yum install -y php php-cli php-fpm php-mbstring php-xml php-pgsql php-zip php-gd php-curl php-bcmath

# Install Composer
cd ~
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Install Nginx
sudo yum install -y nginx

# Install Git
sudo yum install -y git
```

5. **Deploy Application:**

```bash
# Create application directory
sudo mkdir -p /var/www/ecommerce-backend
sudo chown ec2-user:ec2-user /var/www/ecommerce-backend

# Clone repository (or upload files via SCP)
cd /var/www/ecommerce-backend
git clone <your-repo-url> .

# Install dependencies
composer install --optimize-autoloader --no-dev

# Configure environment
cp .env.example .env
nano .env
```

6. **Update `.env` file:**

```env
APP_NAME="E-Commerce API"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://<EC2-PUBLIC-IP>

DB_CONNECTION=pgsql
DB_HOST=<RDS-ENDPOINT>
DB_PORT=5432
DB_DATABASE=ecommerce
DB_USERNAME=admin
DB_PASSWORD=<RDS-PASSWORD>

FILESYSTEM_DISK=public
```

7. **Run Setup Commands:**

```bash
# Generate key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R nginx:nginx /var/www/ecommerce-backend
sudo chmod -R 755 /var/www/ecommerce-backend
sudo chmod -R 775 /var/www/ecommerce-backend/storage
sudo chmod -R 775 /var/www/ecommerce-backend/bootstrap/cache
```

8. **Configure Nginx:**

```bash
sudo nano /etc/nginx/conf.d/ecommerce.conf
```

Add configuration:

```nginx
server {
    listen 80;
    server_name <EC2-PUBLIC-IP> api.yourdomain.com;
    root /var/www/ecommerce-backend/public;
    index index.php;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm/php-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Remove default config
sudo rm /etc/nginx/conf.d/default.conf

# Test configuration
sudo nginx -t

# Start services
sudo systemctl start php-fpm
sudo systemctl enable php-fpm
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: S3 Setup

1. **Create S3 Bucket for Frontend:**

   - Go to S3 → Create bucket
   - Name: `ecommerce-frontend-[unique-id]`
   - Region: `us-east-1`
   - Uncheck "Block all public access"
   - Enable static website hosting:
     - Index document: `index.html`
     - Error document: `index.html`

2. **Bucket Policy (for public access):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ecommerce-frontend-*/*"
    }
  ]
}
```

3. **Create S3 Bucket for Images:**

   - Name: `ecommerce-product-images-[unique-id]`
   - Keep public access blocked (we'll use CloudFront)

4. **CORS Configuration for Images Bucket:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

5. **Create IAM User for S3 Access:**

   - Go to IAM → Users → Create user
   - Name: `ecommerce-s3-user`
   - Attach policy with S3 permissions
   - Save Access Key ID and Secret Access Key

6. **Update Backend `.env` with S3 credentials:**

```env
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_KEY>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=ecommerce-product-images-[unique-id]
```

### Step 4: CloudFront Distribution

1. **Create Distribution for Frontend:**

   - Go to CloudFront → Create distribution
   - Origin domain: Select your frontend S3 bucket
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Default root object: `index.html`
   - Custom error responses:
     - 403 → `/index.html` → 200
     - 404 → `/index.html` → 200
   - Create distribution

2. **Create Distribution for Images (Optional):**
   - Create another distribution for product images bucket
   - Similar configuration

### Step 5: Deploy Frontend

1. **Build React Application:**

```bash
cd frontend
npm install
npm run build
```

2. **Upload to S3:**

```bash
# Install AWS CLI
aws configure

# Upload build files
aws s3 sync dist/ s3://ecommerce-frontend-[unique-id] --delete
```

3. **Update Backend CORS:**
   - Update `FRONTEND_URL` in `.env` with CloudFront URL

### Step 6: Domain & SSL (Optional)

1. **Request SSL Certificate (ACM):**

   - Go to Certificate Manager → Request certificate
   - Domain: `api.yourdomain.com` and `www.yourdomain.com`
   - Validation: DNS validation

2. **Update CloudFront:**

   - Add custom domain to distribution
   - Select ACM certificate

3. **Update Route 53 (if using AWS DNS):**
   - Create A record pointing to CloudFront

### Step 7: Monitoring & Maintenance

1. **CloudWatch Setup:**

   - Monitor EC2 metrics (CPU, Memory)
   - Monitor RDS metrics
   - Set up alarms for high CPU/errors

2. **Regular Maintenance:**
   - Update system: `sudo yum update -y`
   - Update dependencies: `composer update`
   - Backup database regularly
   - Monitor logs: `tail -f /var/www/ecommerce-backend/storage/logs/laravel.log`
