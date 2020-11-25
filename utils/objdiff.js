// return a simple difference of objects, no nesting
// a = original values
// b = new values, returned
// returns false if no differences

module.exports = (a, b) => {
	// get both sets of keys
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	// create a combined, unique list of keys
	const keys = Array.from(new Set([...aKeys, ...bKeys]));
	const diff = {};
	let diffs = false;
	keys.forEach((key) => {
		if (a?.[key] !== b?.[key]) {
			diff[key] = b[key];
			diffs = true;
		}
	});
	if (diffs) return diff;
	return false;
};
