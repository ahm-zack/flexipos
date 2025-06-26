# Next.js & Supabase Dashboard Template

A modern, production-ready dashboard template built with Next.js 15, TypeScript, Tailwind CSS, and Supabase authentication. This template provides a solid foundation for building systems, retail management applications, or any business dashboard.

## ✨ Features

- 🔐 **Authentication System** - Complete login/logout with Supabase
- 🎨 **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Mobile-first approach with elegant navbar
- 🔒 **Protected Routes** - Middleware-based route protection
- 🎭 **Theme Support** - Dark/light mode with next-themes
- ⚡ **Performance Optimized** - Next.js 15 with App Router
- 🛠️ **TypeScript** - Full type safety throughout the application
- 🎯 **Clean Architecture** - Well-organized folder structure

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account (for authentication)

### 1. Use This Template

Click the "Use this template" button on GitHub or clone the repository:

```bash
git clone https://github.com/yourusername/pos-dashboard.git
cd pos-dashboard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to Settings > API to get your credentials
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── login/             # Authentication pages
│   ├── private/           # Protected routes
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── navbar.tsx        # Navigation component
├── modules/              # Feature modules
│   ├── auth/             # Authentication components
│   └── providers/        # App providers (theme, etc.)
├── utils/                # Utility functions
│   └── supabase/         # Supabase client configuration
└── middleware.ts         # Route protection middleware
```

## 🔐 Authentication Flow

The template includes a complete authentication system:

1. **Login Page** (`/login`) - Server-side form handling
2. **Protected Routes** - Middleware redirects unauthenticated users
3. **Session Management** - Supabase handles user sessions
4. **Logout Functionality** - Clean session termination

## 🎨 Customization

### Styling

- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Components use Tailwind CSS classes for easy styling

### Branding

- Update navbar title in `components/navbar.tsx`
- Replace favicon and add your logo
- Modify metadata in `app/layout.tsx`

### Adding Features

- Create new pages in the `app/` directory
- Add components to `components/` or `modules/`
- Extend the database schema in Supabase

## 🛡️ Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Built With

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://typescriptlang.org)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful UI components
- **[Supabase](https://supabase.com)** - Backend as a Service
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management
- **[Lucide React](https://lucide.dev)** - Beautiful icons

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

This template can be deployed on any platform that supports Next.js:

- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💡 Use Cases

This template is perfect for:

- 🏪 Point of Sale (POS) systems
- 📊 Business dashboards
- 🛒 E-commerce admin panels
- 📈 Analytics dashboards
- 👥 Customer management systems
- 📦 Inventory management
- 💰 Financial tracking applications

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

**Happy coding!** 🎉 If you find this template helpful, please give it a ⭐ on GitHub!
