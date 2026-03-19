# Whirlpool Store

A Pinia store for handling whirlpool data in a centralized, app-wide fashion.

## Members

### Database Whirlpools

A variable for querying whirlpools from the IndexedDb database.

- **Name:** `databaseWhirlpools`
- **Type:** DatabaseWhirlpool[]

### Client Whirlpools

A getter that maps the database whirlpools to an array that the app can use.

- **Name:** `clientWhirlpools`
- **Type:** WhirlpoolLog[]

## Actions
