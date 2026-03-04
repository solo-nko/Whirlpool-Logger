# Whirlpool Log

The base structure of the Whirlpool Log. This is what the client expects to handle internally. It is NOT what will be
stored on the database or the server.

- Server structure: [ServerWhirlpool](/design/api/collections/whirlpool_server.md)
- Database structure: [DatabaseWhirlpool](/design/client/database/tables/whirlpool_db.md)

## Members

### Required

#### Unique Id

ID used for uniquely identifying the log. This will be the same across clients and on the server.

- **Name:** `id`
- **Type:** ULID/string

#### Title

Media's title.

- **Name:** `title`
- **Type:** string

#### Date Updated

Date updated. This should be automatically modified whenever the object is.

- **Name:** `updatedOn`
- **Type:** DateTime (Luxon)

#### Date Created

Date created. This should be automatically set when the object is first created.

- **Name:** `createdOn`
- **Type:** DateTime (Luxon)

#### Additional Fields

- **Name:** `extraFields`
- **Type:** [FieldValue](/design/client/models/field_value.md)[]

#### Tags

Tags applied to the Whirlpool.

- **Name:** `tags`
- **Type:** string
  - Array of ids corresponding to applied tags

### Optional

#### Category

Category the media belongs to.

- **Name:** `categoryId`
- **Type:** string
  - ID of the [Category](/design/client/models/category.md) this log is assigned to.

#### Status

Current status. For example, this could "watching", or "completed", or "on pause."

- **Name:** `status`
- **Type:** string
  - ID of the [Status](/design/client/models/status.md) assigned to this log.

#### Chapter

Small unit of organization. Depending on the category, this could be an episode of a TV show, or an issue of a comic.

- **Name:** `chapter`
- **Type:** number

#### Volume

Large unit of organization. Depending on the category, this could be a season of a TV show, or a volume of a book
series.

- **Name:** `volume`
- **Type:** number

#### Series

Generally speaking, this can be thought of as the structure that volumes are organized under.

- **Name:** `series`
- **Type:** string

#### Progress

The user may input notes on their progress. For a game, this could be the last checkpoint they left off at.

- **Name:** `progress`
- **Type:** string

#### Rating

The user may input a rating of the media.

<!-- prettier-ignore -->
[//]: # (TODO:Consider allowing a few different rating schemes (inspired by Anilist)

- **Name:** `rating`
- **Type:** number

#### Notes

<!-- prettier-ignore -->
[//]: # (TODO: decide whether to use HTML or JSON. I'm leaning towards HTML because it's more semantic, though JSON is probably easier to parse and transport.)

- **Name:** `notes`
- **Type:** JSON object

#### Sync Code

- **Name:** `syncCode`
- **Type:** string

#### Unsynced Changes

- **Name:** `unsyncedChanges`
- **Type:** boolean

#### Date Deleted

- **Name:** `deletedOn`
- **Type:** DateTime

#### Date Updated (User)

- **Name:** `userUpdatedOn`
- **Type:** string (simple ISO date)
