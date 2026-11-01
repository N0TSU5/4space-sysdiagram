// Google Apps Script backend for the Project Snow progress tracker.
// Setup steps are in README.md.

const TAB = 'Progress';
const HEADERS = ['ID', 'Component', 'Module', 'Done', 'Status', 'Owner', 'Notes', 'Updated'];
const COL = { id: 1, component: 2, module: 3, done: 4, status: 5, owner: 6, notes: 7, updated: 8 };
const STATUSES = ['Not started', 'In progress', 'Blocked', 'Done'];
const MAX_ROWS = 500;
const MAX_UPDATES = 100;
const MAX_TEXT = 2000;

// Run once from the Apps Script editor to create and format the tab.
function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(TAB) || book.insertSheet(TAB);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange(2, COL.done, MAX_ROWS, 1).insertCheckboxes();
  sheet.getRange(2, COL.status, MAX_ROWS, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build()
  );
}

function doGet() {
  const sheet = getSheet();
  const count = sheet.getLastRow() - 1;
  const rows = count < 1 ? [] : sheet.getRange(2, 1, count, HEADERS.length).getValues()
    .filter((r) => r[COL.id - 1])
    .map((r) => ({
      id: String(r[COL.id - 1]),
      done: r[COL.done - 1] === true,
      status: String(r[COL.status - 1] || 'Not started'),
      owner: String(r[COL.owner - 1] || ''),
      notes: String(r[COL.notes - 1] || ''),
    }));
  return json({ ok: true, rows: rows });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const updates = Array.isArray(body.updates) ? body.updates : [];
    if (updates.length > MAX_UPDATES) return json({ ok: false, error: 'Too many updates' });
    if (!updates.every(isValid)) return json({ ok: false, error: 'Invalid update' });

    const sheet = getSheet();
    updates.forEach((update) => applyUpdate(sheet, update));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Keeps Done and Status in step when people edit the sheet directly.
function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== TAB || e.range.getRow() < 2 || e.range.getNumRows() > 1) return;
  const row = e.range.getRow();
  if (e.range.getColumn() === COL.done) {
    const status = sheet.getRange(row, COL.status);
    if (e.range.getValue() === true) status.setValue('Done');
    else if (status.getValue() === 'Done') status.setValue('Not started');
  } else if (e.range.getColumn() === COL.status) {
    sheet.getRange(row, COL.done).setValue(e.range.getValue() === 'Done');
  }
  sheet.getRange(row, COL.updated).setValue(new Date());
}

function applyUpdate(sheet, update) {
  let row = findRow(sheet, update.id);
  if (!row) {
    row = Math.max(sheet.getLastRow(), 1) + 1;
    if (row > MAX_ROWS + 1) throw new Error('Sheet is full');
    sheet.getRange(row, COL.id).setValue(update.id);
    sheet.getRange(row, COL.done).setValue(false);
    sheet.getRange(row, COL.status).setValue('Not started');
  }
  sheet.getRange(row, COL.component).setValue(asText(update.component));
  sheet.getRange(row, COL.module).setValue(asText(update.module));

  const fields = update.fields || {};
  if ('done' in fields) sheet.getRange(row, COL.done).setValue(fields.done);
  if ('status' in fields) sheet.getRange(row, COL.status).setValue(fields.status);
  if ('owner' in fields) sheet.getRange(row, COL.owner).setValue(asText(fields.owner));
  if ('notes' in fields) sheet.getRange(row, COL.notes).setValue(asText(fields.notes));
  if (Object.keys(fields).length) sheet.getRange(row, COL.updated).setValue(new Date());
}

function isValid(update) {
  if (!update || !/^[a-z0-9-]{1,64}$/.test(String(update.id))) return false;
  const fields = update.fields || {};
  if ('done' in fields && typeof fields.done !== 'boolean') return false;
  if ('status' in fields && STATUSES.indexOf(fields.status) < 0) return false;
  return [update.component, update.module, fields.owner, fields.notes]
    .every((v) => v === undefined || (typeof v === 'string' && v.length <= MAX_TEXT));
}

// Stops typed text from running as a spreadsheet formula.
function asText(value) {
  const text = String(value === undefined ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function findRow(sheet, id) {
  const count = sheet.getLastRow() - 1;
  if (count < 1) return 0;
  const ids = sheet.getRange(2, COL.id, count, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return 0;
}

function getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB);
  if (!sheet) throw new Error('Run setup() first');
  return sheet;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
