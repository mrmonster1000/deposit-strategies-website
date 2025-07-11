# Deposit Strategies Website

A modern, responsive website for Deposit Strategies - AI Enhanced Market Intelligence for Banking Professionals.

## Overview

This website showcases Deposit Strategies' AI-powered deposit rate intelligence platform, designed with a clean, professional aesthetic inspired by Personetics.com.

## Features

- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean design with Personetics-inspired color scheme (Deep Blue #1C0962 and Yellow #FEE000)
- **Interactive Elements**: Smooth animations, parallax effects, and dynamic form handling
- **Performance Optimized**: Lazy loading, debounced scroll events, and efficient animations
- **Accessibility**: Semantic HTML and ARIA labels where appropriate

## Structure

```
deposit-strategies-website/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css         # Main stylesheet
│   └── responsive.css     # Responsive design rules
├── js/
│   └── main.js           # JavaScript for interactivity
├── images/
│   └── dashboard-preview.svg  # Dashboard preview graphic
└── README.md             # This file
```

## Quick Start

1. **Open the website locally:**
   - Simply open `index.html` in your web browser
   - Or use a local server for best results

2. **Using Python's built-in server:**
   ```bash
   cd deposit-strategies-website
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

3. **Using Node.js http-server:**
   ```bash
   npx http-server
   ```

## Design Highlights

- **Hero Section**: Eye-catching gradient background with floating elements
- **Trust Indicators**: Social proof with client count and features
- **Feature Cards**: Clean grid layout with hover effects
- **Sample Report**: Visual preview of the intelligence reports
- **Pricing Tiers**: Clear comparison with highlighted popular plan
- **CTA Section**: Strong call-to-action with email capture

## Customization

### Colors
Edit the CSS variables in `css/styles.css`:
```css
:root {
    --primary-dark: #1C0962;
    --primary-yellow: #FEE000;
    /* ... other variables */
}
```

### Content
All text content is in `index.html` and can be easily modified.

### Images
Replace placeholder images in the `images/` directory:
- `dashboard-preview.png` - Main dashboard screenshot
- `client-[1-5].png` - Client logos
- `avatar-[1-3].jpg` - Testimonial avatars

## Next Steps

1. **Add Real Images**: Replace SVG placeholder with actual dashboard screenshots
2. **Client Logos**: Add real client logos or partner badges
3. **Form Integration**: Connect the email form to your backend/email service
4. **Analytics**: Add Google Analytics or other tracking
5. **SEO**: Add meta tags, Open Graph tags, and structured data
6. **SSL Certificate**: Ensure HTTPS when deploying
7. **Performance**: Consider adding a CDN for assets

## Deployment

The website is ready for deployment to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

© 2024 Deposit Strategies. All rights reserved.