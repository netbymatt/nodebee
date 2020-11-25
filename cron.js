const config = require('./utils/loadconfig');
const { update, end } = require('./update');

// set up the interval calling the function with the cron flag set
const interval = setInterval(() => update(true), config.rate ?? 60000);

// shut down gracefully
process.on('SIGINT', () => {
	clearInterval(interval);
	try {
		end();
		process.exit(0);
	} catch (e) {
		process.exit(1);
	}
});
