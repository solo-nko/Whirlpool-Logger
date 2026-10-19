# Whirlpool Logger

This is the repository for the Whirlpool Logger, a web app designed to serve as a media diary. Use it to log your thoughts on the various books, games, movies, and TV shows you consume!

If you're like me, you like writing down your thoughts on the various media you consume, be it books, games, films, or TV shows. But the problem is that each of these mediums have their own websites dedicated to them, such as Goodreads for books and Backloggery for games. In addition, such sites have a lot of extra stuff going on that you may not need, such as social media features.

I tried various other approaches, like keeping an Excel sheet or a cloud notebook. But each approach had one shortcoming or another; Excel is excellent at data filtering and aggregation, for example, but awkward when it comes to rich text input.

The Whirlpool Logger is my attempt to combine all of the core features I wanted for this usecase into a straightforward web app. It's easy to use, supports cloud-syncing, searching, tags and filtering, and rich text input.

## Overview

### Features

- Per-category tracking.
- Assign tags and statuses to your whirlpools for easy organization and filtering.
- Rich text editor for writing down your thoughts in detail
- Add custom fields and statuses of your own
- Sync your data to the cloud to work across multiple devices
  - Alternatively, export your data as a local JSON file, for old-school backup
- By default, your data is completely local, stored in your web browser's cache
- Can be installed as a Progressive Web App for use offline

### Roadmap

#### To-Do

These are items I'm actively working on.

**Major**

- [ ] Recycle Bin
- [ ] About screen
- [ ] Usage manual

**Minor**

- [ ] Tweak app styles
- [ ] Additional themes
- [ ] Tag and status descriptions
- [ ] Improved mobile support
  - [ ] Particularly for TipTap Editor

#### Planned

These are items I plan to include, but are not currently in development.

#### Ideas

These are items I'm considering/investigating including in the future.

- Recently Finished screen
- Charts and/or statistics
- Max chapter/volume setting, for tracking progress visually
  - Alternatively, an ambient parser that adds a visual note when it picks up phrases like "30%"
- End-to-end encryption
- Ability to share lists
- Add and delete categories
- Modify date created
- Rich Editor Features
  - Font Family
  - Font Size/Headers
  - Tables
  - Task List

#### Completed

These are ideas I had previously that are now implemented in the app.

- [x] Light/Dark Theme
- [x] Cloud Sync
- [x] Home Screen/Dashboard
- [x] TipTap Editor
  - [x] Link insertion
  - [x] Text color
  - [x] Test output size with HTML
- [x] Form validation
  - [x] Entry Form
  - [x] Field Settings
  - [x] Status Settings
  - [x] Tag Settings
- [x] Ratings field
- [x] Additional table headers -
- [x] Set up toast messages
- [x] Test PWA functionality
- [x] Records search
- [x] Allow multiple Notes fields per whirlpool
- [x] Enhanced records table
  - [x] Customizable filters and headers

## Development

### Recommended IDE and Toolchain

- I use Webstorm, but VS Code with the Vue Extension should work perfectly fine.
- It doesn't hurt to have Vue Devtools installed in your browser.

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
