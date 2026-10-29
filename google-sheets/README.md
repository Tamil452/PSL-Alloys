# Website enquiries → Google Sheets

The quote form on `index.html` sends each enquiry to a Google Apps Script web app.
The script adds a row to a Google Sheet, saves any attached drawing to Google Drive,
and emails an alert to `pslalloys@gmail.com`.

## One-time setup (about 5 minutes)

1. Sign in to the Google account that should own the enquiries (for example pslalloys@gmail.com).
2. Create a new Google Sheet, e.g. **PSL Alloys – Website Enquiries**.
3. In the sheet, open **Extensions → Apps Script**.
4. Delete the sample code, paste in all of [`Code.gs`](Code.gs), and click **Save**.
   - Optional: change `NOTIFY_EMAIL` (set it to `''` to turn off email alerts).
5. Click **Deploy → New deployment**, pick the type **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy**, then **Authorize access** and allow the permissions
   (Sheets, Drive for drawings, Gmail for alerts). If you see "Google hasn't verified this app",
   click **Advanced → Go to (project name)**. It's your own script, so this is expected.
7. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy.../exec`.
8. In `main.js`, paste it in:
   ```js
   var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
9. Publish the site and send a test enquiry. A sheet tab named **Enquiries** is created
   with headers on the first submission.

## Columns

Received · Name · Company · Email · Phone · Product · Quantity and notes · Drawing (Drive link) · Page

## Notes

- **Changing the script later:** use **Deploy → Manage deployments → Edit (pencil) → Version: New version**.
  That keeps the same URL. "New deployment" creates a new URL, which you would have to paste into `main.js` again.
- Drawings up to 10 MB are saved to a Drive folder named **PSL Alloys enquiry drawings**.
  Larger files are refused on the website, and the visitor is asked to email them.
- A hidden "website" field catches simple spam bots. Submissions that fill it in are dropped.
- If `FORM_ENDPOINT` is left empty, the form falls back to opening the visitor's email app.
