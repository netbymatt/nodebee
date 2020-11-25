// the query is a nested set of promises that eventually resolves in a timeout or a token
const query = (nodeBee, auth, secondsRemaining, secondsAvailable) => new Promise((resolve, reject) => {
	// wait for 1 second
	setTimeout(() => {
		process.stdout.write(`Seconds remaining: ${secondsRemaining.toString().padEnd(4, ' ')}\r`);
		// ask for token if min time has elapsed
		if ((secondsAvailable - secondsRemaining) % (auth.interval + 2) === 0 || secondsAvailable <= 1) {
			nodeBee.grantToken(auth.code).then((token) => {
				if (token) {
					// test for valid tokens
					if (!token?.access_token || !token.refresh_token) {
						reject(new Error('Could not grant token'));
					}
					resolve(token);
				} else {
				// call recursively until time expired
					if (secondsRemaining > 1) resolve(query(nodeBee, auth, secondsRemaining - 1, secondsAvailable));
					// time expired
					reject(new Error('Query time expired'));
				}
			}).catch((e) => reject(e));
		} else {
			// not time to check, just create another promise
			if (secondsRemaining > 1) resolve(query(nodeBee, auth, secondsRemaining - 1, secondsAvailable));
			reject(new Error('Query time expired'));
		}
	}, 1000);
});

// shell setup function calculates available time
const testPin = (nodeBee, auth) => {
	const secondsAvailable = auth.expires_in * 60;
	return query(nodeBee, auth, secondsAvailable - 1, secondsAvailable);
};

module.exports = testPin;
