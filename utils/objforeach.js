// a 'forEach' method for an object
// objForEach (object, (key, value) => {})
module.exports = (obj, callback) => {
	Object.keys(obj).forEach((key) => {
		callback(key, obj[key]);
	});
};
