#!/bin/bash
# CouponHub Development Setup Script
# Run this to set up your development environment

echo "🚀 CouponHub Development Environment Setup"
echo "=========================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Install workspace dependencies
echo ""
echo "📦 Installing workspace dependencies..."
npm install

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd backend

if [ ! -f .env ]; then
    echo "  Creating .env from example..."
    cp .env.example .env
    echo "  ⚠️  Please edit backend/.env with your MySQL credentials"
fi

cd ..

# Setup frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend

if [ ! -f .env ]; then
    echo "  Creating .env from example..."
    cp .env.example .env
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Configure MySQL in backend/.env:"
echo "   DATABASE_HOST=localhost"
echo "   DATABASE_USER=root"
echo "   DATABASE_PASSWORD=your_password"
echo "   DATABASE_NAME=couponhub"
echo ""
echo "2. Create the database:"
echo "   mysql -u root -p -e 'CREATE DATABASE couponhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'"
echo ""
echo "3. In separate terminals, run:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Backend will run on http://localhost:3000"
echo "   Frontend will run on http://localhost:5173"
echo ""
echo "5. Or run both together: npm run dev:all"
