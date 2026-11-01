# FourthSpace - Are we there yet?

An interactive system design diagram for the Project Snow MVP, with box text and a progress
spreadsheet stored in Google Sheets. There is no build step.

## Run it

Browsers can't load Markdown files from a page opened directly from disk, so serve the
folder:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. To publish it, host this folder on any static host,
such as GitHub Pages.

## Edit the content

### Box text

Click **Edit** above the diagram to change a box's type, title, subtitle and bullets on the
box. Select a box to change its full details in the side panel. Click **Done editing** to go
back to normal.

Changes are saved when you leave a field. They're stored in the `Content` tab of the Google
Sheet, and you can also edit that tab directly. Other people's open pages pick changes up
within 30 seconds.

The first time the page connects, it copies the starting text from the Markdown files into
the `Content` tab. **After that, the sheet wins for box text:** editing a box's Markdown file
has no effect while that box has a row in the tab. To go back to a file's text, delete the
box's row and refresh.

### Everything else

| To change | Edit |
| --- | --- |
| Arrow text | The Markdown file named at the bottom of its details panel |
| Adding, moving or removing boxes | The `Boxes` table in `content/diagram.md` |
| Arrows | The `Arrows` table in `content/diagram.md` |
| The About panel | `content/overview.md` |
| The Google Sheet connection | `content/progress.md` |

Refresh the page to see changes to these files. If an ID or file name is wrong, a banner at
the top of the page lists the problem.

### Add a box

1. Create a Markdown file for it, such as `content/merlin/new-thing.md`.
2. Add a row to the `Boxes` table. `Parent` is the ID of the box it sits inside, and `Col`
   and `Row` set its position in that box's grid, counting from 0.
3. Add a row to the `Arrows` table for each connection.

### Markdown features

- `## Steps`, `## Datasets` or `## Object types`: the top-level bullets also appear on the box or arrow. If a
  bullet starts with bold text, only the bold text appears on the diagram, and the whole
  bullet appears in the details panel.
- `> **To confirm:** your question`: highlights the note and adds a "To confirm" badge on
  the diagram. Delete the line once it's settled.

## Progress tracking

Each box without sub-boxes is one row in the spreadsheet, with Done, Status, Owner and
Notes. Parent boxes show a checkbox and count based on the boxes inside them, and ticking a
parent ticks all of them.

Done and Status stay in step: ticking a box sets its status to Done, and unticking it sets
the status back to Not started. Choosing any other status clears the tick.

The page checks the sheet every 30 seconds, so edits made by other people or directly in
the sheet appear without a refresh.

### Connect the Google Sheet

Until this is done, ticks work on the page but are lost on refresh.

1. Create a new Google Sheet.
2. Choose **Extensions > Apps Script**.
3. Replace the contents of `Code.gs` with `google-sheet/Code.gs` from this repo, then save.
4. Select the `setup` function, click **Run**, and approve the permissions. This creates
   the `Progress` tab.
5. Choose **Deploy > New deployment**, then select **Web app** as the type.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then click
   **Deploy**.
7. In `content/progress.md`, paste the web app URL into `Web app URL` and the sheet's
   address into `Sheet URL`.
8. Refresh the page. The first load adds a row to the sheet for every component.

If you change `Code.gs` later, publish it with **Deploy > Manage deployments**, then edit
the deployment and choose a new version. Until you do, the page turns box editing off if the
live script is too old to store it.

### Who can read and change the data

**Who has access** must be **Anyone**, because the page calls the script without a Google
sign-in. Anyone who has the web app URL can read and change the `Progress` and `Content` tabs,
including the architecture text, even without access to the sheet itself. The Edit button only
protects against accidents, not against someone calling the URL directly. The URL is visible
in this repo and in the page.

Don't put patient data, personal data beyond owner names, or secrets in the sheet. If the repo
is public, treat the tracker and box text as public too.
