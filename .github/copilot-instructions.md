# Copilot Instructions for REALROOK1E Portfolio

## Architecture Overview

This is a **cyberpunk pixel-themed personal portfolio** built as a static GitHub Pages site with PWA capabilities. The project uses a **dual-theme architecture** with both modern and pixel styles.

### Key Components

- **Main Theme**: Cyberpunk pixel gaming theme (`style-pixel.css` + `script-pixel.js`)
- **Legacy Theme**: Modern glassmorphism theme (referenced in README but pixel theme is active)
- **PWA Features**: Service Worker (`sw.js`) with caching strategy
- **Static Pages**: `index.html` (main), `life-*.html` (galleries), `project-*.html` (showcases)

## Critical Development Patterns

### CSS Architecture
- **CSS Custom Properties**: All colors defined in `:root` with cyberpunk palette (`--accent-cyan`, `--accent-magenta`, `--text-pink`)
- **Consistent Naming**: `.achievement-*`, `.quest-*`, `.cyber-*` prefixes for component organization
- **Responsive Grid**: Use `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` pattern for cards
- **Animation Strategy**: Prefer CSS animations over JS, use `cubic-bezier(.4,0,.2,1)` for smooth transitions

### JavaScript Patterns
- **Game State Management**: Global `gameState` object tracks player stats and UI state
- **Sound System**: `PixelSoundManager` class for retro audio effects using Web Audio API
- **Modular Functions**: Each feature has dedicated setup function (e.g., `setupQuestCards()`, `setupAchievements()`)
- **Event Delegation**: Use document-level listeners for dynamic content

### Component Structure
```
Achievement Cards: .achievement-card > .achievement-title + .achievement-desc + .achievement-details + .achievement-stats
Quest Cards: .quest-card > .quest-title + .quest-description + .tech-badges + .quest-button
Terminal Effects: .cyber-terminal-container > .cyber-terminal-header + .cyber-terminal-content
```

## Development Workflows

### Color Scheme Updates
When updating colors, modify CSS custom properties in `:root` - all components inherit from these variables. The current palette uses cyber pink (`#ff1493`) as the primary accent.

### Adding New Achievement Cards
1. Add card HTML in `.achievements-grid` section
2. Include `.achievement-details` and `.achievement-stats > .stat-badge` for inline content
3. **Never add onclick handlers** - achievements display inline, no modals

### Service Worker Updates
- Increment `CACHE_NAME` version in `sw.js` 
- Add new assets to `STATIC_ASSETS` array
- Test offline functionality with DevTools Network throttling

### Performance Considerations
- Images use `filter: sepia(30%) hue-rotate(90deg) saturate(150%)` for cyberpunk aesthetic
- Animations use `transform` and `opacity` for GPU acceleration
- Loading screen uses `showLoadingScreen()` function with automatic dismissal

## Project-Specific Conventions

### File Naming
- `style-pixel.css`: Active cyberpunk theme
- `script-pixel.js`: Interactive game features
- `life-*.html`: Personal gallery pages
- `project-*.html`: Technical showcases

### Git Workflow
This is a GitHub Pages site - **push directly to main branch** for immediate deployment. Use commit messages in Chinese as established in project history.

### Asset Management
- Images stored in `/album/` directory
- External CDN: Font Awesome 6.4.2 for icons
- Fonts: Google Fonts (Orbitron, Share Tech Mono) for retro gaming aesthetic

## Key Integration Points

### PWA Integration
- Manifest file defines app behavior when installed
- Service Worker handles offline caching with cache-first strategy
- Loading screen provides native app-like experience

### External Dependencies
- Font Awesome CDN (cached in Service Worker)
- Google Fonts API (Orbitron for titles, Share Tech Mono for content)
- No build tools - pure static files for GitHub Pages compatibility

When making changes, maintain the cyberpunk gaming aesthetic, ensure mobile responsiveness, and test Service Worker caching behavior.
