# Privacy Policy

NotebookLM Source Bulk Delete is designed to run locally in your browser.

For a browser-friendly version suitable for extension store listings, see [docs/privacy.html](./docs/privacy.html).

## Data Collection

The extension does not collect, transmit, sell, or share user data.

It does not:

- Send analytics or telemetry.
- Upload NotebookLM source names or contents.
- Store Google account cookies.
- Store NotebookLM notebook contents.
- Contact any remote server controlled by this project.

## Permissions

The extension requests access only to:

```text
https://notebooklm.google.com/*
```

This permission is needed so the content script can add the bulk-delete toolbar and interact with the NotebookLM page you are already viewing.

## Local Page Inspection

The extension reads the NotebookLM page DOM in order to find source rows, selected checkboxes, source menus, and delete confirmation controls. This inspection happens locally in the browser.

## Debug Helper

The extension exposes `window.nlmbdDebug()` on NotebookLM pages for troubleshooting selector changes. It only returns information from the current page DOM and does not send data anywhere.

## Changes

If this privacy behavior changes in a future version, the README and this policy should be updated before release.
