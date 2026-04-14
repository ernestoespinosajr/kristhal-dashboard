# KRISTHAL

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** shadcn/ui + Tailwind CSS 4
- **Charts:** Recharts
- **PDF Reports:** @react-pdf/renderer
- **Icons:** Lucide React

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm (comes with Node.js)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/ernestoespinosajr/kristhal-dashboard.git
   cd kristhal-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
Kristhal-app/
├── src/
│   ├── app/              # App Router pages and layouts
│   ├── components/       # React components (shadcn/ui based)
│   ├── lib/              # Utilities, API client, helpers
│   └── types/            # TypeScript type definitions
├── assets/               # Brand assets (logos)
├── public/               # Static assets served by Next.js
└── context/              # Reference documents
```

## API

The application consumes an external Azure-hosted API that provides organizational hierarchy and task data. No backend code is included in this repository.

## License

Proprietary — Square Solution, SRL. All rights reserved.
