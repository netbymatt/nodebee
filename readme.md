# NodeBee

## About

A Node.js tool for logging Ecobee thermostat data. Using the Ecobee API data is periodically downloaded and stored in an mySQL database. See the companion project [nodebee-frontend](https://github.com/netbymatt/nodebee-frontend) for visualizing the recorded data.

## Requirements
- An Ecobee thermostat
- An Ecobee developer account (free, details below)
- A server with Node.js and mySQL

## Quick start

### Server
1. Clone this project to your server
```
git clone https://github.com/netbymatt/nodebee.git
```
2. Create the database from the provided file.
```
mysql -u <username> -p nodebee < nodebee.sql
```

### Ecobee account
1. Set up an Ecobee developer account at https://www.ecobee.com/developers/
2. Create an Ecobee app by logging in to your Ecobee account then `Menu > Developer > Create New` and use the Ecobee PIN method.
3. Record the API key that is created for the new app.

### Node.js app
1. Open config.js
2. Enter your API key on the `clientId` line. Then uncomment the line.
3. Enter the database credentials, host name and database name in `username`, `password`, `host` and `name`. Then uncomment each line
4. Run the setup routine. It will test the database connection and then guide you through the process of connecting the app with your Ecobee account.
```
npm run setup
```
5. Wait while the app downloads all of the historical data available from your thermostat. This process can take several minutes as Ecobee provides up to one year of historical data and requests that you rate limit the calls to the API, which this application respects.

### Log data
- Update data one time with `npm start` all data from the last update will be downloaded and stored to the database
- Update data every minute with `npm run cron`

## Further details
The quick start routine is just that... a quick start. It has the following limitations:
- Stores your database credentials and Ecobee API key in a file on the system against current best practices.
- Ties up a terminal instance with the running cron job

### Store configuration in environment variables
Storing your credentials in a file within the project is not considered a best practice. Instead environment variables should be used store this information. Nodebee uses the following environment variables to store configuration details:

config.js | Environment variable | default
--- | --- | --
nodeBee.clientId | NODEBEE_CLIENT_ID | 
db.username | NODEBEE_DB_USERNAME | 
db.password | NODEBEE_DB_PASSWORD | 
db.host | NODEBEE_DB_HOST | localhost
db.name | NODEBEE_DB_NAME | nodebee

After creating the environment variables make sure to clear out any stored credentials from config.js, or just delete the file entirely.

### Run in the background
PM2 is recommended to run the process in the background, and start it automatically at boot. Use these commands to install PM2 and configure the process.
```
# install pm2
npm install -g pm2

# start the nodebee process
pm2 cron.js --name nodebee

# restart pm2 automatically
pm2 startup
# follow the instructions that this command outputs
pm2 save
```

## Acknowledgements
NodeBee is based on the work of [Jon Ziebell](https://github.com/ziebelje) and the PHP-based [sqlbee](https://github.com/ziebelje/sqlbee)