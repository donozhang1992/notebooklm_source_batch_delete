# Contributing

Thanks for helping improve NotebookLM Source Bulk Delete.

## Development Setup

```bash
npm install
npm run test:all
```

## Workflow

- Keep changes small and focused.
- Use TDD for behavior changes.
- Run `npm run test:all` before opening a pull request.
- Do not add telemetry, external services, cookie storage, or broad host permissions.
- Keep the extension runtime lightweight.

## NotebookLM DOM Changes

NotebookLM is a web app and may change its DOM. If selection or deletion stops working:

1. Open a NotebookLM notebook.
2. Open DevTools.
3. Run:

```js
window.nlmbdDebug()
```

Include relevant selector/debug output in the issue or pull request.

## Safety

Use disposable test notebooks when changing delete behavior. The extension removes sources from the current NotebookLM notebook.

