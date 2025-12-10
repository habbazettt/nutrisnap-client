# 🥗 NutriSnap Client

The modern, responsive frontend for **NutriSnap** - an intelligent nutrition tracking application that uses AI to analyze food labels and provide actionable health insights.

![NutriSnap Banner](https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop)

## 🚀 Key Features

- **📸 Smart Scanning**: Instantly analyze nutrition facts labels using OCR and AI.
- **🔍 Product Insight**: Get detailed health scores (NutriScore), ingredient analysis, and potential allergen warnings.
- **⚖️ Product Comparison**: Compare two products side-by-side to make healthier choices.
- **🛡️ Admin Dashboard**: Comprehensive admin panel for user management and application statistics.
- **📱 Responsive Design**: Built for a seamless experience on both desktop and mobile devices.
- **🌗 Dark/Light Mode**: Beautiful UI adaptable to your preference.

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/habbazettt/nutrisnap-client.git
    cd nutrisnap-client
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
    Create a `.env` file in the root directory:

    ```env
    VITE_API_URL=http://localhost:3000/api/v1
    ```

4. **Run Development Server**

    ```bash
    npm run dev
    ```

## 🏗️ Project Structure

```text
src/
├── components/         # Reusable UI components
│   ├── ui/             # Shadcn UI primitives
│   ├── layout/         # Layout components (Sidebar, Navbar)
│   └── ...
├── pages/              # Main application pages
│   ├── admin/          # Admin dashboard & management
│   └── ...
├── services/           # API integration
├── hooks/              # Custom React hooks
├── context/            # Global state (Auth, Theme)
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## 🔐 Admin Access

To access the admin dashboard:

1. Log in with an admin account.
2. Navigate to `/admin` or click the "Admin" link in the navigation bar.

## 📄 License

MIT License - see [LICENSE](LICENSE)
