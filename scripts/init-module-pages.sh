#!/bin/bash
set -e

# Initialize the pages module (React frontend)
# Creates React app with client intake form using Vite, React Hook Form, and Tailwind

# Get script directory and project root
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"

# Source libraries
source "$script_dir/lib/utils.sh"
source "$script_dir/lib/config.sh"

# Script marker for idempotency
marker="$project_root/$MARKER_DIR/module-pages.done"
module_dir="$project_root/$SRC_DIR/pages"

# Create package.json
create_package_json() {
    local file="$module_dir/package.json"
    
    if [ -f "$file" ]; then
        log_info "pages/package.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "name": "@tls-portal/pages",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest run"
  },
  "dependencies": {
    "@tls-portal/shared": "1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.48.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
EOF
    
    log_success "Created pages/package.json"
}

# Create vite config
create_vite_config() {
    local file="$module_dir/vite.config.ts"
    
    if [ -f "$file" ]; then
        log_info "vite.config.ts already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  }
});
EOF
    
    log_success "Created vite.config.ts"
}

# Create tsconfig
create_tsconfig() {
    local file="$module_dir/tsconfig.json"
    
    if [ -f "$file" ]; then
        log_info "pages/tsconfig.json already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [
    { "path": "../shared" }
  ]
}
EOF
    
    log_success "Created pages/tsconfig.json"
}

# Create index.html
create_index_html() {
    local file="$module_dir/index.html"
    
    if [ -f "$file" ]; then
        log_info "index.html already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TLS Portal - Client Intake</title>
  <meta name="description" content="Create your secure client portal" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOF
    
    log_success "Created index.html"
}

# Create main.tsx
create_main_tsx() {
    local file="$module_dir/src/main.tsx"
    
    if [ -f "$file" ]; then
        log_info "src/main.tsx already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
EOF
    
    log_success "Created src/main.tsx"
}

# Create App.tsx
create_app_tsx() {
    local file="$module_dir/src/App.tsx"
    
    if [ -f "$file" ]; then
        log_info "src/App.tsx already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
import ClientIntakeForm from './components/ClientIntakeForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Create Your Client Portal
          </h1>
          <ClientIntakeForm />
        </div>
      </div>
    </div>
  );
}

export default App;
EOF
    
    log_success "Created src/App.tsx"
}

# Create ClientIntakeForm component
create_intake_form() {
    local file="$module_dir/src/components/ClientIntakeForm.tsx"
    
    if [ -f "$file" ]; then
        log_info "ClientIntakeForm.tsx already exists, skipping"
        return 0
    fi
    
    create_dir "$module_dir/src/components"
    
    cat > "$file" << 'EOF'
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { createClientSchema, type CreateClientDto } from '@tls-portal/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

function formatPhoneNumber(value: string): string {
  const phone = value.replace(/\D/g, '');
  const match = phone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  
  const [, area, prefix, suffix] = match;
  if (!area) return '';
  if (!prefix) return area;
  if (!suffix) return `(${area}) ${prefix}`;
  return `(${area}) ${prefix}-${suffix}`;
}

export default function ClientIntakeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<CreateClientDto>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      source: 'web_form'
    }
  });

  const createClient = useMutation({
    mutationFn: async (data: CreateClientDto) => {
      const response = await axios.post('/api/clients', data);
      return response.data;
    },
    onSuccess: (data) => {
      alert(`Success! Your portal has been created at: ${data.portalUrl}`);
      reset();
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'An error occurred');
    }
  });

  const onSubmit = (data: CreateClientDto) => {
    createClient.mutate(data);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('mobile', formatted);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-8">
      <div className="space-y-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            {...register('firstName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            {...register('lastName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Smith"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john.smith@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Phone
          </label>
          <input
            {...register('mobile')}
            type="tel"
            onChange={handlePhoneChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(555) 123-4567"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-600">{errors.mobile.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || createClient.isPending}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || createClient.isPending ? 'Creating Portal...' : 'Create My Portal'}
        </button>
      </div>
    </form>
  );
}
EOF
    
    log_success "Created ClientIntakeForm component"
}

# Create Tailwind CSS config
create_tailwind_config() {
    local file="$module_dir/tailwind.config.js"
    
    if [ -f "$file" ]; then
        log_info "tailwind.config.js already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
    
    log_success "Created tailwind.config.js"
}

# Create PostCSS config
create_postcss_config() {
    local file="$module_dir/postcss.config.js"
    
    if [ -f "$file" ]; then
        log_info "postcss.config.js already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
    
    log_success "Created postcss.config.js"
}

# Create index.css
create_index_css() {
    local file="$module_dir/src/index.css"
    
    if [ -f "$file" ]; then
        log_info "src/index.css already exists, skipping"
        return 0
    fi
    
    cat > "$file" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
    
    log_success "Created src/index.css"
}

# Main function
main() {
    section "Pages Module Initialization"
    
    # Check if already completed
    if is_completed "$marker" && ! is_force "$@"; then
        log_warn "Pages module already initialized. Use --force to recreate."
        return 0
    fi
    
    # Create module structure
    create_dir "$module_dir/src/components"
    create_dir "$module_dir/src/hooks"
    create_dir "$module_dir/src/utils"
    create_dir "$module_dir/public"
    
    # Create files
    create_package_json
    create_vite_config
    create_tsconfig
    create_index_html
    create_main_tsx
    create_app_tsx
    create_intake_form
    create_tailwind_config
    create_postcss_config
    create_index_css
    
    # Install zod resolver (needed for form validation)
    log_info "Note: Run 'yarn workspace @tls-portal/pages add @hookform/resolvers' to add form validation"
    
    # Mark as completed
    mark_completed "$marker"
    
    log_success "Pages module initialization completed!"
}

# Run main function
main "$@"
