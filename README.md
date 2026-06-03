# NotebookLM Source Bulk Delete

Clean up NotebookLM sources in batches instead of deleting them one by one.

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/notebooklm-source-bulk-de/limijmplbgpelnffnbjnfaidlppcodgk)

> Not affiliated with, endorsed by, or sponsored by Google or NotebookLM.

## Why This Exists

NotebookLM makes research intake fast. A web search, Fast Research run, Deep Research run, or bulk import can fill a notebook with dozens of web pages, PDFs, transcripts, images, and notes in minutes.

That is great while exploring. The painful part comes later.

After you synthesize the material into cleaner notes, briefs, summaries, or reports, many of those raw sources are no longer needed in the notebook. Today, cleanup is mostly manual: open a source menu, choose delete, confirm, wait, and repeat for every source.

This extension removes that repetitive cleanup loop.

## What It Does

NotebookLM Source Bulk Delete adds a compact toolbar to the NotebookLM source panel:

![NotebookLM Source Bulk Delete toolbar](./docs/assets/topbar.png)

- `All` selects visible sources.
- `Clear` clears the current source selection.
- `Delete` shows a confirmation list, then removes selected sources one by one through the NotebookLM UI.

Original Google Drive files are not deleted. The extension only removes sources from the current NotebookLM notebook.

## How It Helps

Use it when you:

- Imported many web results and only need the final synthesized answer.
- Ran a research workflow that added more sources than you want to keep.
- Want to reset a notebook after compressing source material into notes.
- Need to clean up experimental or duplicate sources without repeating the same menu flow dozens of times.

The goal is simple: keep NotebookLM useful for fast research intake without making cleanup feel like administrative work.

## Demo

### Before: one-by-one cleanup

![Manual one-by-one cleanup pain](./docs/assets/before.gif)

### After: batch delete flow

![Batch delete flow](./docs/assets/after.gif)

## How To Use

Use a disposable test notebook first, especially after NotebookLM UI updates.

1. Open a NotebookLM notebook.
2. Select sources manually, or click `All` to select visible sources.
3. Click `Clear` if you want to reset the selection.
4. Click `Delete`.
5. Review the confirmation list.
6. Confirm deletion.
7. Wait for the final summary.

## Install

Install the public extension from the Chrome Web Store:

[NotebookLM Source Bulk Delete](https://chromewebstore.google.com/detail/notebooklm-source-bulk-de/limijmplbgpelnffnbjnfaidlppcodgk)

The Chrome extension also works in Microsoft Edge because Edge supports Chrome Web Store extensions.

## Privacy

The extension is local-first:

- It runs only on `https://notebooklm.google.com/*`.
- It does not collect analytics or telemetry.
- It does not upload NotebookLM source names or contents.
- It does not store Google account cookies.
- It does not contact any server controlled by this project.

See the full [Privacy Policy](./docs/privacy.html).

## Limitations

This extension automates the visible NotebookLM web UI. NotebookLM may change its page structure, which can temporarily break selection or deletion. If that happens, please open an issue with the extension version and what you saw.

## Troubleshooting

If the toolbar does not appear, refresh the NotebookLM notebook page or reload the extension.

If selection or deletion stops working after a NotebookLM UI update, open DevTools on the NotebookLM page and run:

```js
window.nlmbdDebug()
```

The debug output only inspects the current page DOM. It does not send data anywhere.

## Local Development

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load it as an unpacked extension:

1. Open Chrome or Edge.
2. Go to `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the `extension` folder.
6. Open a NotebookLM notebook.

Run tests:

```bash
npm run test:all
```

Create a release zip:

```bash
npm run package:extension
```

## Project Documents

- [PRD.md](./PRD.md)
- [SPEC.md](./SPEC.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT. See [LICENSE](./LICENSE).
