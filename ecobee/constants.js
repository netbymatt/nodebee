module.exports.SYNC_THERMOSTATS_SELECTION = {
	selection: {
		selectionType: 'registered',
		selectionMatch: '',
		includeRuntime: true,
		includeExtendedRuntime: true,
		includeElectricity: true,
		includeSettings: true,
		includeLocation: true,
		includeProgram: true,
		includeEvents: true,
		includeDevice: true,
		includeTechnician: true,
		includeUtility: true,
		includeManagement: true,
		includeAlerts: true,
		includeWeather: true,
		includeHouseDetails: true,
		includeOemCfg: true,
		includeEquipmentStatus: true,
		includeNotificationSettings: true,
		includeVersion: true,
		includePrivacy: true,
		includeAudio: true,
		includeSensors: true,
	},
};

module.exports.RUNTIME_REPORT_COLUMNS = {
	// ecobee api response: db column name
	auxHeat1: 'auxiliary_heat_1',
	auxHeat2: 'auxiliary_heat_2',
	auxHeat3: 'auxiliary_heat_3',
	compCool1: 'compressor_cool_1',
	compCool2: 'compressor_cool_2',
	compHeat1: 'compressor_heat_1',
	compHeat2: 'compressor_heat_2',
	dehumidifier: 'dehumidifier',
	dmOffset: 'demand_management_offset',
	economizer: 'economizer',
	fan: 'fan',
	humidifier: 'humidifier',
	hvacMode: 'hvac_mode',
	outdoorHumidity: 'outdoor_humidity',
	outdoorTemp: 'outdoor_temperature',
	sky: 'sky',
	ventilator: 'ventilator',
	wind: 'wind',
	zoneAveTemp: 'zone_average_temperature',
	zoneCalendarEvent: 'zone_calendar_event',
	zoneClimate: 'zone_climate',
	zoneCoolTemp: 'zone_cool_temperature',
	zoneHeatTemp: 'zone_heat_temperature',
	zoneHumidity: 'zone_humidity',
	zoneHumidityHigh: 'zone_humidity_high',
	zoneHumidityLow: 'zone_humidity_low',
	zoneHvacMode: 'zone_hvac_mode',
	zoneOccupancy: 'zone_occupancy',
};
