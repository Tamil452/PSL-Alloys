/**
 * PSL Alloys – website enquiries to Google Sheets.
 *
 * Paste this into Extensions > Apps Script of the enquiries spreadsheet and
 * deploy it as a web app (see README.md in this folder). Each quote request
 * from the website becomes one row; attached drawings are saved to a Drive
 * folder and linked from the row.
 */

var SHEET_NAME = 'Enquiries';
var DRAWINGS_FOLDER = 'PSL Alloys enquiry drawings';
var NOTIFY_EMAIL = 'pslalloys@gmail.com'; // set to '' to turn off email alerts
var MAX_FILE_BYTES = 10 * 1024 * 1024;
var HEADERS = ['Received', 'Name', 'Company', 'Email', 'Phone', 'Product', 'Quantity and notes', 'Drawing', 'Page'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.website) return reply({ ok: true }); // honeypot filled in: a bot
    if (!clean(data.name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(data.email))) {
      return reply({ ok: false, error: 'Name and a valid email are required.' });
    }

    var drawingUrl = data.drawing ? saveDrawing(data.drawing) : '';

    lock.waitLock(20000);
    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      clean(data.name), clean(data.company), clean(data.email), clean(data.phone),
      clean(data.product), clean(data.notes), drawingUrl, clean(data.page)
    ]);
    lock.releaseLock();

    if (NOTIFY_EMAIL) notify(data, drawingUrl);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function doGet() {
  return reply({ ok: true, service: 'PSL Alloys enquiries' });
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveDrawing(file) {
  var bytes = Utilities.base64Decode(file.data);
  if (bytes.length > MAX_FILE_BYTES) return 'File too large, not saved';
  var folders = DriveApp.getFoldersByName(DRAWINGS_FOLDER);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRAWINGS_FOLDER);
  var name = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HHmm') + ' ' + clean(file.name);
  var blob = Utilities.newBlob(bytes, file.type || 'application/octet-stream', name);
  return folder.createFile(blob).getUrl();
}

function notify(data, drawingUrl) {
  var lines = [
    'Name: ' + clean(data.name),
    'Company: ' + clean(data.company),
    'Email: ' + clean(data.email),
    'Phone: ' + clean(data.phone),
    'Product: ' + clean(data.product),
    'Drawing: ' + (drawingUrl || 'none'),
    '',
    clean(data.notes)
  ];
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: clean(data.email),
    subject: 'Website enquiry: ' + clean(data.product) + ' – ' + clean(data.name),
    body: lines.join('\n')
  });
}

// Trim, cap length, and stop values being read as spreadsheet formulas.
function clean(v) {
  var s = String(v == null ? '' : v).trim().slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
