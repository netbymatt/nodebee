// run a single update of the thermostat

const config = require('./utils/loadconfig');;
const { NodeBee } = require('./ecobee');
const { Sql } = require('./sql');

// configure sql and nodeBee
const sql = new Sql(config.db);
const nodeBee = new NodeBee(config.nodeBee, sql);

// call nodeBee
const update = async (cron) => {
	try {
		const result = await nodeBee.getThermostatSummary();
		await nodeBee.syncThermostats();
		// use the results to update specific thermostats
		await Promise.all(result.map(async (thermostat) => {
			await nodeBee.syncRuntimeReport(thermostat.thermostat_id);
		}));
		if (!cron) sql.end();
		console.log('Done updating!');
	} catch (e) {
		console.error(e);
	}
};

const end = async () => {
	await sql.end();
};

module.exports.update = update;
module.exports.end = end;
