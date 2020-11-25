const mysql = require('mysql2/promise');
const { objForEach } = require('../utils');

class Sql {
	constructor(config) {
		// validate the configuration
		if (!config) throw new Error('Database not configured');
		if (!config.username) throw new Error('Database user name not configured');
		if (!config.password) throw new Error('Database password not configured');
		if (!config.host) throw new Error('Database host not configured');
		if (!config.name) throw new Error('Database name not configured');

		this.connection = mysql.createPool({
			host: config.host,
			user: config.username,
			password: config.password,
			database: config.name,
			waitForConnections: true,
			connectionLimit: config.connections,
			queueLimit: 0,
			timezone: '+00:00',
		});
	}

	async storeToken(token) {
		const connection = await this.connection;
		const insert = await connection.execute('INSERT INTO token(`access_token`, `refresh_token`) values(?,?)',
			[token.access_token, token.refresh_token]);
		// delete any old tokens, no need to keep them around
		await connection.execute(`DELETE FROM token WHERE token_id < ${insert.insertId - 5};`);
	}

	async end() {
		(await this.connection).end();
	}

	// get the most recent token and refresh key
	async getToken() {
		const connection = await this.connection;
		const [rows] = await connection.query('SELECT access_token, refresh_token, token_id FROM token ORDER BY token_id DESC LIMIT 1;');
		if (rows.length !== 1) throw new Error('Authentication token not present, try running setup');
		return {
			accessToken: rows[0].access_token,
			refreshToken: rows[0].refresh_token,
			tokenId: rows[0].token_id,
		};
	}

	// get thermostat information
	async getThermostatById(id) {
		// get the database
		const connection = await this.connection;
		const [result] = await connection.execute('SELECT * FROM thermostat WHERE thermostat_id = ?;', [id]);
		// test for result
		if (result.length === 0) throw new Error(`Invalid thermostat id: ${id}`);
		// decode any json values
		const thermostat = {};
		objForEach(result[0], (key, val) => {
			if (key.substr(0, 4) === 'json') {
				thermostat[key.substr(5)] = JSON.parse(val);
			} else {
				thermostat[key] = val;
			}
		});
		//  return the thermostat
		return thermostat;
	}

	async getThermostatByIdentifier(identifier) {
		// get the database
		const connection = await this.connection;
		return connection.execute('SELECT thermostat_id FROM thermostat WHERE identifier = ?', [identifier]);
	}

	// set all thermostats deleted (temporarily)
	async setThermostatsDeleted() {
		// get a database connection
		const connection = await this.connection;
		return connection.query('UPDATE thermostat SET deleted = 1;');
	}

	// set all sensors deleted (temporarily)
	async setSensorsDeleted(thermostatId) {
		// get a database connection
		const connection = await this.connection;
		return connection.query('UPDATE sensor SET deleted = 1 WHERE thermostat_id = ?', [thermostatId]);
	}

	// get a list of thermostat identifiers
	async getThermostatIdentifiers() {
		// get a database connection
		const connection = await this.connection;
		return connection.query('SELECT thermostat_id,identifier,name,connected,thermostat_revision,alert_revision,runtime_revision,internal_revision FROM thermostat;');
	}

	// get a list of sensors
	async getSensors(thermostatId) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute('SELECT * FROM sensor WHERE thermostat_id = ?;', [thermostatId]);
	}

	// update a thermostat's information
	async updateThermostat(thermostat) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`UPDATE thermostat SET
		name=?,
		connected=?,
		thermostat_revision=?,
		alert_revision=?,
		runtime_revision=?,
		internal_revision=?,
		deleted=0
		WHERE identifier=?`, [
			thermostat.name,
			thermostat.connected,
			thermostat.thermostat_revision,
			thermostat.alert_revision,
			thermostat.runtime_revision,
			thermostat.internal_revision,
			thermostat.identifier,
		]);
	}

	// insert a thermostat
	async insertThermostat(thermostat) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute('INSERT INTO thermostat(identifier,name,connected,thermostat_revision,alert_revision,runtime_revision,internal_revision) VALUES(?,?,?,?,?,?,?)', [
			thermostat.identifier,
			thermostat.name,
			thermostat.connected,
			thermostat.thermostat_revision,
			thermostat.alert_revision,
			thermostat.runtime_revision,
			thermostat.internal_revision,
		]);
	}

	async updateJsonValues(thermostat, id) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`UPDATE thermostat SET
		json_runtime = ?,
		json_extended_runtime = ?,
		json_electricity = ?,
		json_settings = ?,
		json_location = ?,
		json_program = ?,
		json_events = ?,
		json_device = ?,
		json_technician = ?,
		json_utility = ?,
		json_management = ?,
		json_alerts = ?,
		json_weather = ?,
		json_house_details = ?,
		json_oem_cfg = ?,
		json_equipment_status = ?,
		json_notification_settings = ?,
		json_privacy = ?,
		json_version = ?,
		json_remote_sensors = ?,
		json_audio = ?
	where
		thermostat_id = ?`, [
			JSON.stringify(thermostat.runtime),
			JSON.stringify(thermostat.extendedRuntime),
			JSON.stringify(thermostat.electricity),
			JSON.stringify(thermostat.settings),
			JSON.stringify(thermostat.location),
			JSON.stringify(thermostat.program),
			JSON.stringify(thermostat.events),
			JSON.stringify(thermostat.devices),
			JSON.stringify(thermostat.technician),
			JSON.stringify(thermostat.utility),
			JSON.stringify(thermostat.management),
			JSON.stringify(thermostat.alerts),
			JSON.stringify(thermostat.weather),
			JSON.stringify(thermostat.houseDetails),
			JSON.stringify(thermostat.oemCfg),
			JSON.stringify(thermostat.equipmentStatus.split(',')),
			JSON.stringify(thermostat.notificationSettings),
			JSON.stringify(thermostat.privacy),
			JSON.stringify(thermostat.version),
			JSON.stringify(thermostat.remoteSensors),
			JSON.stringify(thermostat.audio),
			id,
		]);
	}

	async updateSensor(sensorId, sensor) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`UPDATE sensor SET
		thermostat_id = ?,
		name = ?,
		type = ?,
		code = ?,
		in_use = ?,
		json_capability = ?,
		deleted = 0
		WHERE
		sensor_id = ?;`, [
			sensorId,
			sensor.name,
			sensor.type,
			sensor.code ?? null,
			sensor.in_use ? '1' : '0',
			JSON.stringify(sensor.capability),
			sensor.id,

		]);
	}

	async insertSensor(sensorId, sensor) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`INSERT INTO sensor(
			thermostat_id,
			identifier,
			name,
			type,
			code,
			in_use,
			json_capability
			)
			VALUES (?,?,?,?,?,?,?);`, [
			sensorId,
			sensor.id,
			sensor.name,
			sensor.type,
			sensor.code ?? null,
			sensor.in_use ? '1' : '0',
			JSON.stringify(sensor.capability),
		]);
	}

	async getThermostatRuntimeInfo(thermostatId) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute('SELECT * FROM runtime_report_thermostat WHERE thermostat_id=? ORDER BY timestamp DESC LIMIT 1;', [
			thermostatId,
		]);
	}

	async insertThermostatRuntimeReport(columns, valuePlaceholder, duplicateColumns, values) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`INSERT INTO runtime_report_thermostat (${columns}) values (${valuePlaceholder}) ON DUPLICATE KEY UPDATE ${duplicateColumns}`, values);
	}

	async insertSensorRuntimeReport(columns, duplicateColumns, values) {
		// get a database connection
		const connection = await this.connection;
		return connection.execute(`INSERT INTO runtime_report_sensor(${columns}) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ${duplicateColumns}`, values);
	}
}

module.exports.Sql = Sql;
