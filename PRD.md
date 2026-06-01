# PRD: NotebookLM Source Bulk Delete Browser Extension

## 1. Product Summary

Build a lightweight browser extension for Google NotebookLM that lets users delete multiple sources from a notebook in one operation.

NotebookLM currently supports selecting sources for chat context and importing multiple sources, but source cleanup remains mostly one-by-one. This creates a painful workflow after users import many web sources through search, Fast Research, Deep Research, or bulk URL workflows.

The first version should focus on a safe, local, page-level automation approach: inject controls into the NotebookLM web UI, let users choose sources, then perform the same delete actions a user would perform manually.

## 2. Problem Statement

Users who import many NotebookLM sources often need to later prune irrelevant, duplicate, outdated, failed, or low-quality sources. NotebookLM does not provide a native bulk delete action for selected sources, so users must repeatedly open each source menu, click delete, confirm, and wait for the UI to update.

This becomes especially frustrating when a notebook contains dozens or hundreds of sources created through automated web research.

## 3. Goals

- Let users delete multiple selected sources with one intentional action.
- Keep the extension privacy-preserving: no remote server, no account credential storage, no source content upload.
- Use minimal permissions scoped to NotebookLM.
- Make deletion transparent, confirmable, cancellable, and recoverable from partial failures.
- Ship an MVP that works reliably enough for personal use before investing in private API automation.

## 4. Non-Goals

- Do not build a full NotebookLM replacement.
- Do not delete original Google Drive files; only remove sources from the current NotebookLM notebook.
- Do not use or store Google account cookies in the MVP.
- Do not depend on an unofficial NotebookLM API in the MVP.
- Do not attempt to bypass NotebookLM limits, access controls, or authentication.
- Do not support mobile NotebookLM in the first version.

## 5. Target Users

- Researchers, students, analysts, job seekers, creators, and knowledge workers who use NotebookLM heavily.
- Users who rely on NotebookLM web search, Fast Research, Deep Research, or bulk URL imports.
- Users who need to clean notebooks after exploratory research.

## 6. Primary Use Cases

### 6.1 Delete Selected Sources

As a user, I want to select multiple sources in NotebookLM and delete them with one action, so I do not need to repeat the delete flow source by source.

### 6.2 Delete All Visible Sources

As a user, I want to filter/search the source list and delete all currently visible matching sources, so I can remove a category of unwanted sources quickly.

### 6.3 Review Before Delete

As a user, I want to see the list of sources that will be deleted before the operation starts, so I can avoid accidental data loss.

### 6.4 Track Progress

As a user, I want to see deletion progress and errors, so I know whether the cleanup completed successfully.

## 7. MVP Scope

### Included

- Chrome/Edge Manifest V3 extension.
- Runs on `https://notebooklm.google.com/*`.
- Injects a compact toolbar into the NotebookLM source panel.
- Adds extension-owned checkboxes next to sources if NotebookLM's native selection state is hard to reuse.
- Supports:
  - Select all visible sources.
  - Clear selection.
  - Delete selected sources.
  - Delete all visible sources.
  - Confirmation modal with source names and count.
  - Sequential deletion with progress.
  - Basic retry for failed source deletion.
  - Final summary: deleted count, failed count, skipped count.
- Works only on the currently open notebook page.
- Stores only local user preferences, such as confirmation preference or delay timing, if needed.

### Excluded From MVP

- Cross-notebook management.
- Bulk move/copy sources.
- Duplicate detection.
- Export sources.
- API-level batch deletion.
- Firefox support.
- Chrome Web Store publication workflow.
- Paid features or accounts.

## 8. User Experience

### 8.1 Entry Point

When the user opens a NotebookLM notebook, the extension detects the source panel and injects a small toolbar near the source list.

Suggested toolbar controls:

- Checkbox icon: select all visible
- X/clear icon: clear selection
- Trash icon: delete selected
- More/menu icon: advanced actions

Controls should feel like a native utility layer, not a marketing panel.

### 8.2 Source Selection

The extension should support one of two selection strategies:

- Preferred: reuse NotebookLM's native selected source state if it is stable and accessible.
- Fallback: add extension-owned checkboxes to source rows.

The MVP may start with extension-owned checkboxes because they reduce ambiguity and avoid interfering with NotebookLM's chat source selection behavior.

### 8.3 Confirmation

Before deletion, show a confirmation dialog:

- Title: Delete selected sources?
- Count of sources.
- Scrollable list of source titles.
- Warning that this removes sources from the current notebook.
- Clarify that original Drive files are not deleted.
- Primary action: Delete
- Secondary action: Cancel

### 8.4 Progress

During deletion:

- Disable destructive controls.
- Show current source title and progress, such as `12 / 48`.
- Provide a Cancel button that stops before the next source.
- Continue after non-critical failures and report failed items at the end.

### 8.5 Completion

After deletion:

- Show summary toast or modal:
  - Deleted: N
  - Failed: N
  - Cancelled/skipped: N
- If failures exist, list failed source names and suggest retrying.

## 9. Functional Requirements

### FR1: Detect NotebookLM Source Panel

The extension must detect when the user is on a NotebookLM notebook page and when the source panel is available.

Acceptance criteria:

- Toolbar appears only on NotebookLM notebook pages.
- Toolbar reappears after NotebookLM client-side navigation.
- Toolbar does not duplicate after route changes or re-renders.

### FR2: Enumerate Sources

The extension must identify visible source rows and extract display names.

Acceptance criteria:

- Source count in the extension matches visible sources in the panel.
- Source names shown in confirmation match the visible source names.
- The extension handles source list changes after deletion.

### FR3: Select Sources

The extension must let users select multiple sources for deletion.

Acceptance criteria:

- User can select and unselect individual sources.
- User can select all currently visible sources.
- User can clear all extension selections.

### FR4: Delete Sources Sequentially

The extension must delete selected sources by simulating the existing NotebookLM delete UI flow.

Acceptance criteria:

- For each source, the extension opens the source menu, clicks delete/remove, confirms deletion, and waits for the source row to disappear.
- The extension does not start deleting the next source until the previous action has completed or failed.
- The extension records failures without stopping the entire batch unless the user cancels.

### FR5: Cancel Operation

The extension must allow the user to stop a running batch.

Acceptance criteria:

- Cancel stops before the next source deletion.
- Already deleted sources remain deleted.
- The final summary clearly marks the operation as cancelled.

### FR6: Privacy

The extension must not transmit NotebookLM data to external servers.

Acceptance criteria:

- No analytics or telemetry in MVP.
- No remote API endpoint.
- No Google cookie extraction or storage.
- Host permission is limited to NotebookLM.

## 10. Non-Functional Requirements

- Reliability: deletion should work for at least 90% of sources in a typical source list when NotebookLM UI selectors match.
- Safety: destructive actions always require explicit confirmation.
- Performance: batch deletion should use a conservative delay between actions to avoid UI race conditions.
- Maintainability: selectors should be centralized and documented.
- Resilience: use multiple selector strategies where practical, such as ARIA labels, button text, and DOM structure.
- Accessibility: injected controls should be keyboard reachable and have labels/tooltips.

## 11. Technical Approach

### 11.1 MVP Architecture

- `manifest.json`
  - Manifest V3.
  - Host permission: `https://notebooklm.google.com/*`.
  - Content script injected on NotebookLM pages.
- `content.js`
  - Detect source panel.
  - Inject toolbar and checkbox UI.
  - Observe DOM changes with `MutationObserver`.
  - Perform deletion sequence.
- `styles.css`
  - Minimal styles for toolbar, checkboxes, dialog, progress UI.
- Optional `popup.html` / `popup.js`
  - Show extension status and basic settings.

### 11.2 Deletion Strategy

The MVP should use UI automation:

1. Resolve selected source rows.
2. For each row:
   - Ensure row is visible.
   - Locate row menu button.
   - Click row menu.
   - Locate delete/remove menu item.
   - Click delete/remove.
   - Locate confirmation button.
   - Confirm.
   - Wait until row disappears or timeout occurs.
3. Move to the next source.

### 11.3 Selector Strategy

Selectors should prefer stable signals:

- ARIA labels.
- Role attributes.
- Visible button/menu text.
- Source title text.

Avoid relying only on brittle generated class names.

### 11.4 Future API-Based Strategy

A future version may inspect NotebookLM network calls and perform direct delete requests. This should remain optional and behind a separate feasibility review because NotebookLM does not provide a public stable API for source management.

## 12. Risks And Mitigations

### Risk: NotebookLM DOM Changes

Mitigation:

- Centralize selectors.
- Use fallback selector strategies.
- Add visible error messages when selectors fail.
- Keep the extension small and easy to update.

### Risk: Accidental Deletion

Mitigation:

- Always show confirmation with count and source names.
- Require explicit click on Delete.
- Do not add a one-click destructive default.

### Risk: Deletion Race Conditions

Mitigation:

- Delete sequentially.
- Wait for DOM update after each delete.
- Use timeouts, retries, and progress reporting.

### Risk: Chrome Web Store Privacy Review

Mitigation:

- Limit permissions to NotebookLM.
- Avoid external requests.
- Publish a clear privacy policy.
- Avoid collecting source names, page content, cookies, or user identifiers.

### Risk: Google Terms Or Product Changes

Mitigation:

- MVP simulates normal user interactions.
- Avoid private API calls initially.
- Clearly position the extension as a local productivity helper.

## 13. Success Metrics

For personal/internal MVP:

- User can delete 20 selected sources without manual repeated clicks.
- User can delete all visible sources from a test notebook.
- Failed deletion rate below 10% on a stable NotebookLM UI session.
- No accidental deletion during normal selection and confirmation flow.

For public release:

- 95% successful deletion flow across common NotebookLM source types.
- Less than 3 seconds of user setup after installing extension.
- Chrome Web Store approval with minimal permissions.
- Positive qualitative feedback from heavy NotebookLM users.

## 14. Test Plan

### Manual Test Cases

- Empty notebook: toolbar does not break page.
- Notebook with 1 source: delete selected works.
- Notebook with 10 sources: select all visible and delete works.
- Notebook with mixed source types: URLs, PDFs, YouTube, Drive docs.
- Cancel after deleting some sources.
- Failed selector case: extension shows actionable error.
- NotebookLM route change: toolbar is not duplicated.
- Page refresh during operation: no corrupted extension state.

### Safety Test Cases

- Confirmation cancel deletes nothing.
- Clear selection deletes nothing.
- Delete button disabled when no sources selected.
- Original Drive file remains intact after removing a Drive source from NotebookLM.

## 15. Release Plan

### Phase 1: Local Prototype

- Build unpacked Chrome extension.
- Hardcode initial selectors based on current NotebookLM UI.
- Validate on one test notebook.

### Phase 2: Robust MVP

- Add fallback selectors.
- Add confirmation and progress UI.
- Add cancellation and failure reporting.
- Test across multiple notebooks and source types.

### Phase 3: Personal Daily Use

- Improve ergonomics based on real cleanup sessions.
- Add settings for action delay and retry count.
- Add debug mode for selector diagnostics.

### Phase 4: Public Packaging

- Prepare icon, screenshots, privacy policy, and store listing.
- Review permissions.
- Consider open-sourcing the code for trust.

## 16. Open Questions

- Should the extension reuse NotebookLM's native source selection, or keep its own deletion checkboxes?
- Should MVP support only current visible sources, or also sources hidden behind scrolling/virtualized lists?
- Does NotebookLM use virtualized rendering for large source lists?
- What source count should the MVP optimize for: 50, 100, or hundreds?
- Should the extension include source filtering in MVP, or rely on NotebookLM's existing search/filter UI first?
- Should there be an undo-like workflow, such as exporting source names/URLs before deletion?

## 17. Recommended MVP Decision

Start with extension-owned checkboxes and current visible source deletion. Keep the implementation local, permission-minimal, and UI-automation-based. Add API-level deletion only after the page automation version proves useful and the private request flow is understood well enough to evaluate risk.
