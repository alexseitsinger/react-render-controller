import _ from "underscore"

let count = {}

export function incrementCount(name) {
	if (!(name in count)) {
		count[name] = 0
	}
	count[name] = ++count[name]
	return count[name]
}

export function decrementCount(name) {
	if (!(name in count)) {
		count[name] = 0
	}
	// Decrement the count by 1
	count[name] = --count[name]
	count[name] = Math.max(0, count[name])
	return count[name]
}

export function isEmpty(data) {
	if (!data) {
		return true
	}
	var result = null
	if (_.isArray(data)) {
		// If its an empty array, set true
		if (_.isEmpty(data)) {
			result = true
		} else {
			// If its an array of items, re-run this fn on each item.
			data.forEach((obj) => {
				if (result) {
					return
				}
				result = isEmpty(obj)
			})
		}
	} else if (_.isObject(data)) {
		if (_.isEmpty(data)) {
			result = true
		}
	}
	return result
}
