#!/bin/bash

# generate-structure.sh - Creates the project directory structure
set -e

echo "📁 Creating project directory structure..."

# Create all directories
mkdir -p src/components/layout
mkdir -p src/components/dashboard
mkdir -p src/components/data
mkdir -p src/components/models
mkdir -p src/components/users
mkdir -p src/components/farmers
mkdir -p src/components/planting
mkdir -p src/components/weather
mkdir -p src/components/common
mkdir -p src/components/charts
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/context
mkdir -p src/styles

echo "✅ Directory structure created successfully!"

# Create .gitignore additions
cat >> .gitignore << 'EOF'

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# API keys and secrets
.env.secrets

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

echo "✅ Updated .gitignore"
