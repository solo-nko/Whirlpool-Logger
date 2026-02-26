# Export & Sync

## UI

### Import/Export

### Cloud Sync

#### Explanation Blurb

- **Element/Component:** Text
- **Display:** Yes

#### Sync Code Validation

- **Element/Component:** Button
- **Display**:
  - If Sync Code Field is not empty, Yes
  - If Sync Code Field is empty, No
- **Usable:**
  - After clicking and until server response arrives, No
  - Otherwise, Yes
- **Content:** "Validate Sync Code"
- **Action:** Validate the Sync Code inputted by the user.

#### Sync Code Request

- **Element/Component:** Button
- **Display**:
  - If [Sync Code Field](#sync-code-input) is empty, Yes
  - If [Sync Code Field](#sync-code-input) is not empty, No
- **Usable**:
  - After clicking and until server response arrives, No
  - Otherwise, Yes
- **Content:** "Request Sync Code"
- **Action:** Request a new Sync Code from the server.

#### Sync Code Input

- **Element/Component:** Input (Text)
- **Display:** Yes
- **Usable:**
  - If Cloud Sync is Enabled, No
  - Otherwise, Yes
- **Content:**
  - Label: "Sync Code"
- **Validation:**
  - Length: 6 characters exactly
  - Characters: Alphanumeric Only
  - Error Message: "Sync Code is Invalid."

#### Backup Button

- **Element/Component:** Button
- **Display:** Yes
- **Usable:**
  - If AutoSync Checkbox is checked, No
  - If SyncCode is undefined, No
  - If SyncCode has not been validated, No
  - Otherwise, Yes
- **Content:** "Backup"
- **Action:** Initiate manual backup

### Restore Button

- **Element/Component:** Button
- **Display:** Yes
- **Usable:**
  - If AutoSync Checkbox is checked, No
  - If SyncCode is undefined, No
  - If SyncCode has not been validated, No
  - Otherwise, Yes
- **Content:** "Restore"
- **Action:** Initiate manual restore

#### Toggle Cloud Sync

- **Element/Component:** Input(Checkbox)
- **Display:** Yes
- **Usable:**
  - While assigning Sync Code to Media Logs, No
  - If Sync Code is invalid, No
  - Otherwise, Yes
- **Content:**
  - Label: "Enable Cloud Sync"
- **Action:**
  - Toggle On:
    - Set Store.AutoSync to `true`
    - Set [LocalStorage.CloudSync](/design/client/stores/localstorage.md#cloud-sync) to `true`
    - Get existing server-side Media Logs
      - If returning result is empty:
        - Post existing client-side Media Logs
      - If returning result has Media Logs:
        - Put existing client-side Media Logs
  - Toggle Off:
    - Set Store.AutoSync to `false`
    - Set [LocalStorage.CloudSync](/design/client/stores/localstorage.md#cloud-sync) to `false`

## Actions

### Get Server Media Logs from API

- Function Name: `getLogsFromCloud`
- Request Type: `GET`
- Parameters:
  - Required:
    - `syncCode`:
      - Type: string
- Returns:
  - `MediaLog[]`
- Details: Gets a list of media logs from the server that match the given Sync Code
