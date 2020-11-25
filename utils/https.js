// async https request with default options

const https = require('https');
const zlib = require('zlib');

class Https {
	constructor(options) {
		this.options = options;
	}

	// https request
	async request(url, options, data) {
		return new Promise((resolve, reject) => {
			// combine headers, then the entire options object
			const headers = { ...this.options.headers, ...options.headers, 'Accept-Encoding': 'gzip' };
			// make the request
			const req = https.request(url, { ...this.options, ...options, headers }, (res) => {
				const buffers = [];
				// test for gzip
				if (res.headers['content-encoding'] === 'gzip') {
					// decompress and return data
					const gunzip = zlib.createGunzip();
					res.pipe(gunzip);
					gunzip.on('data', (d) => buffers.push(d));
					gunzip.on('end', () => resolve(Buffer.concat(buffers).toString()));
				} else {
					// store and return uncompressed data
					res.on('data', (d) => buffers.push(d));
					res.on('end', () => resolve(Buffer.concat(buffers).toString()));
				}
			});
			req.on('error', (e) => {
				reject(e);
			});
			// add data for posts requests
			if (data) req.write(data);
			// complete the request
			req.end();
		});
	}

	// GET convenience method
	get(url, options) {
		return this.request(url, { options, method: 'GET' });
	}

	// POST convenience method
	post(url, options, data) {
		return this.request(url, { options, method: 'POST' }, data);
	}
}

module.exports = Https;
