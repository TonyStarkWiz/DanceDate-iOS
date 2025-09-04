#!/bin/bash

# 🚀 DanceDate iOS App Store Deployment Script
# This script automates the deployment process for the App Store

set -e  # Exit on any error

echo "🎉 DanceDate iOS App Store Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if EAS CLI is installed
check_eas_cli() {
    print_status "Checking EAS CLI installation..."
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Installing now..."
        npm install -g eas-cli
        print_success "EAS CLI installed successfully"
    else
        print_success "EAS CLI is already installed"
    fi
}

# Check if logged in to Expo
check_expo_login() {
    print_status "Checking Expo login status..."
    if ! eas whoami &> /dev/null; then
        print_warning "Not logged in to Expo. Please login:"
        eas login
    else
        print_success "Already logged in to Expo"
    fi
}

# Update version numbers
update_version() {
    print_status "Updating version numbers..."
    
    # Read current version from app.json
    CURRENT_VERSION=$(node -p "require('./app.json').expo.version")
    CURRENT_BUILD=$(node -p "require('./app.json').expo.ios.buildNumber")
    
    print_status "Current version: $CURRENT_VERSION (Build $CURRENT_BUILD)"
    
    # Ask user for new version
    read -p "Enter new version (e.g., 1.0.1): " NEW_VERSION
    read -p "Enter new build number (e.g., 2): " NEW_BUILD
    
    # Update app.json
    node -e "
        const fs = require('fs');
        const appConfig = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
        appConfig.expo.version = '$NEW_VERSION';
        appConfig.expo.ios.buildNumber = '$NEW_BUILD';
        fs.writeFileSync('./app.json', JSON.stringify(appConfig, null, 2));
    "
    
    print_success "Version updated to $NEW_VERSION (Build $NEW_BUILD)"
}

# Build the iOS app
build_ios() {
    print_status "Building iOS app for production..."
    
    echo "This will take several minutes. Please wait..."
    
    # Start the build
    eas build -p ios --profile production
    
    print_success "iOS build completed successfully"
}

# Submit to App Store Connect
submit_to_app_store() {
    print_status "Submitting to App Store Connect..."
    
    # Check if eas.json has proper configuration
    if ! grep -q "appleId" eas.json; then
        print_error "Please update eas.json with your Apple credentials first"
        print_status "Edit eas.json and add your Apple ID, App Store Connect App ID, and Team ID"
        exit 1
    fi
    
    # Submit the latest build
    eas submit -p ios --latest
    
    print_success "App submitted to App Store Connect successfully"
}

# Main deployment function
deploy() {
    print_status "Starting DanceDate iOS deployment process..."
    
    # Pre-flight checks
    check_eas_cli
    check_expo_login
    
    # Update version
    update_version
    
    # Build iOS app
    build_ios
    
    # Submit to App Store
    submit_to_app_store
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Next steps:"
    echo "1. Go to App Store Connect (https://appstoreconnect.apple.com)"
    echo "2. Add screenshots and app metadata"
    echo "3. Complete App Privacy questionnaire"
    echo "4. Submit for review"
    echo "5. Wait for Apple's review (1-3 days)"
}

# Show help
show_help() {
    echo "DanceDate iOS App Store Deployment Script"
    echo ""
    echo "Usage:"
    echo "  ./deploy.sh          - Run full deployment process"
    echo "  ./deploy.sh --help   - Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - Apple Developer Program account"
    echo "  - App Store Connect app record created"
    echo "  - Updated eas.json with Apple credentials"
    echo "  - App icon and screenshots ready"
    echo ""
    echo "Configuration:"
    echo "  - Bundle ID: com.antho.dancedate"
    echo "  - EAS Project ID: fc1e1cb9-f859-4555-b7aa-a862feb816e6"
}

# Parse command line arguments
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        deploy
        ;;
esac
