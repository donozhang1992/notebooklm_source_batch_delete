# Multi-Agent Coordination Plan

This project can be completed by one main agent. If speed becomes important, use the following lightweight multi-agent setup.

The main agent is the only coordinator. It owns integration, branch merges, final decisions, and user communication.

Runtime multi-agent limits live in `.codex/config.toml`. Project-specific unit scopes, dependencies, and handoff rules live in this file. If these documents disagree, pause and let the main agent reconcile them before starting implementation.

## Global Rules

- TDD is mandatory for every implementation agent.
- Each unit works in a separate git worktree and branch.
- Each unit must commit its own branch before handing off.
- Agents commit only completed atomic work; they do not push.
- Commit history should represent feature or phase progress, not every edit operation.
- The main agent merges branches into the main branch serially.
- Agents do not edit outside their folder permission scope.
- Agents communicate through task files and final handoff notes, not shared hidden state.
- Agents stop after their exit criteria are met or after two repeated identical blockers.
- Any destructive git operation requires main-agent approval.

## Unit A: DOM And Selection

Branch:

- `codex/dom-selection`

Folder permission scope:

- `extension/src/config.js`
- `extension/src/dom.js`
- `extension/src/selection.js`
- `tests/unit/dom.test.js`
- `tests/unit/selection.test.js`
- `tests/fixtures/notebooklm-sources.html`
- `handoffs/codex-dom-selection.md`
- Relevant `TODO.md` lines only

Responsibilities:

- Detect source panel.
- Enumerate visible source rows.
- Extract source titles.
- Inject and manage extension-owned row checkboxes.
- Select all visible and clear selection.

Dependencies:

- None after harness creation.

Can run in parallel:

- Yes, with Unit B and Unit C.

Exit criteria:

- Unit tests for DOM and selection pass in that worktree.
- No changes outside permission scope.
- Handoff note includes selectors used and known fragility.

## Unit B: Delete Flow

Branch:

- `codex/delete-flow`

Folder permission scope:

- `extension/src/delete-flow.js`
- `extension/src/wait.js`
- `extension/src/config.js`
- `tests/unit/delete-flow.test.js`
- `handoffs/codex-delete-flow.md`
- Relevant `TODO.md` lines only

Responsibilities:

- Sequential deletion orchestration.
- Retry and timeout handling.
- Cancellation token.
- Batch result reporting.

Dependencies:

- Can mock DOM helpers; no dependency on Unit A.

Can run in parallel:

- Yes, with Unit A and Unit C.

Exit criteria:

- Delete-flow unit tests pass in that worktree.
- Cancellation and failure paths are covered.
- Handoff note includes batch result contract.

## Unit C: UI And E2E Fixture

Branch:

- `codex/ui-e2e-harness`

Folder permission scope:

- `extension/src/ui.js`
- `extension/src/content.js`
- `extension/content.css`
- `tests/e2e/extension-harness.spec.js`
- `tests/fixtures/notebooklm-sources.html`
- `README.md`
- `handoffs/codex-ui-e2e-harness.md`
- Relevant `TODO.md` lines only

Responsibilities:

- Toolbar UI.
- Confirmation dialog.
- Progress and summary UI.
- Playwright fixture test harness.
- User-facing README updates.

Dependencies:

- Can start with mock callbacks.
- Final integration depends on Unit A and Unit B contracts.

Can run in parallel:

- Yes initially. Final wiring waits for Unit A and Unit B.

Exit criteria:

- E2E fixture tests pass after integration.
- README includes install and manual validation steps.
- Handoff note lists manual NotebookLM browser test instructions.

## Main Agent Integration Order

1. Merge Unit A.
2. Merge Unit B.
3. Merge Unit C.
4. Resolve integration conflicts.
5. Run full unit suite.
6. Run E2E fixture suite.
7. Leave final real NotebookLM browser test for user.

## Communication Interface

Each unit leaves a handoff note in:

```text
handoffs/<branch-name>.md
```

Use `.codex/handoff-template.md` for the handoff note structure.

Required handoff fields:

- Branch.
- Files changed.
- Tests added.
- Tests passing.
- Commit hash or hashes created.
- Known limitations.
- Follow-up needed by main agent.

## Loop Prevention

Agents must stop and report if:

- The same test fails for the same reason after three fix attempts.
- NotebookLM selector assumptions cannot be validated in the fixture.
- Required files fall outside permission scope.
- Implementation requires a non-MVP decision, such as using private APIs.
