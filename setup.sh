#!/bin/bash

# setup.sh - Main setup script for Maize Admin Webapp
set -e

echo "🌱 Setting up Maize Yield Prediction Admin Webapp..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Node.js version: $(node --version)${NC}"
echo -e "${BLUE}📋 npm version: $(npm --version)${NC}"

# Project name
PROJECT_NAME="maize-admin-webapp"

# Check if project directory already exists
if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}⚠️  Directory $PROJECT_NAME already exists.${NC}"
    read -p "Do you want to remove it and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_NAME"
        echo -e "${GREEN}✅ Removed existing directory${NC}"
    else
        echo -e "${RED}❌ Setup cancelled${NC}"
        exit 1
    fi
fi

# Create React app
echo -e "${BLUE}📦 Creating React application...${NC}"
npx create-react-app "$PROJECT_NAME"

# Navigate to project directory
cd "$PROJECT_NAME"

# Install additional dependencies
echo -e "${BLUE}📦 Installing additional dependencies...${NC}"
npm install recharts lucide-react

# Install dev dependencies
echo -e "${BLUE}📦 Installing dev dependencies...${NC}"
npm install --save-dev tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
echo -e "${BLUE}🎨 Setting up Tailwind CSS...${NC}"
npx tailwindcss init -p

echo -e "${GREEN}✅ Basic project setup complete!${NC}"
echo -e "${YELLOW}📝 Now generating project files...${NC}"

# Make the other scripts executable and run them
chmod +x ../generate-*.sh
../generate-structure.sh
../generate-config.sh
../generate-components.sh
../generate-services.sh

echo -e "${GREEN}🎉 Maize Admin Webapp setup complete!${NC}"
echo -e "${BLUE}📁 Project created in: $(pwd)${NC}"
echo -e "${YELLOW}🚀 To start the development server:${NC}"
echo -e "   cd $PROJECT_NAME"
echo -e "   npm start"
