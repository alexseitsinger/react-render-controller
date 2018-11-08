import _ from "underscore"

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
