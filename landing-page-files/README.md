# Landing Page Files

This folder contains all the necessary files to implement the landing page for the Virtual Chemistry Lab application.

## Folder Structure

```
landing-page-files/
├── src/
│   ├── assets/
│   │   ├── chemistry-lab-1.jpg
│   │   ├── chemistry-lab-2.jpg
│   │   └── hero-banner.jpg
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── lib/
│   │   └── auth.tsx
│   └── pages/
│       └── Landing.tsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Main Files

1. **src/pages/Landing.tsx** - The main landing page component with all UI elements
2. **src/lib/auth.tsx** - Authentication context and functions
3. **src/components/ui/** - UI components (button, card, input, label)
4. **src/assets/** - Image assets for the landing page
5. **Configuration files** - All necessary configuration files for the project

## How to Use

1. Copy the entire `src` folder structure to your project
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`

The landing page includes:
- Responsive design
- Authentication forms (login/signup)
- Animated elements
- Interactive components
- Proper routing setup