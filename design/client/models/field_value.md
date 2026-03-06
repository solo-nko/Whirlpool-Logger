# Field Value

## Members

This section is for properties attached to the model.

### Required

This section is for properties that are required to initialize data from this model.

#### Field Id

Id of the [Field](/design/client/models/field.md) type that this value corresponds to.

- **Name:** `fieldId`
- **Type:** string/ULID

#### Field Type

Type of field. This is used to determine what type of data this field is expected to be holding.

- **Name:** `fieldType`
- **Type:** [FieldType](/design/client/models/field.md#enum-fieldtype)

### Optional

This section is for properties that are NOT required to initialize data from this model. In cases where they are not declared, they will be set as `undefined`.

#### Property Name

- **Name:** `The name of the property, as it will be used in the code.`
- **Type:** The data type of the property. In cases where the data type is a formal class or interface, this should be capitalized.

## Actions

This section is for functions and methods attached to the model.
