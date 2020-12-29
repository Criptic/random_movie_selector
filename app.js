const express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { WebClient, LogLevel } = require("@slack/web-api");

const app = express();

// Load base configurations
const config = require('./configuration.json');
const {spreadsheetId, sheetName, range, watchedStatusColumn, slackToken, slackChannelId} = config;

// Base for the movie selection
const path = './unwatchedMovies.json';
let movieList = [];

// Base for Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
let rowId = null;
let CLIENTSECRET = "";
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    else CLIENTSECRET = JSON.parse(content);
});

// Base for Slack
const client = new WebClient({
    token: slackToken,
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG
  });

// Check if the file exists, if it doesn't trigger a data collection
// If it isn't loaded, starts the Google Sheets API process
if (fs.existsSync(path)) {
    let rawMovies = fs.readFileSync(path);
    movieList = JSON.parse(rawMovies);
  } else {
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(CLIENTSECRET, listMajors);
}

app.get('/', (req, res) => {
  res.sendFile('./frontend/index.html', {root: __dirname });
});

app.get('/refreshData', (req, res) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), listMajors);
        res.send();
    });
});

app.get('/randomMovie', (req, res) => {
    let randomMovie = movieList[Math.floor(Math.random() * movieList.length)];
    let templateString = `
        <p id="movieId" style="display:none">${randomMovie[randomMovie.length - 1]}</p>
        <p><b>German-Title:</b> ${randomMovie[4]}</p>
        <p><b>English-Title:</b> ${randomMovie[5]}</p>
        <p><b>Release-Year:</b> ${randomMovie[3]}</p>
        <p><b>Collection:</b> ${randomMovie[2].length > 0 ? randomMovie[2] : "Stand-alone"}</p>`;
    res.send(templateString);
});

app.get('/watchMovie', (req, res) => {
    rowId = req.query.movieId;
    movieList.map(row => {
        if(row[row.length - 1] == rowId) {
            // Send a message to Slack
            let slackMessage = `English-Title: ${row[5]}, Release-Year: ${row[3]}`;
            publishMessage(slackChannelId, slackMessage);
            // Update the watched status in Google Sheets
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(CLIENTSECRET, updateRow);
            // Remove the movie from the unwatchedMovies.json
            /*
            let updatedMovieList = movieList.filter(movie => movie[movie.length - 1] != rowId);
            let result = JSON.stringify(updatedMovieList);
            movieList = result;
            fs.writeFileSync('unwatchedMovies.json', result);
            */
            return;
        }
    })
})

const server = app.listen(3000, () => console.log('Server ready'))

async function publishMessage(id, text) {
    try {
      // Call the chat.postMessage method using the built-in WebClient
      const result = await client.chat.postMessage({
        // The token you used to initialize your app
        token: slackToken,
        channel: id,
        text: text
        // You could also use a blocks[] array to send richer content
      });
  
      // Print result, which includes information about the message (like TS)
      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  }

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the information in the movie collection spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/<spreadsheetId>/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  unwatchedMovies = [];
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: 'Movies!A:H',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      rows.map((row, index) => {
        if(row[6] === '-'){
            row.push(index + 1);
            unwatchedMovies.push(row)
        }
      });
    } else {
      console.log('No data found.');
    }
    let result = JSON.stringify(unwatchedMovies);
    movieList = result;
    fs.writeFileSync('unwatchedMovies.json', result);
  });
}

function updateRow(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    var values = [
        [
          'X'
        ]
      ];
      var body = {
        values: values
      };
      sheets.spreadsheets.values.update({
         spreadsheetId: spreadsheetId,
         range: `Movies!G${rowId}`,
         valueInputOption: 'RAW',
         resource: body
      }).then(res => {
        console.log(res);
      });
}