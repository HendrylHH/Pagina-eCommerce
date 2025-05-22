# E-commerce Product Page Development Guide

This document provides instructions and guidelines for developing and customizing this e-commerce product page.

## Project Overview

This is a React-based e-commerce product page that features:

- Product image gallery with main image and thumbnails
- Dynamic product variants (colors and sizes)
- Shipping calculator with CEP (Brazilian postal code) validation
- Local storage persistence for user selections

## Development Guidelines

### Adding New Product Images

1. Add new images to the `public/images/` directory
2. Update the image paths in `src/utils/mockData.ts`

### Adding New Product Variants

To add new variants (e.g., colors or sizes):

1. Open `src/utils/mockData.ts`
2. Add new objects to the `variants.colors` or `variants.sizes` arrays
3. Format:
   ```typescript
   { id: 'unique-id', name: 'Display Name', value: 'value' }
   ```

### Modifying the Layout

The main layout is in `src/components/ProductDetail.tsx`. Component styling uses Tailwind CSS classes.

### Adding New Features

To add new features:

1. Create new components in the `src/components/` directory
2. Define necessary types in `src/types/`
3. Add any utility functions in `src/utils/`
4. Import and use components in the main `App.tsx` or relevant parent components

## Best Practices

- Use TypeScript interfaces for type safety
- Use the `useLocalStorage` hook for persisting data
- Follow the component structure for new features
- Test all features in different viewports (desktop and mobile)
