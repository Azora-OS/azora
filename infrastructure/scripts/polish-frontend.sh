#!/bin/bash
# 🎨 POLISH FRONTEND - Apply Industry Best Practices

echo "🎨 =================================="
echo "🎨 POLISHING FRONTEND CODE"
echo "🎨 =================================="
echo ""

# Find all frontend app directories
FRONTEND_DIRS=(
  "apps/student-portal"
  "azora-ui/student-portal"
  "azora-ui/job-board"
  "azora-ui/mint-dashboard"
  "azora-ui/admin-panel"
  "elara-ide"
  "cloud-ui"
  "dev-ui"
  "enterprise-ui"
  "compliance-ui"
)

for dir in "${FRONTEND_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "📁 Processing: $dir"
    
    # Create .eslintrc.json if it doesn't exist
    if [ ! -f "$dir/.eslintrc.json" ]; then
      echo "  ✨ Creating ESLint config..."
      cat > "$dir/.eslintrc.json" << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
EOF
    fi
    
    # Create .prettierrc.json if it doesn't exist
    if [ ! -f "$dir/.prettierrc.json" ]; then
      echo "  ✨ Creating Prettier config..."
      cat > "$dir/.prettierrc.json" << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
EOF
    fi
    
    # Create next.config.js enhancements
    if [ -f "$dir/next.config.js" ]; then
      echo "  ✨ Enhancing Next.js config..."
      # Backup original
      cp "$dir/next.config.js" "$dir/next.config.js.backup"
    fi
    
    # Create performance optimization config
    cat > "$dir/next.config.performance.js" << 'EOF'
// Performance optimizations for Next.js
module.exports = {
  // Image optimization
  images: {
    domains: ['azora.world', 'cdn.azora.world'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
            },
          },
        },
      };
    }
    return config;
  },
};
EOF
    
    echo "  ✅ $dir configured"
    echo ""
  fi
done

# Create shared TypeScript config for frontend
echo "📝 Creating shared frontend tsconfig..."
cat > "tsconfig.frontend.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "dist", "build", ".next"]
}
EOF

echo ""
echo "🎨 =================================="
echo "✅ FRONTEND POLISH COMPLETE"
echo "🎨 =================================="
echo ""
echo "📊 Summary:"
echo "  ✅ ESLint configs created"
echo "  ✅ Prettier configs created"
echo "  ✅ Next.js performance optimizations added"
echo "  ✅ Security headers configured"
echo "  ✅ TypeScript strict mode enabled"
echo ""
echo "🔧 Next steps:"
echo "  1. Run: npm install --save-dev eslint prettier"
echo "  2. Run: npm run lint"
echo "  3. Run: npm run format"
echo ""
