# TODO: NotebookLM Bulk Delete Extension

Status legend:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

## Phase 0: Harness And Scope

- [x] Create PRD.
- [x] Create SPEC.
- [x] Create README skeleton.
- [x] Create multi-agent coordination notes.
- [x] Create `.codex/config.toml` multi-agent constraints.
- [x] Create `.codex` handoff and agent policy files.
- [x] Create package/test configuration files.
- [x] Create extension source skeleton.
- [x] Create unit test harness skeleton.
- [x] Create Playwright fixture E2E harness skeleton.
- [x] Do not execute tests until user approves implementation run.

## Phase 1: TDD Unit Implementation

- [x] Write failing tests for source panel detection.
- [x] Implement `findSourcePanel`.
- [x] Write failing tests for visible source row enumeration.
- [x] Implement `findSourceRows`.
- [x] Write failing tests for source title extraction.
- [x] Implement `getSourceTitle`.
- [x] Write failing tests for checkbox injection.
- [x] Implement `ensureRowCheckbox`.
- [x] Write failing tests for select all and clear selection.
- [x] Implement `selectAllVisible` and `clearSelection`.

## Phase 2: TDD Delete Flow

- [x] Write failing tests for sequential deletion ordering.
- [x] Implement sequential delete orchestration.
- [x] Write failing tests for source-level failures.
- [x] Implement failed item collection.
- [x] Write failing tests for cancellation.
- [x] Implement cancellation token behavior.
- [x] Write failing tests for retry policy.
- [x] Implement retry behavior.

## Phase 3: UI Integration

- [x] Write failing tests for toolbar injection idempotency.
- [x] Implement toolbar injection.
- [x] Write failing tests for confirmation dialog.
- [x] Implement confirmation dialog.
- [x] Write failing tests for progress and summary states.
- [x] Implement progress and summary UI.
- [x] Wire content script composition.

## Phase 4: E2E Fixture

- [x] Write E2E test for toolbar and checkbox injection.
- [x] Write E2E test for select all visible.
- [x] Write E2E test for delete selected.
- [x] Write E2E test for cancellation.
- [x] Write E2E test for rerender idempotency.
- [x] Implement fixture behaviors needed by tests.

## Phase 5: Manual Browser Validation

- [x] Load unpacked extension.
- [x] Validate on local fixture page.
- [x] User validates on real NotebookLM notebook.
- [x] Record NotebookLM UI selector adjustments.
- [x] Update README troubleshooting notes.

## Scope Guardrails

- [x] No private NotebookLM API calls in MVP.
- [x] No telemetry.
- [x] No account cookie storage.
- [x] No broad host permissions.
- [x] No framework dependency in extension runtime.
- [x] Commit only complete atomic work.
- [x] Do not push.
