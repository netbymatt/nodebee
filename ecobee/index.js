const { DateTime, Duration, Interval } = require('luxon');
const { Agent } = require('https');
const {
	Https, objForEach, objDiff, syncFor,
} = require('../utils');

// Some constants to help clean up code
const { SYNC_THERMOSTATS_SELECTION, RUNTIME_REPORT_COLUMNS } = require('./constants');

const endpoints = {
	base: 'https://api.ecobee.com/',
	version: '1/',
	thermostatSummary: {
		method: 'GET',
	},
	thermostat: {
		method: 'GET',
	},
	runtimeReport: {
		method: 'GET',
	},
};

// create an http agent to limit the number of open connections per the ecobee API
const agent = new Agent({
	maxSockets: 3,
});

const https = new Https({
	headers: {
		'Content-Type': 'application/json;charset=UTF8',
	},
	agent,
});

// returns an endpoint url and method from the above object
// defaults: POST, authorization
const buildEndpoint = (name) => {
	// check if endpoint exists
	if (!endpoints[name] || name === 'base' || name === 'version') throw new Error('Unknown endpoint');
	// get the valid endpoint
	const endpoint = endpoints[name];
	// default for strings
	if (typeof endpoint === 'string') {
		return {
			url: new URL(endpoints.base + endpoints.version + endpoint),
			method: 'POST',
			auth: true,
		};
	}
	// object found
	return {
		url: new URL(endpoints.base + endpoints.version + (endpoint.path ?? name)),
		method: endpoint.method ?? 'POST',
		auth: endpoint.auth ?? true,
	};
};

class NodeBee {
	// config:
	// {
	// 	clientId: '',
	// 	logApiCalls: false,
	// }

	constructor(config, sql) {
		// validate the configuration
		if (!config.clientId) throw new Error('Client ID not configured');
		// default options for scope and logApiCalls
		this.config = {
			scope: 'smartRead',
			logApiCalls: false,
			...config,
		};
		// store the database
		this.sql = sql;
	}

	async ecobeeApi(endpointName, _options, _token) {
		// get endpoint
		const endpoint = buildEndpoint(endpointName);

		// add the client id and format to options
		const options = {
			format: 'json',
			client_id: this.config.clientId,
			body: JSON.stringify(_options),
		};

		// get authorization token if not present
		let token = _token;
		if (!token) token = await this.sql.getToken();
		// build headers
		const headers = {};
		if (endpoint.auth) headers.Authorization = `Bearer ${token.accessToken}`;

		// add parameters to URL if get method
		let postData;
		if (endpoint.method === 'GET') {
			objForEach(options, (key, value) => endpoint.url.searchParams.append(key, value));
		} else {
			// build a data string for POST method
			const url = new URL(endpoint.url);
			objForEach(options, (key, value) => url.searchParams.append(key, value));
			postData = url.search.slice(1);
		}

		// call the endpoint
		// TODO log
		const responseRaw = await https.request(endpoint.url, {
			method: endpoint.method,
			headers,
		}, postData);

		// convert json to object
		try {
			const response = JSON.parse(responseRaw);
			// TODO log

			// look at the response status
			if (response?.status?.code === 14) {
			// only one try at refreshing
				if (_token) throw new Error('Unable to refresh token');
				// refresh the token
				const newToken = await this.refreshToken(token);
				// try again with refreshed token
				return this.ecobeeApi(endpointName, _options, newToken);
			}
			if (response?.status?.code !== 0) {
				// any other error
				console.error(`Unknown status received: ${response.status.message}`);
			}
			return response;
		} catch (e) {
			console.error('Non-JSON response received');
			console.log(responseRaw);
			return false;
		}
	}

	// authorization api is slightly different
	async ecobeeAuth(endpointName, _options) {
		// add client id to options
		const options = { ..._options, client_id: this.config.clientId };
		let url;
		const httpOptions = {};
		let dataUrl;
		let data;
		// test for valid endpoint name
		switch (endpointName) {
		case 'authorize':
			// build url
			url = new URL(`${endpoints.base}authorize`);
			httpOptions.method = 'GET';
			// add parameters
			objForEach(options, (key, value) => url.searchParams.append(key, value));
			break;
		case 'token':
			// build url
			url = new URL(`${endpoints.base}token`);
			httpOptions.method = 'POST';
			httpOptions.headers = { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' };
			// build data
			dataUrl = new URL(endpoints.base);
			objForEach(options, (key, value) => dataUrl.searchParams.append(key, value));
			data = dataUrl.search.slice(1);
			break;
		default:
			throw new Error('Unknown authorization endpoint');
		}
		// send the request
		const rawResponse = await https.request(url, httpOptions, data);
		return JSON.parse(rawResponse);
	}

	// get an authorization pin
	authorize() {
		return this.ecobeeAuth('authorize', {
			response_type: 'ecobeePin',
			scope: this.config.scope,
		});
	}

	// get a token from an authorization request
	async grantToken(code) {
		try {
			const response = await this.ecobeeAuth('token', {
				grant_type: 'ecobeePin',
				code,
			});
			if (response?.access_token && response?.refresh_token) return response;
		} catch (e) {
			console.error(e);
		}
		return false;
	}

	// refresh the current token
	async refreshToken(token) {
		const response = await this.ecobeeAuth('token', {
			grant_type: 'refresh_token',
			refresh_token: token.refreshToken,
		});
		if (response?.access_token && response?.refresh_token) {
			await this.sql.storeToken(response);
			return {
				accessToken: response.access_token,
				refreshToken: response.refresh_token,
			};
		}
		throw new Error('Unable to refresh token');
	}

	// get thermostat summary
	// returns a list of changes
	async getThermostatSummary() {
		const response = await this.ecobeeApi('thermostatSummary', {
			selection: {
				selectionType: 'registered',
				selectionMatch: '',
			},
		});

		// initially mark everyone as deleted
		await this.sql.setThermostatsDeleted();

		// make an array of formatted thermostats
		const thermostats = response.revisionList.map((thermostat) => {
			const split = thermostat.split(':');
			return {
				identifier: split[0],
				name: split[1],
				connected: split[2] === 'true' ? 1 : 0,
				thermostat_revision: split[3],
				alert_revision: split[4],
				runtime_revision: split[5],
				internal_revision: split[6],
			};
		});

		// get a list of thermostat identifiers
		const [origThermostats] = await this.sql.getThermostatIdentifiers();

		// examine the thermostats to create or update and return all changes
		const changes = await Promise.all(thermostats.map(async (thermostat) => {
			let original = {};
			let id;
			// determine create or update
			const origThermostat = origThermostats.find((orig) => orig.identifier === thermostat.identifier);
			if (origThermostat) {
				// update
				original = origThermostat;
				await this.sql.updateThermostat(thermostat);
				id = original.thermostat_id;
			} else {
				// create
				original = {};
				const [result] = await this.sql.insertThermostat(thermostat);
				id = result.insertId;
			}
			const diff = objDiff(original, { ...thermostat, thermostat_id: id });
			if (diff) return { thermostat_id: id, ...diff };
			return false;
		}));

		// return non-false values
		return changes.filter((thermostat) => thermostat);
	}

	// sync thermostats
	async syncThermostats() {
		// query the api
		const response = await this.ecobeeApi('thermostat', SYNC_THERMOSTATS_SELECTION);

		// update each thermostat individually
		await Promise.all(response.thermostatList.map(async (thermostat) => {
			// get the thermostat
			const [sqlThermostat] = await this.sql.getThermostatByIdentifier(thermostat.identifier);
			// test for thermostat
			if (sqlThermostat.length !== 1) {
				throw new Error(`Invalid thermostat identifier: ${thermostat.identifier}`);
			}

			// update the thermostat json values
			await this.sql.updateJsonValues(thermostat, sqlThermostat[0].thermostat_id);

			// create/update sensors
			await this.updateSensors(thermostat, sqlThermostat[0].thermostat_id);
			return true;
		}));
	}

	// create or update sensor table
	async updateSensors(thermostat, id) {
		// mark all sensors as deleted
		await this.sql.setSensorsDeleted(id);
		// get a list of sensors associated with this thermostat
		const [thermostatSensors] = await this.sql.getSensors(id);
		// get a list of sensor identifers
		const sensorIdentifiers = thermostatSensors.map((sensor) => sensor.identifier);

		// loop through sensors provided
		await Promise.all(thermostat.remoteSensors.map(async (sensor) => {
			// see if the sensor exists
			if (sensorIdentifiers.includes(sensor.id)) {
				// sensor exists, update
				await this.sql.updateSensor(id, sensor);
			} else {
				// sensor does not exist, create
				await this.sql.insertSensor(id, sensor);
			}
		}));
	}

	// sync runtime reports by id
	async syncRuntimeReport(id) {
		// get the current runtime info
		const [result] = await this.sql.getThermostatRuntimeInfo(id);
		// get the thermostat
		const thermostat = await this.sql.getThermostatById(id);
		let earliest;
		// check for rows returned
		if (result.length === 0) {
			// calculate desired start time
			earliest = DateTime.fromFormat(thermostat.runtime.firstConnected, 'yyyy-MM-dd HH:mm:ss', { zone: 'UTC' });
		} else {
			// look up values from 2 hours before the last timestamp
			earliest = DateTime.fromJSDate(result[0].timestamp).plus({ hours: -2 });
		}
		// additional query parameters
		const interval = Duration.fromObject({ days: 7 });
		// create a list of start and end times to query the api for
		const times = [];
		let time = DateTime.utc();
		do {
			let start = time.minus(interval);
			// don't go earlier than necessary
			if (start < earliest) start = earliest;
			times.push({
				startDate: start.toFormat('yyyy-LL-dd'),
				startInterval: Math.floor(Interval.fromDateTimes(start.startOf('day'), start).toDuration().as('minutes') / 5),
				endDate: time.toFormat('yyyy-LL-dd'),
				endInterval: Math.floor(Interval.fromDateTimes(time.startOf('day'), time).toDuration().as('minutes') / 5),
			});
			time = start;
		} while (time > earliest);

		// reverse the times so the entries appear approximately in order in the database
		times.reverse();

		let complete = 0;

		// get each individual runtime report
		// a synchronous loop is used intentionally so data can be processed and is not piled up in memory waiting for all of the awaits to resolve
		// this is a minor performance hit at the cost of much less memory consumption
		await syncFor(times, async (timeInterval) => {
			await this.syncRuntimeReportInterval(thermostat, timeInterval);
			complete += 1;
			console.log(`Thermostat ${thermostat.name} weeks: ${complete}/${times.length}`);
		});
	}

	// get an individual runtime report for a specific time frame
	async syncRuntimeReportInterval(thermostat, interval) {
		// query the api
		const response = await this.ecobeeApi('runtimeReport',
			{
				selection: {
					selectionType: 'thermostats',
					selectionMatch: thermostat.identifier,
				},
				...interval,
				columns: Object.keys(RUNTIME_REPORT_COLUMNS).join(','),
				includeSensors: true,

			});

		// generate the list of columns for the insert
		const allColumns = [...Object.values(RUNTIME_REPORT_COLUMNS)];
		allColumns.unshift('thermostat_id', 'timestamp');
		const columns = allColumns.join(',');
		const valuePlaceholder = ''.padStart(allColumns.length * 2 - 1, '?,');
		const duplicateColumns = allColumns.map((column) => `${column}=VALUES(${column})`).join(',');

		// loop through each response (5 minutes of data)
		const intervalPromises = response.reportList[0].rowList.map(async (row) => {
			// process the csv row
			let values = row.split(',');
			// date and time are stored in the first two values
			const timestamp = DateTime.fromFormat(`${values[0]} ${values[1]}`, 'yyyy-MM-dd HH:mm:ss', { zone: thermostat.location.timeZoneOffsetMinutes ?? thermostat.location.timeZone }).setZone('UTC').toJSDate();
			// add the id and date/time to the row, removing the first two values in the array (date and time, already used above)
			values = values.slice(2);
			values.unshift(
				thermostat.thermostat_id,
				timestamp,
			);

			// clean up empty values and set to null
			const cleanValues = values.map((value) => (value === '' ? null : value));

			// ecobee stores data for about a year, a quick and dirty check for valid data is to see if the fan value is null
			// only store values where the fan value is not null
			// note: this will not store a few of the most-current runtime values, but these won't have data anyways until the 15-minute update interval on the thermostat is reached
			// the cron job, which always goes at least 2 hours into the past, will get these values in the near future
			if (cleanValues[12] !== null) {
				// do the insert
				const res = await this.sql.insertThermostatRuntimeReport(columns, valuePlaceholder, duplicateColumns, cleanValues);
				return { res, timestamp, cleanValues };
			}
			return false;
		});

		// get the sensor runtime report
		const sensorPromise = this.runtimeReportSensor(thermostat, response);

		// wait for everything to finish
		await Promise.all([...intervalPromises, sensorPromise]);
	}

	async runtimeReportSensor(thermostat, runtimeReport) {
		// query the db
		const [result] = await this.sql.getSensors(thermostat.thermostat_id);

		// create a list of sensors by identifier
		const sensors = {};
		result.forEach((sensor) => {
			sensors[sensor.identifier] = sensor;
		});

		// create a list of sensor metrics by identifier
		const sensorMetrics = {};
		runtimeReport.sensorList[0].sensors.forEach((sensor) => {
			const id = sensor.sensorId;
			const identifier = sensor.sensorId.slice(0, sensor.sensorId.lastIndexOf(':'));
			sensorMetrics[id] = {
				...sensor,
				sensor: identifier,
			};
		});

		// re-map into a more practical object
		const objectsKeyed = {};
		runtimeReport.sensorList[0].data.forEach((sensor, i) => {
			// split into values
			const [date, time, ...sensorValues] = sensor.split(',');

			// convert date and time into timestamp
			const timestamp = DateTime.fromFormat(`${date} ${time}`, 'yyyy-MM-dd HH:mm:ss', { zone: thermostat.location.timeZoneOffsetMinutes ?? thermostat.location.timeZone }).setZone('UTC').toJSDate();

			// loop through remaining values
			sensorValues.forEach((value, j) => {
				const column = runtimeReport.sensorList[0].columns[j + 2];
				const sensorMetric = sensorMetrics[column];
				const thisSensor = sensorMetric.sensor;
				const sensorMetricType = sensorMetric.sensorType;

				// generate a unique key per row per sensor as each row of data represents data from multiple sensors
				const key = `${i}_${thisSensor}`;

				// create the object when necessary
				if (!objectsKeyed[key]) {
					objectsKeyed[key] = {
						thermostat_id: sensors[thisSensor].thermostat_id,
						sensor_id: sensors[thisSensor].sensor_id,
						timestamp,
						temperature: null,
						humidity: null,
						occupancy: null,
					};
				}

				// populate the data
				if (value !== '') {
					objectsKeyed[key][sensorMetricType] = value;
				}
			});
		});
		// turn into an array
		const objectsDirty = Object.values(objectsKeyed);

		// ecobee stores data for about a year, a quick and dirty check for valid data is to see if the occupancy value is null
		// only store values where the occupancy value is not null
		// note: this will not store a few of the most-current runtime values, but these won't have data anyways until the 15-minute update interval on the thermostat is reached
		// the cron job, which always goes at least 2 hours into the past, will get these values in the near future
		const objects = objectsDirty.filter((runtime) => runtime.occupancy !== null);

		// if there are no objects left return immediately
		if (objects.length === 0) return;

		// prepare parts of the statement
		const columns = Object.keys(objects[0]).join(',');
		const duplicateColumns = Object.keys(objects[0]).map((column) => `${column}=VALUES(${column})`).join(',');
		// do the inserts
		// a synchronous for loop with groups of 50 is chosen intentionally to limit memory consumption at the cost of a slight performance hit
		await syncFor(objects, (data) => this.sql.insertSensorRuntimeReport(columns, duplicateColumns, Object.values(data)), 25);
	}

	dbTest() {
		return this.sql.getToken();
	}
}

module.exports.NodeBee = NodeBee;
