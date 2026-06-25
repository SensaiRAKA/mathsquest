/* Maths Quest - progress log + daily summary email.
   Deploy as a Web App and paste the resulting URL into SYNC_URL in mathsquest.html. */

var SHEET_NAME = "Log";
var SUMMARY_EMAIL = "rakesh.26web@gmail.com";

function doPost(e) {
  var sheet = getLogSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.date || "",
    data.cat || "",
    data.correct === true,
    data.stars || 0,
    data.streak || 0,
    data.todayProgress || 0
  ]);
  return ContentService.createTextOutput("ok");
}

function getLogSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Date", "Category", "Correct", "Stars", "Streak", "TodayProgress"]);
  }
  return sheet;
}

function sendDailySummary() {
  var sheet = getLogSheet();
  var rows = sheet.getDataRange().getValues();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  var todays = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === today) todays.push(rows[i]);
  }

  if (todays.length === 0) {
    MailApp.sendEmail(SUMMARY_EMAIL, "Maths Quest - no activity today (" + today + ")",
      "No questions were answered today.");
    return;
  }

  var total = todays.length;
  var correct = 0;
  var mistakesByCat = {};
  for (var j = 0; j < todays.length; j++) {
    var row = todays[j];
    if (row[3] === true) {
      correct++;
    } else {
      var cat = row[2];
      mistakesByCat[cat] = (mistakesByCat[cat] || 0) + 1;
    }
  }
  var last = todays[todays.length - 1];
  var stars = last[4], streak = last[5], todayProgress = last[6];
  var accuracy = Math.round((correct / total) * 100);

  var weakSpots = [];
  for (var cat in mistakesByCat) {
    weakSpots.push(cat + " (" + mistakesByCat[cat] + ")");
  }

  var body =
    "Maths Quest daily summary for " + today + "\n\n" +
    "Questions answered: " + total + "\n" +
    "Correct: " + correct + " (" + accuracy + "%)\n" +
    "Daily goal progress: " + todayProgress + "\n" +
    "Total stars: " + stars + "\n" +
    "Day streak: " + streak + "\n" +
    (weakSpots.length ? "Categories to review: " + weakSpots.join(", ") + "\n" : "No mistakes today - great job!\n");

  MailApp.sendEmail(SUMMARY_EMAIL, "Maths Quest daily summary - " + today, body);
}

/* Run this once manually (Run menu) to schedule the daily email. */
function createDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "sendDailySummary") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("sendDailySummary")
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
}
