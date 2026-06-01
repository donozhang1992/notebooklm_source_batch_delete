# SPEC: NotebookLM Source Bulk Delete Extension

## 1. Engineering Principles

- TDD is mandatory. Every behavior starts as a failing test, then implementation is added, then tests are kept green.
- Prefer small, readable modules over clever abstractions.
- Keep the extension lightweight: no framework, no build-heavy runtime, no remote services.
- Prefer DOM/ARIA-based selectors over generated class names.
- Keep destructive behavior explicit, confirmed, sequential, and cancellable.
- No external data collection, telemetry, cookie extraction, or private API calls in MVP.

## 2. MVP Deliverable

A Manifest V3 browser extension that runs on NotebookLM pages and provides bulk deletion controls for sources in the current notebook.

The MVP must support:

- Inject toolbar into source panel.
- Add extension-owned selection checkboxes to visible source rows.
- Select all visible sources.
- Clear selection.
- Confirm before delete.
- Delete selected sources sequentially through NotebookLM UI.
- Stop before next source when cancelled.
- Report deleted, failed, and skipped sources.
- Avoid duplicate toolbar/checkbox injection after DOM rerenders.

## 3. Repository Layout

```text
.
|-- README.md
|-- PRD.md
|-- SPEC.md
|-- TODO.md
|-- AGENTS.md
|-- package.json
|-- vitest.config.js
|-- playwright.config.js
|-- extension
|   |-- manifest.json
|   |-- content.css
|   |-- dist
|   |   `-- content.js
|   `-- src
|       |-- content.js
|       |-- config.js
|       |-- dom.js
|       |-- selection.js
|       |-- delete-flow.js
|       |-- ui.js
|       `-- wait.js
`-- tests
    |-- fixtures
    |   `-- notebooklm-sources.html
    |-- unit
    |   |-- dom.test.js
    |   |-- selection.test.js
    |   `-- delete-flow.test.js
    `-- e2e
        `-- extension-harness.spec.js
```

## 4. Test Strategy

### 4.1 Unit Tests

Unit tests run in `jsdom` through Vitest.

Covered modules:

- `dom.js`: source panel discovery, source row enumeration, menu button discovery.
- `selection.js`: checkbox state, select all visible, clear selection, row identity.
- `delete-flow.js`: sequential deletion orchestration, retry, cancellation, result summary.

### 4.2 E2E Harness

Playwright uses `tests/fixtures/notebooklm-sources.html`, a local NotebookLM-like fixture page.

The E2E harness validates:

- Toolbar injection.
- Checkbox injection.
- Select all visible.
- Confirmation modal.
- Sequential source removal.
- Cancel behavior.
- No duplicate toolbar after fixture rerender.

Final validation against the real NotebookLM website is intentionally left for the user because it requires an authenticated Google session.

### 4.3 Manual Browser Test

Manual test steps are documented in `README.md`. The final real NotebookLM browser test should be performed by the user after local test harness passes.

## 5. TDD Workflow

For each task:

1. Add or update a focused failing test.
2. Implement the smallest code that satisfies the test.
3. Refactor only with tests green.
4. Update `TODO.md` task status.
5. Keep README accurate when user-facing behavior changes.

Do not add untested behavior except static metadata, manifest fields, or documentation.

## 6. Module Contracts

### 6.1 `config.js`

Exports stable constants:

- Extension DOM ids/classes.
- Selector candidates.
- Default timeouts.
- Default delay/retry settings.

### 6.2 `dom.js`

Responsible only for finding and describing NotebookLM DOM elements.

Expected exports:

- `findSourcePanel(root)`
- `findSourceRows(root)`
- `getSourceTitle(row)`
- `findRowMenuButton(row)`
- `findMenuItem(root, labels)`
- `findConfirmButton(root)`
- `isVisible(element)`

No UI injection and no deletion orchestration belongs here.

### 6.3 `selection.js`

Responsible for extension-owned selection state.

Expected exports:

- `ensureRowCheckbox(row)`
- `getSelectedRows(root)`
- `selectAllVisible(root)`
- `clearSelection(root)`
- `syncSelectionUi(root)`

### 6.4 `ui.js`

Responsible for injected extension UI.

Expected exports:

- `ensureToolbar(root, callbacks)`
- `showConfirmDialog(items)`
- `showProgress(state)`
- `showSummary(result)`
- `removeExtensionUi(root)`

### 6.5 `delete-flow.js`

Responsible for sequential deletion through NotebookLM UI.

Expected exports:

- `deleteRowsSequentially(rows, options)`
- `createCancellationToken()`

The delete flow receives DOM helper functions through options so tests can mock click behavior without depending on a real NotebookLM page.

### 6.6 `content.js`

Small composition layer:

- Starts MutationObserver.
- Calls DOM discovery.
- Injects toolbar and checkboxes.
- Wires toolbar actions to selection and delete flow.

## 7. Selector Policy

Selectors must be centralized in `config.js`.

Preferred order:

1. Extension-owned ids/classes.
2. ARIA roles and labels.
3. Visible text.
4. Stable semantic attributes.
5. DOM structure fallback.

Generated framework class names are allowed only as last-resort fallbacks and must be commented.

## 8. Error Handling

Deletion should continue after source-level failures unless cancelled.

Each failed item should include:

- Source title.
- Failure stage.
- Error message.

Batch result shape:

```js
{
  deleted: [{ title }],
  failed: [{ title, stage, message }],
  skipped: [{ title, reason }],
  cancelled: false
}
```

## 9. Performance Constraints

- No polling loop tighter than 250 ms.
- MutationObserver callbacks must be debounced.
- Sequential delete delay defaults to a conservative value and is configurable in code.
- No heavy dependencies in extension runtime.
- Source modules are bundled into one content script because Chrome content scripts are not loaded as regular ES modules.
- The extension runtime bundle should stay small and dependency-free.

## 10. Multi-Agent Plan

Use multi-agent only if active implementation time is constrained. The project is small enough for one engineer, but a lightweight multi-agent split can help finish inside a 4-hour window.

The recommended split is documented in `AGENTS.md`. Do not start agents until the harness exists and branch/worktree names are chosen.

## 11. Definition Of Done

- All unit tests pass.
- E2E fixture tests pass.
- Extension loads as unpacked extension in Chrome/Edge.
- README has install and manual test instructions.
- Real NotebookLM browser test is ready for the user to perform.
- No broad permissions beyond NotebookLM host access.
- No network calls from the extension runtime.
