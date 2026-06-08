# Issue 08: Import/export JSON backup with validation

## Goal
Allow local backup and restore of full menu data.

## Scope
- Export full dataset as JSON
- Import from local JSON file
- Validation before replacing data
- Confirm destructive overwrite/reset actions

## Acceptance Criteria
- Valid export imports successfully
- Invalid import is rejected with clear error
- Destructive actions require confirmation
