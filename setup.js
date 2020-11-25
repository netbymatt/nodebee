const config = require('./utils/loadconfig');;
const { NodeBee } = require('./ecobee');
const { Sql } = require('./sql');
const testPin = require('./setup/testpin');

// use more connections for setup as there is a lot of data going back and forth
config.db.connections = 20;

// set up the SQL connection
const sql = new Sql(config.db);

(async () => {
	// configure nodebee
	const nodeBee = new NodeBee(config.nodeBee, sql);
	// test database
	console.log('Testing database');
	const dbTest = await nodeBee.dbTest();
	console.log('Database connection successful!');
	console.log('Getting authorization pin...');
	const auth = await nodeBee.authorize();
	console.log('1. Open ecobee.com and go to My Apps > Add Application');
	console.log(`2. Enter Pin: ${auth.ecobeePin.toUpperCase()}`);
	console.log('Waiting for pin...');

	const token = await testPin(nodeBee, auth);

	// store the token
	await nodeBee.sql.storeToken(token);
	console.log('3. Syncing thermostats');
	// sync thermostats and get changes
	const thermostatChanges = await nodeBee.getThermostatSummary();
	// get remaining thermostat data
	await nodeBee.syncThermostats();
	// get runtime reports for changed thermostats
	console.log('4. Getting runtime reports');
	await Promise.all(thermostatChanges.map((thermostat, idx) => nodeBee.syncRuntimeReport(thermostat.thermostat_id, idx)));
	// close db
	console.log('Done!');
	sql.end();
})();
