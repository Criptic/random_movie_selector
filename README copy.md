# Random Movie Selector

The Random Movie Selector application takes a Google Sheet with information of movies like title, release year, etc and the watch status (unwatched or watched), selects a random one and if it fits the mood it can be accept the watch status gets updated in the Google Sheet and a message is posted to a Slack channel.

I'm running this application on a Raspberry Pi 4 with a four inch touchscreen running Raspbian OS - yes a Raspberry Pi 4 is overkill for this application, but I'm using it for more stuff then just this application

To get this application up and running a few steps are required:

1. Get a Google Sheets API-key
2. Get a Slack token
3. Set up the application
4. Start watching

For each of these steps there will be a dedicated chapter below - except for the fourth one ;)

In the design folder I saved the affinity designer project and a svg of the logo I created for this application.

There is also a section about the Raspberry Pi with some additional set up information, if required.

# Google Sheets

I'm using Google Sheets as my collection tracking medium, because I can access it on any device, it has a create set of features and can easily be shared. In the past I used the scripting engine for Google Sheets but I was never really pleased with this setup as it was slow (might be because of sloppy coding on my part) - in the folder archive_script I have included my previous setup.

## Google Sheets Layout

Every movie collection is unique and so the different fields that are tracked are different. This application is flexible enough that with minimal effort any information that is stored inside of Google Sheets can be used. BUT **one column is needed** for this application and that is a column that tracks the **watch status**. Also another limitation is that more then 26 columns aren't supported and as I'm using only eight there are no plans on changing that.

## Google Sheets API Setup

Let's get up and running with the API

1. Go to [https://console.developers.google.com](https://console.developers.google.com/)
2. Create a new project with a name like _<RandomMovieSelector>_
3. Search for the Google Sheets API and enable it
4. On the page for the Google Sheets API click Create Credentials
5. Set Up the OAuth consent screen by clicking on it in the side bar (Select External, Enter an App Name, user support email and email), under Scopes add the Google Sheets API with the endpoint /auth/spreadsheets, under Test Users add your own email (important use @googlemail.com)
6. Then go to Credentials and click Create Credentials, Type: Desktop App and click through to the end
7. Under OAuth 2.0 Client IDs you should be able to download the credentials, rename them to credentials.json and move them into the root directory for this application

# Slack App

Having a Slack workspace is amazing as it is an easy hub for project based communication and adding different services to communicate with it. Here I'm using it to keep track of the date on which I watched which movie (I know there is also [Letterboxd.com](http://letterboxd.com) for this but I don't have access to the API).

## Getting a token

I'm using a private channel for this application but a public one works just as well:

1. Log into the Slack workspace to which this application should write
2. Go to [https://api.slack.com/start/overview#creating](https://api.slack.com/start/overview#creating)
3. Click the Create a Slack App button
4. Enter the App name (e.g. Random Movie Selector) and select the Slack workspace
5. Under OAuth & Permissions go to Bot Token Spaces > Add an OAuth Scope and enter chat:write
6. Scroll back to the top, copy and save OAuth Token
7. Click install to Workspace
8. Go to the Slack workspace and add the bot to a channel
9. Copy the channel id from the url [https://app.slack.com/client/<workspace-id/<](https://app.slack.com/client/TGXJPPTFE/G01HLJAKU05)channel-id>

There are two additional steps that can be taken to make the Slack integration a bit more fancy - but they are completely optional. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and select the Random Movie Selector, then on the Basic Information page scroll down to the section titled _Display Information_

1. Add the _Slack_App_Icon.png_ from the **design folder** as an App icon
2. Enter a description like*: Reports the random movie that was selected for your viewing pleasure* - under short description
3. Click the save changes button

# Setting up the application

Download the application from GitHub

```bash
git clone https://github.com/Criptic/random_movie_selector.git
```

Change into the application folder

```bash
cd random_movie_selector
```

Install the required packages for the application to run

```bash
npm install
```

Create the configuration.json file with the needed contents - replace <> with the corresponding information - here all the collected information needs to be filled in. The runsOnRaspberryPi is defaulted to false, if set to true it will shutdown the Raspberry Pi after having selected a random movie with the ok button

```bash
cat << EOF > configuration.json
{
    "spreadsheetId": "<spreadsheetId>",
    "sheetName": "<sheetName>",
    "range": "<range>",
    "watchedStatusColumn": "<watchedStatusColumn>",
    "unwatchedSymbol": "<unwatchedSymbol>",
    "watchedSymbol": "<watchedSymbol>",
    "slackToken": "<slackToken>",
    "slackChannelId": "<slackChannelId>",
    "runsOnRaspberryPi": false
}
EOF
```

Add the credentials.json file to the root folder of this application. After all this start up the application for the first time

```bash
npm start
```

Open up [localhost:3000](http://localhost:3000) in the web browser and hit the button Refresh Data, go back to the terminal, copy the URL into the web browser, authenticate with the Google Account which has access to the Google Sheet and copy the token back into the terminal. Now the application set up and ready to go.

# Raspberry Pi

Attach the Raspberry Pi to a Monitor or ssh into the Raspberry Pi (get the IP address of the Pi either through the router or type hostname -I in the shell of the Raspberry Pi

```bash
ssh pi@<ip-address>
```

Install node.js & npm on the Pi

```bash
sudo apt-get update
sudo apt install nodejs npm
# Test that the nodejs version is greater then v15.5.0 (that's the version I used)
node -v
```

Change into the folder the application should be downloaded into (e.g. Documents)

```bash
cd <~/Documents>
```

## Set up to start the application on boot

Two things are needed for this application to be coming up when starting the Raspberry Pi. First the server needs to be started and second a browser with the URL to the application needs to be opened.

To get the server up and running I'm using the npm module forever to register the application as a service

```bash
sudo npm install forever -g
sudo npm install forever-service -g
sudo forever-service install <service_name e.g random_movie_selector> -- script <path to app.js e.g /home/pi/Documents/random_movie_selector/app.js>
sudo service <service_name> start
```

And now start up the browser with the website opened up in a tab

```bash
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
/usr/bin/chromium-browser --kiosk  --disable-restore-session-state http://localhost:3000
```

The only problem for me with this solution is, that I have to hit the refresh button because it takes a bit longer for the server to start up but I'm okay with this solution.
