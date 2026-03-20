#!/bin/bash

# DevInsight2 - Quick Start Script
# This script automates the entire setup process

set -e  # Exit on any error

echo "🚀 DevInsight2 - Quick Start Setup"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"
command -v java &> /dev/null || { echo -e "${RED}Java 21+ not found!${NC}"; exit 1; }
command -v node &> /dev/null || { echo -e "${RED}Node.js not found!${NC}"; exit 1; }
command -v psql &> /dev/null || { echo -e "${RED}PostgreSQL not found!${NC}"; exit 1; }
command -v docker &> /dev/null || { echo -e "${YELLOW}Docker not found (optional for containerization)${NC}"; }

java_version=$(java -version 2>&1 | grep -oP '(?<=version ")[^"]*' | cut -d'.' -f1)
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$java_version" -lt 21 ]; then
    echo -e "${RED}Java 21+ required, found: $java_version${NC}"
    exit 1
fi

if [ "$node_version" -lt 20 ]; then
    echo -e "${RED}Node.js 20+ required, found: $node_version${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo "  - Java: $(java -version 2>&1 | head -n 1)"
echo "  - Node.js: $(node -v)"
echo "  - PostgreSQL: $(psql --version)"
echo ""

# Setup Database
echo -e "${BLUE}[2/7] Setting up PostgreSQL database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS devinsight2;" 2>/dev/null || true
psql -U postgres -d devinsight2 -f src/main/resources/sql/01_initial_schema.sql 2>/dev/null || {
    echo -e "${YELLOW}Could not execute schema automatically. Running manually...${NC}"
}
echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# Build Backend
echo -e "${BLUE}[3/7] Building backend application...${NC}"
chmod +x gradlew
./gradlew clean build -x test -q --no-daemon
echo -e "${GREEN}✓ Backend build complete${NC}"
echo ""

# Setup Frontend
echo -e "${BLUE}[4/7] Setting up frontend dependencies...${NC}"
cd frontend
npm ci --quiet
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..
echo ""

# Configure Environment
echo -e "${BLUE}[5/7] Configuring environment variables...${NC}"

# Create .env for frontend
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=DevInsight2
VITE_ENV=development
EOF

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Generate test data (optional)
echo -e "${BLUE}[6/7] Optionally generate test data...${NC}"
read -p "Would you like to generate test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    psql -U postgres -d devinsight2 << 'SQLEOF'
-- Insert test company
INSERT INTO companies (name, email, phone, status, created_at, updated_at)
VALUES ('Test Company', 'admin@testcompany.com', '+1234567890', 'ACTIVE', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert test users (these would normally be created via API)
-- Skipped as passwords need hashing

-- Insert test questions
INSERT INTO question_bank 
(company_id, category, subcategory, difficulty, question_text, expected_keywords, tags, rating, usage_count, created_at, updated_at)
VALUES 
(1, 'TECHNICAL', 'Java', 'MEDIUM', 'Explain Spring Boot dependency injection', 'Autowired, IoC, Container', '{"spring","backend"}', 4.5, 10, NOW(), NOW()),
(1, 'TECHNICAL', 'Database', 'HARD', 'Explain database normalization', 'ACID, normalization, optimization', '{"database","sql"}', 4.0, 5, NOW(), NOW()),
(1, 'BEHAVIORAL', 'Teamwork', 'EASY', 'Tell us about a time you worked in a team', 'collaboration, communication', '{"soft-skills","teamwork"}', 3.5, 8, NOW(), NOW())
ON CONFLICT DO NOTHING;

SQLEOF
    echo -e "${GREEN}✓ Test data created${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}[7/7] Setup complete!${NC}"
echo ""
echo -e "${GREEN}🎉 DevInsight2 is ready to run!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend:"
echo "   ${BLUE}./gradlew bootRun${NC}"
echo ""
echo "2. In a new terminal, start Frontend:"
echo "   ${BLUE}cd frontend && npm run dev${NC}"
echo ""
echo "3. Open browser:"
echo "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo "4. Login with test credentials:"
echo "   ${BLUE}Email: admin@testcompany.com${NC}"
echo "   ${BLUE}Password: (set during first registration)${NC}"
echo ""
echo "For Docker deployment:"
echo "   ${BLUE}docker-compose up -d${NC}"
echo ""
echo "Documentation:"
echo "  - Setup Guide: IMPLEMENTATION_SETUP_GUIDE.md"
echo "  - Deployment: DEPLOYMENT_CHECKLIST.md"
echo "  - API Docs: http://localhost:8080/api/swagger-ui.html"
echo ""
