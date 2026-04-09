# CouponHub - Deal Discovery & Redemption Platform

A modern, full-featured coupon management and discovery platform built with React, TypeScript, and Vite. Users can browse and purchase discount coupons from local merchants, while merchants can manage their coupon offerings through a dedicated dashboard.

## Project Overview

CouponHub is a two-sided marketplace that connects customers with local merchants through a discount coupon platform. Users can discover deals, purchase coupons, and redeem them using QR codes. Merchants can list their products/services as coupons with custom discounts and track sales.

### Key Features

- **User Authentication**: Secure login and registration system with role-based access (User/Merchant)
- **Coupon Browsing**: Browse, filter, and search discounted coupons from various merchants
- **QR Code Redemption**: Each purchased coupon generates a unique QR code for in-store redemption
- **Merchant Dashboard**: Full coupon management interface for merchants to create, update, and monitor sales
- **My Coupons Page**: Users can view their purchased coupons and QR codes
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Real-time UI Components**: Modern UI built with Radix UI and shadcn/ui
- **Data Validation**: Form validation using React Hook Form and Zod
- **Data Fetching**: TanStack React Query for efficient server state management

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend Framework** | React 18.3.1 with TypeScript 5.8 |
| **Build Tool** | Vite 5.4.19 |
| **Routing** | React Router 6.30.1 |
| **Styling** | Tailwind CSS 3.4.17 with custom theme |
| **UI Components** | Radix UI + shadcn/ui |
| **Forms** | React Hook Form 7.61.1 + Zod validation |
| **State Management** | React Query (TanStack) 5.83.0 |
| **Data Visualization** | Recharts 2.15.4 |
| **QR Code Generation** | qrcode.react 4.2.0 |
| **Toast Notifications** | Sonner 1.7.4 |
| **Icons** | Lucide React 0.462.0 |
| **Testing** | Vitest 3.2.4, React Testing Library |
| **Linting** | ESLint 9.32.0 |
| **Dev Server** | Vite dev server on port 8080 |

## Folder Structure

```
deal-scan-save-main/
├── public/                          # Static assets
│   └── robots.txt
├── src/
│   ├── components/                  # Reusable React components
│   │   ├── CouponCard.tsx           # Card component displaying coupon info
│   │   ├── Navbar.tsx               # Navigation header with auth state
│   │   ├── NavLink.tsx              # Navigation link wrapper
│   │   ├── QRCodeDisplay.tsx        # QR code generation and display
│   │   └── ui/                      # shadcn/ui component library
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts          # Toast hook for notifications
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.tsx           # Mobile device detection
│   │   └── use-toast.ts             # Toast notification hook
│   ├── lib/                         # Utility functions and constants
│   │   ├── store.ts                 # Authentication and state management
│   │   ├── types.ts                 # TypeScript type definitions
│   │   └── utils.ts                 # Helper utilities
│   ├── pages/                       # Page components (routes)
│   │   ├── Index.tsx                # Home/landing page
│   │   ├── LoginPage.tsx            # Login & registration page
│   │   ├── CouponListPage.tsx       # Browse all coupons
│   │   ├── CouponDetailPage.tsx     # Individual coupon detail view
│   │   ├── MyCouponsPage.tsx        # User's purchased coupons
│   │   ├── MerchantDashboard.tsx    # Merchant management interface
│   │   └── NotFound.tsx             # 404 error page
│   ├── test/                        # Test files
│   │   ├── example.test.ts
│   │   └── setup.ts                 # Vitest configuration
│   ├── App.tsx                      # Root app component with routing
│   ├── App.css                      # App styles
│   ├── main.tsx                     # Application entry point
│   ├── index.css                    # Global styles
│   └── vite-env.d.ts                # Vite environment type definitions
├── components.json                  # shadcn/ui configuration
├── eslint.config.js                 # ESLint configuration
├── package.json                     # Project dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration (root)
├── tsconfig.app.json                # TypeScript configuration (app)
├── tsconfig.node.json               # TypeScript configuration (build tools)
├── vite.config.ts                   # Vite configuration
├── vitest.config.ts                 # Vitest configuration
├── index.html                       # HTML entry point
└── README.md                        # This file
```

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

### Verify Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
# Navigate to your preferred directory
cd ~/Documents/Evan/Coding/College/RPL/prototype_tubes

# Clone the repository
git clone <repository-url>
cd deal-scan-save-main
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install
```

This will install all packages listed in `package.json` including:
- React and React Router for the frontend framework
- Vite for build tooling
- TypeScript for type safety
- Tailwind CSS for styling
- All UI component libraries and utilities

### Step 3: Verify Installation

```bash
# Check if all dependencies are properly installed
npm list --depth=0
```

You should see output listing all major dependencies without errors.

## Configuration

### Environment Variables

Create a `.env.local` file in the project root if needed for API endpoints:

```bash
# Copy the example env file (if available)
cp .env.example .env.local

# Edit the file with your settings
# VITE_API_URL=http://localhost:3000
# VITE_API_BASE_PATH=/api
```

**Note**: The current project uses local state management via `lib/store.ts`. For production, configure your API endpoints here.

### Tailwind CSS & PostCSS

The project is pre-configured with:
- **Tailwind CSS**: See [tailwind.config.ts](tailwind.config.ts) for theme customization
- **PostCSS**: See [postcss.config.js](postcss.config.js) for build pipeline
- **Custom Fonts**: Space Grotesk (display) and Inter (body fonts)

## Running the Project

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

- Server runs on: `http://localhost:8080`
- HMR (Hot Module Replacement) enabled for instant updates
- Open your browser and navigate to the URL shown in the terminal

### Production Build

Create an optimized production build:

```bash
npm run build
```

This generates:
- Minified JavaScript and CSS
- Optimized bundle in the `dist/` directory
- Built files ready for deployment

### Development Build

Create a development build (unminified for debugging):

```bash
npm run build:dev
```

### Preview Production Build

Test the production build locally:

```bash
npm run build    # First build the project
npm run preview  # Then preview it
```

This serves the production build locally, useful for testing before deployment.

## Testing

### Run Tests

Execute all tests once:

```bash
npm run test
```

### Watch Mode

Run tests in watch mode for continuous testing during development:

```bash
npm run test:watch
```

Tests are located in `src/test/`:
- Tests use Vitest as the runner
- React Testing Library for component testing
- Jest DOM for assertions

## Linting

Check for code quality and style issues:

```bash
npm run lint
```

This runs ESLint across the project based on `eslint.config.js` configuration.

## Project Architecture

### Authentication Flow

1. User logs in/registers on [LoginPage.tsx](src/pages/LoginPage.tsx)
2. Credentials validated via [lib/store.ts](src/lib/store.ts)
3. User object stored in React state and localStorage
4. Role-based routing determines dashboard access

### Routing Structure

```
/                       → Home landing page
/login                  → Login & registration
/coupons                → Browse all available coupons
/coupons/:id            → Coupon detail view
/my-coupons             → User's purchased coupons with QR codes
/merchant               → Merchant dashboard (merchant-only)
*                       → 404 Not Found page
```

### State Management

- **Local State**: React `useState` for component-level state
- **Global State**: Custom store in [lib/store.ts](src/lib/store.ts)
- **Server State**: TanStack React Query for API data fetching
- **UI State**: Managed by individual components and context providers

### Component Hierarchy

```
App
├── QueryClientProvider
├── TooltipProvider
├── BrowserRouter
│   ├── Navbar
│   └── Routes
│       ├── Index
│       ├── LoginPage
│       ├── CouponListPage
│       ├── CouponDetailPage
│       ├── MyCouponsPage
│       ├── MerchantDashboard
│       └── NotFound
└── Toasters (Sonner, Toast)
```

## Key Files Explanation

### Core Application Files

| File | Purpose |
|------|---------|
| [src/App.tsx](src/App.tsx) | Root component with routing and context setup |
| [src/main.tsx](src/main.tsx) | Application entry point and React mount |
| [src/index.css](src/index.css) | Global CSS styles |
| [src/App.css](src/App.css) | Application-specific styles |

### Utilities & Configuration

| File | Purpose |
|------|---------|
| [src/lib/store.ts](src/lib/store.ts) | Authentication and user state management |
| [src/lib/types.ts](src/lib/types.ts) | TypeScript interfaces for User, Coupon, Transaction |
| [src/lib/utils.ts](src/lib/utils.ts) | Helper functions (classname merging, etc.) |
| [src/hooks/use-toast.ts](src/hooks/use-toast.ts) | Custom hook for toast notifications |
| [src/hooks/use-mobile.tsx](src/hooks/use-mobile.tsx) | Mobile device detection hook |

### Configuration Files

| File | Purpose |
|------|---------|
| [vite.config.ts](vite.config.ts) | Vite build configuration, path aliases |
| [tsconfig.json](tsconfig.json) | TypeScript compiler options |
| [tailwind.config.ts](tailwind.config.ts) | Tailwind CSS theme and content settings |
| [components.json](components.json) | shadcn/ui CLI configuration |
| [eslint.config.js](eslint.config.js) | ESLint linting rules |
| [postcss.config.js](postcss.config.js) | PostCSS plugin configuration |
| [package.json](package.json) | Project dependencies and npm scripts |

## Demo Credentials

For testing the application:

```
Regular User:
Email: user@demo.com
Password: password

Merchant Accounts:
Email: burger@demo.com, coffee@demo.com, pizza@demo.com
Password: password
```

## Available Scripts Summary

```bash
npm run dev          # Start development server (localhost:8080)
npm run build        # Create optimized production build
npm run build:dev    # Create development build
npm run lint         # Run ESLint code quality checks
npm run preview      # Preview production build locally
npm run test         # Run all tests once
npm run test:watch   # Run tests in watch mode
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**Port 8080 already in use**
```bash
# Use a different port
npm run dev -- --port 3000
```

**Dependencies not installing**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build fails with TypeScript errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Or ignore errors in development
npm run build:dev
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally: `npm run dev`
3. Run linting: `npm run lint`
4. Run tests: `npm run test`
5. Commit and push changes
6. Create a pull request

## Performance Optimization

- **Code Splitting**: Vite automatically handles code splitting in production
- **Lazy Loading**: React Router v6 supports lazy route loading
- **Caching**: TanStack React Query handles server state caching
- **Image Optimization**: Use Lucide icons instead of image assets
- **CSS Optimization**: Tailwind CSS purges unused styles in production

## Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production-ready files.

### Deployment Targets

- **Vercel**: Push to Git, automatic deployment
- **Netlify**: Connect repository, specify build command as `npm run build`
- **Traditional Hosting**: Upload contents of `dist/` folder via FTP/SFTP
- **Docker**: Create Dockerfile with Node.js base image

### Environment Configuration for Production

Update `.env.production` with production API endpoints:
```
VITE_API_URL=https://your-api-domain.com
VITE_API_BASE_PATH=/api
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is part of the RPL (Rekayasa Perangkat Lunak) college course.

## Support & Questions

For issues, questions, or suggestions:
- Create an issue in the repository
- Check existing documentation
- Review the codebase comments and types for guidance

---

**Last Updated**: April 2026
**Project Version**: 0.0.0
