# Confirmation Modal

## Overview

A simple card-like interface for displaying a confirm/cancel UI to the user.

## Variables & Props

### Props

#### Title

- **Name:** `title`
- **Type:** string
- **Required:** Yes
- **Default Value:** N/A

#### Message

Confirm message.

- **Name:** `message`
- **Type:** string
- **Required:** Yes
- **Default Value:** N/A

#### Confirm Button Text

- **Name:** `confirmBtnText`
- **Type:** string
- **Required:** No
- **Default Value:** 'Confirm'

#### Cancel Button Text

- **Name:** `cancelBtnText`
- **Type:** string
- **Required:** No
- **Default Value:** 'Cancel'

### Variables

#### Variable One

- **Name:** `varOne`
- **Type:** Class
- **Default Value:**
  - `id`: 1
  - `title`: "Test"

## UI

### Card

#### Title

- **Element/Component:** Text
- **Display:** Yes
- **Usable:** Yes
- **Label:** Set [Props.Title](#title)
- **Placeholder:** N/A
- **Actions:** N/A

#### Body

- **Element/Component:** Text
- **Display:** Yes
- **Usable:** Yes
- **Label:** Set [Props.Message](#message)
- **Placeholder:** N/A
- **Actions:** N/A

#### Confirm Button

- **Element/Component:** Button
- **Display:** Yes
- **Usable:** Yes
- **Label:**
  - If [Props.ConfirmBtnText](#confirm-button-text) is defined, set that.
  - Otherwise, "Confirm"
- **Placeholder:** N/A
- **Actions:**
  - [On Confirm](#on-confirm)

#### Cancel Button

- **Element/Component:** Button
- **Display:** Yes
- **Usable:** Yes
- **Label:**
  - If [Props.CancelBtnText](#cancel-button-text) is defined, set that.
  - Otherwise, "Cancel"
- **Placeholder:** N/A
- **Actions:**
  - [On Cancel](#on-cancel)

## Actions

### On Confirm

- Send "confirm" event to parent.
- Close modal

### On Cancel

- Send "cancel" event to parent.
- Close modal
