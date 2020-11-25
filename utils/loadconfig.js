// load configuration from user provided and then fall back to defaults

const Defaults = require('../config-defaults');
const objForEach = require('./objforeach');
const fs = require('fs');
const path = require('path');

// see if the user config file is available
let User = null;
if (fs.existsSync(path.join(__dirname, '../config.js'))) {
	User = require('../config.js')
}

// combine each nested key in an object and fall back to default values if a user value is not provided
const combine = (user, defaults) => {
	if (user === null) return defaults;
	const result = defaults;
	objForEach(user, (key, val) => {
		if (result[key] === undefined) result[key] = {};
		if (typeof val === 'object') return combine(val, result[key]);
		if (val !== undefined && val !== null) result[key] = val;
		return false;
	});
	return result;
};

module.exports = combine(User, Defaults);
