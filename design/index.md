# Design Documents

## Structure

- `api`: Documents concerning the back end API service, and how it should be configured.
  - `collections`: Documents describing server database tables and their schemas.
- `client`: Documents concerning the front end client, and how it should be configured and implemented.
  - `components`: Documents describing UI components
  - `database`: Documents describing how the IndexedDB should be configured, as well as table schemas
  - `models`: Documents describing data structures
  - `pages`: Documents describing site routes
  - `stores`: Documents describing Pinia stores

## How to Use

- Refer to each folder's `_index.md` to see more detailed information on how those items are written.

## Code Style Guidelines

- Function names should use PascalCase. Arrow functions may use camelCase.
- Components should use two letters or more, and be defined using PascalCase.
  - Pages are excluded from this.
