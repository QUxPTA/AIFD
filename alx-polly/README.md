# Polly - Polling Application

A modern, full-stack polling application built with Next.js 15, TypeScript, and Shadcn UI components.

## 🚀 Features (Planned)

- **User Authentication** - Secure user registration and login
- **Poll Creation** - Create polls with multiple options and custom settings
- **Real-time Voting** - Live poll results and voting functionality
- **Poll Management** - View, edit, and manage your created polls
- **Analytics Dashboard** - Comprehensive analytics and insights
- **Responsive Design** - Mobile-first design with Tailwind CSS

## 📁 Project Structure

```
alx-polly/
├── app/
│   ├── (auth)/                 # Authentication routes (grouped)
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/            # Dashboard routes (grouped)
│   │   ├── polls/              # View all polls
│   │   ├── create-poll/        # Create new poll
│   │   ├── my-polls/           # User's polls
│   │   ├── layout.tsx          # Dashboard layout
│   │   └── page.tsx            # Dashboard overview
│   ├── globals.css
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/
│   ├── auth/                   # Authentication components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── layout/                 # Layout components
│   │   ├── dashboard-header.tsx
│   │   └── dashboard-sidebar.tsx
│   ├── polls/                  # Poll-related components
│   │   ├── polls-list.tsx
│   │   ├── poll-detail.tsx
│   │   ├── create-poll-form.tsx
│   │   └── my-polls-list.tsx
│   └── ui/                     # Shadcn UI components
├── hooks/                      # Custom React hooks
│   └── index.ts
├── lib/
│   ├── auth/                   # Authentication utilities
│   │   └── index.ts
│   ├── db/                     # Database utilities
│   │   └── index.ts
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. Clone the repository:

```bash
git clone
cd alx-polly
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Current Implementation Status

### ✅ Completed

- [x] Project scaffolding and folder structure
- [x] Shadcn UI setup and basic components
- [x] Authentication UI components (login/register forms)
- [x] Dashboard layout with sidebar and header
- [x] Poll listing and detail components
- [x] Poll creation form
- [x] Basic TypeScript types and interfaces
- [x] Responsive design with Tailwind CSS

### 🚧 To Do (Implementation Required)

- [ ] **Database Integration**
  - Set up database (PostgreSQL, MySQL, or SQLite)
  - Implement Prisma or Drizzle ORM
  - Create database schema and migrations
- [ ] **Authentication System**
  - Implement NextAuth.js, Clerk, or custom auth
  - User registration and login functionality
  - Session management and protected routes
- [ ] **API Routes**
  - Poll CRUD operations
  - User management
  - Voting system
  - Real-time updates with WebSockets or Server-Sent Events
- [ ] **Advanced Features**
  - Email notifications
  - Poll sharing and embedding
  - Advanced analytics and charts
  - Export functionality
  - Admin panel

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-database-url"

# Authentication (example for NextAuth.js)
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Shadcn UI Components

The project uses Shadcn UI components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

Available components are listed in the [Shadcn documentation](https://ui.shadcn.com/).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Beautiful icon library

## 📞 Support

If you have any questions or need help with setup, please open an issue in the repository.
