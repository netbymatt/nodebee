// synchronous for-loop
// intended to be used in place of Promise.all(array.map(value => <promise>))
// runs each function call one at a time, or a set number of iterations at one time (maxQueue)

module.exports = async (array, callback, maxQueue = 1) => {
	// get the length of the array to process
	const { length } = array;
	const fullLoops = Math.floor(length / maxQueue);
	const lastLoop = length % maxQueue;

	// fill an array with the the size of each chunk
	const chunkSizes = [];
	for (let i = 0; i < fullLoops; i += 1) {
		chunkSizes.push(maxQueue);
	}
	// add the final loop iteration if there's a remainder
	if (lastLoop > 0) chunkSizes.push(lastLoop);

	// collect results
	const results = [];
	// process the chunks
	for (let i = 0; i < chunkSizes.length; i += 1) {
		// generate a list of items to run
		const list = [];
		for (let j = i * maxQueue; j < i * maxQueue + chunkSizes[i]; j += 1) {
			list.push(callback(array[j], j));
		}
		// wait for the list to complete
		// eslint-disable-next-line no-await-in-loop
		const chunkResult = await Promise.all(list);
		results.push(...chunkResult);
	}
	return results;
};
