# Edit Entry

## Variables and Props

### Props

#### Category

- **Name:** `category`
- **Required:** Yes
- **Type:** Category

#### Entry

- **Name:** `entry`
- **Required:** No
- **Type:** MediaLog

### Variables

## UI

### Entry Form Inputs

Input boxes for filling out the Whirlpool log entry.

### Title

### Status

### Chapter

### Volume

### Rating

### Progress

### Notes

### Additional Fields

- **EXPERIMENTAL: Element/Component:** [VExpansionPanel](https://vuetifyjs.com/en/components/expansion-panels/)
- **Display:**
    - If category.extraFields.length is greater than 0, Yes. Otherwise, No.
    - Open by default?
- **Usable:** Yes
- **Content:**
    - Header: "Additional Fields"
    - For each item in category.extraFields, display an element.

### Date Updated

### Save

### Cancel

## Actions
