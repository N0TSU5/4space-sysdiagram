// Google Apps Script backend for a FourthSpace board's progress tracker. Each board uses
// its own spreadsheet with its own copy of this script.
// Setup steps are in README.md.

const TAB = 'Progress';
const HEADERS = ['ID', 'Component', 'Module', 'Done', 'Status', 'Owner', 'Notes', 'Updated'];
const COL = { id: 1, component: 2, module: 3, done: 4, status: 5, owner: 6, notes: 7, updated: 8 };
const STATUSES = ['Not started', 'In progress', 'Blocked', 'Done'];
const MAX_ROWS = 500;
const MAX_UPDATES = 100;
const MAX_TEXT = 2000;
const CONTENT_TAB = 'Content';
const CONTENT_HEADERS = ['ID', 'Title', 'Subtitle', 'Type', 'Details', 'Updated'];
const CONTENT_COL = { id: 1, label: 2, sub: 3, kind: 4, md: 5, updated: 6 };
const MAX_DETAILS = 20000;

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
  getContentSheet();
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
  return json({ ok: true, rows: rows, content: readContent() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const updates = Array.isArray(body.updates) ? body.updates : [];
    const content = Array.isArray(body.content) ? body.content : [];
    if (updates.length > MAX_UPDATES || content.length > MAX_UPDATES) return json({ ok: false, error: 'Too many updates' });
    if (!updates.every(isValid) || !content.every(isValidContent)) return json({ ok: false, error: 'Invalid update' });

    if (updates.length) {
      const sheet = getSheet();
      updates.forEach((update) => applyUpdate(sheet, update));
    }
    if (content.length) applyContent(content);
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
  // Rows are found by ID because the checkboxes make getLastRow() count every formatted row.
  const ids = readIds(sheet);
  let index = ids.indexOf(update.id);
  const isNew = index < 0;
  if (isNew) index = ids.indexOf('');
  if (index < 0) throw new Error('Sheet is full');
  const row = index + 2;
  if (isNew) {
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

function readContent() {
  const sheet = getContentSheet();
  const count = sheet.getLastRow() - 1;
  if (count < 1) return [];
  return sheet.getRange(2, 1, count, CONTENT_HEADERS.length).getValues()
    .filter((r) => r[CONTENT_COL.id - 1])
    .map((r) => ({
      id: String(r[CONTENT_COL.id - 1]),
      label: String(r[CONTENT_COL.label - 1]),
      sub: String(r[CONTENT_COL.sub - 1]),
      kind: String(r[CONTENT_COL.kind - 1]),
      md: String(r[CONTENT_COL.md - 1]),
    }));
}

function applyContent(items) {
  const sheet = getContentSheet();
  const count = sheet.getLastRow() - 1;
  const ids = count < 1 ? [] : sheet.getRange(2, CONTENT_COL.id, count, 1).getValues().map((r) => r[0]);
  items.forEach((item) => {
    let index = ids.indexOf(item.id);
    if (index >= 0 && item.seed) return; // never let starting text replace saved text
    if (index < 0) {
      if (ids.length >= MAX_ROWS) throw new Error('Content tab is full');
      index = ids.push(item.id) - 1;
      sheet.getRange(index + 2, CONTENT_COL.id).setValue(item.id);
    }
    const fields = item.fields || {};
    ['label', 'sub', 'kind', 'md'].forEach((name) => {
      if (name in fields) sheet.getRange(index + 2, CONTENT_COL[name]).setValue(asText(fields[name]));
    });
    if (!item.seed) sheet.getRange(index + 2, CONTENT_COL.updated).setValue(new Date());
  });
}

function isValidContent(item) {
  if (!item || !/^[a-z0-9-]{1,64}$/.test(String(item.id))) return false;
  const fields = item.fields || {};
  if ('label' in fields && (typeof fields.label !== 'string' || !fields.label.trim())) return false;
  return ['label', 'sub', 'kind', 'md'].every((name) => {
    if (!(name in fields)) return true;
    return typeof fields[name] === 'string' && fields[name].length <= (name === 'md' ? MAX_DETAILS : MAX_TEXT);
  });
}

// The leading apostrophe stores typed text as text, so it can't run as a formula or become a date.
function asText(value) {
  const text = String(value === undefined ? '' : value);
  return text ? "'" + text : text;
}

function readIds(sheet) {
  const count = Math.min(sheet.getMaxRows() - 1, MAX_ROWS);
  return sheet.getRange(2, COL.id, count, 1).getValues().map((r) => r[0]);
}

function getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TAB);
  if (!sheet) throw new Error('Run setup() first');
  return sheet;
}

function getContentSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(CONTENT_TAB);
  if (!sheet) {
    sheet = book.insertSheet(CONTENT_TAB);
    sheet.getRange(1, 1, 1, CONTENT_HEADERS.length).setValues([CONTENT_HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
