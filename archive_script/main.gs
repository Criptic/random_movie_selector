function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu("Random Movie")
    .addItem("From all movies", "menuItem1")
    .addItem("An Unwatched movie", "menuItem2")
    .addSeparator()
    .addItem("An Action movie", "menuItem3")
    .addItem("A Comedy movie", "menuItem4")
    .addItem("A Documentary movie", "menuItem5")
    .addItem("A Drama movie", "menuItem6")
    .addItem("A Fantasy movie", "menuItem7")
    .addItem("A Horror movie", "menuItem8")
    .addItem("A Sci-Fi movie", "menuItem10")
    .addItem("A Thriller movie", "menuItem11")
    .addItem("A Western movie", "menuItem12")
    .addToUi();
}

function getMovieData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  return sheet.getRange("A2:H2000").getValues();
}

function getRandomNumber(lengthOfInput) {
  return Math.floor(Math.random() * Math.floor(lengthOfInput));
}

function createHtmlOutput(filtered, rndNr, title) {
  var htmlContent =
    "<p>" +
    filtered[rndNr][4] +
    " (" +
    filtered[rndNr][3] +
    ")</p><p>Englischer Titel: " +
    filtered[rndNr][5] +
    "</p><p>Enthalten in " +
    filtered[rndNr][2] +
    "</p></p>Genre: " +
    filtered[rndNr][7] +
    "</p><p>Format: " +
    filtered[rndNr][0] +
    "</p><p>Gesehen: " +
    filtered[rndNr][6] +
    "</p>";
  var htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(400)
    .setHeight(220);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, title);
}

function menuItem1() {
  var data = getMovieData();
  var rndNr = getRandomNumber(data.length);

  createHtmlOutput(data, rndNr, "Random Movie");
}

function menuItem2() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 6, "-");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Unwatched Movie");
}

function menuItem3() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Action");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Action Movie");
}

function menuItem4() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Comedy");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Comedy Movie");
}

function menuItem5() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Documentary");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Documentary Movie");
}

function menuItem6() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Drama");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Drama Movie");
}

function menuItem7() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Fantasy");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Fantasy Movie");
}

function menuItem8() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Horror");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Horror Movie");
}

function menuItem10() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Sci-Fi");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Sci-Fi Movie");
}

function menuItem11() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Thriller");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Thriller Movie");
}

function menuItem12() {
  var data = getMovieData();
  var filtered = ArrayLib.filterByText(data, 7, "Western");
  var rndNr = getRandomNumber(filtered.length);

  createHtmlOutput(filtered, rndNr, "Random Western Movie");
}
