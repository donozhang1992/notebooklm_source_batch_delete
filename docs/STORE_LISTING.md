# Store Listing Draft

Use this as a starting point for Chrome Web Store or Microsoft Edge Add-ons.

## Extension Name

NotebookLM Source Bulk Delete

## Short Description

Bulk delete selected sources from the current NotebookLM notebook.

## Detailed Description

NotebookLM makes it easy to add many sources through web search, research workflows, and bulk imports, but cleaning up those sources later can be slow. NotebookLM Source Bulk Delete adds a small local toolbar to the source panel so you can select sources, review them, and delete them in one confirmed batch.

Features:

- Adds an `All / Clear / Delete` toolbar to NotebookLM.
- Reuses NotebookLM's native source checkboxes.
- Shows a confirmation list before deleting.
- Deletes selected sources sequentially through the NotebookLM UI.
- Shows progress, cancellation, and final summary.
- Runs locally in the browser.
- Does not collect analytics, upload NotebookLM data, or store Google cookies.

This extension removes sources from the current NotebookLM notebook. It does not delete original Google Drive files.

This project is not affiliated with, endorsed by, or sponsored by Google or NotebookLM.

## Category

Productivity

## Language

English

## Permission Justification

Host permission:

```text
https://notebooklm.google.com/*
```

Reason:

The extension needs access to NotebookLM pages to add the bulk-delete toolbar and interact with visible source checkboxes, source menus, and delete confirmation dialogs. The extension does not request broad host permissions and does not run on other websites.

## Data Usage

The extension does not collect, transmit, sell, or share user data.

It reads the current NotebookLM page DOM locally in order to find source rows, selected checkboxes, menu buttons, and delete confirmation controls. It does not send this data to any server.

## Test Instructions For Review

1. Install the extension.
2. Open a NotebookLM notebook with several disposable sources.
3. Confirm the toolbar appears under `Add sources`.
4. Select two or more sources.
5. Click `Delete`.
6. Confirm the listed source names.
7. Verify the selected sources are removed and the summary is shown.

