# Whirlpool Logger

This is the repository for the Whirlpool Logger, a web app designed to serve as a media diary. Use it to log your thoughts on the various books, games, movies, and TV shows you consume!

## Overview

### Features

- Per-category tracking.
- Assign tags and statuses to your whirlpools for easy organization
- Rich text editor for writing down your thoughts in detail
- Add custom fields of your own

### Roadmap

#### To-Do

These are items I'm actively working on.

**Major**

- [ ] Light/Dark Theme
- [ ] Cloud Sync
- [ ] Home Screen/Dashboard
- [x] TipTap Editor
  - [x] Link insertion
  - [x] Text color
  - [x] Test output size with HTML
- [ ] Form validation
- [x] Ratings field
- [x] Additional table headers

**Minor**

- [ ] Tweak app styles
- [ ] Set up toast messages
- [ ] Test PWA functionality
- [x] Records search

#### Planned

These are items I plan to include, but are not currently in development.

- Recycle Bin
- Additional themes
- Tag and status descriptions

#### Ideas

These are items I'm considering/investigating including in the future.

- Recently Finished screen
- Charts and/or statistics
- Dashboard animations
- Change app icon
- Max chapter/volume setting, for tracking progress visually
- End-to-end encryption
- Ability to share lists
- Allow multiple Notes fields per whirlpool
- Add and delete categories
- Change ratings scale
- Modify date created
- Rich Editor Features
  - Font Family
  - Font Size/Headers
  - Tables
  - Task List

## Development

### Recommended IDE and Toolchain

- I use Webstorm (and the Vue Devtools are set to open in Webstorm), but VS Code with the Vue Extension should work perfectly fine.
- It doesn't hurt to have Vue Devtools installed in your browser, but the app has its own version of Devtools, and they do overlap.

### Major Tech Stack

#### Front

- Vue 3.5
  - Vue Router 5
  - Pinia 3
- TypeScript 5
- Vuetify 4
- TipTap 3
- Dexie 4
- Luxon 4

#### Back (Cloud Sync)

- Pocketbase

### Project Setup

This project uses PNPM for package management. It is also developed on Node.js 25 and built with Vite 7.

### Package Scripts

`pnpm install` - Install dependencies

`pnpm run dev` - Start app in development mode

`pnpm run dev-host` - Start app in development mode, exposed on local network (useful for testing on mobile)

`pnpm run build` - Type check, compile and build for production

`pnpm run preview` - Start app in production mode

`pnpm run lint` - Run linter

`pnpm run format` - Run prettier

`pnpm run storybook` - Run Storybook for developing certain components in isolation
