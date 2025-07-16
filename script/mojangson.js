export function parseMojangSON(input) {
	input = input.trim();

	if (input.startsWith("{") && input.endsWith("}")) {
		return parseObject(input.slice(1, -1));
	} else {
		throw new Error("Invalid MojangSON format");
	}
}

function parseObject(str) {
	const result = {};
	let key = "",
		value = "",
		inString = false,
		depth = 0,
		isKey = true;

	for (let i = 0; i < str.length; i++) {
		let char = str[i];

		if (char === '"') {
			inString = !inString;
		} else if (!inString) {
			if (char === '{' || char === '[') depth++;
			if (char === '}' || char === ']') depth--;

			if (depth === 0) {
				if (char === ':' && isKey) {
					isKey = false;
					continue;
				}
				if (char === ',' && !isKey) {
					result[key.trim()] = parseValue(value.trim());
					key = "";
					value = "";
					isKey = true;
					continue;
				}
			}
		}

		if (isKey) key += char;
		else value += char;
	}

	if (key) result[key.trim()] = parseValue(value.trim());

	return result;
}

function parseArray(str) {
	const result = [];
	let value = "",
		inString = false,
		depth = 0;

	for (let i = 0; i < str.length; i++) {
		let char = str[i];

		if (char === '"') {
			inString = !inString;
		} else if (!inString) {
			if (char === '{' || char === '[') depth++;
			if (char === '}' || char === ']') depth--;

			if (depth === 0 && char === ',') {
				result.push(parseValue(value.trim()));
				value = "";
				continue;
			}
		}

		value += char;
	}

	if (value) result.push(parseValue(value.trim()));

	return result;
}

function parseValue(value) {
	if (value.startsWith("{") && value.endsWith("}")) {
		return parseObject(value.slice(1, -1));
	}
	if (value.startsWith("[") && value.endsWith("]")) {
		return parseArray(value.slice(1, -1));
	}
	if (value === "true") return true;
	if (value === "false") return false;
	if (value.endsWith("b")) return parseInt(value.slice(0, -1), 10);
	if (value.endsWith("s")) return parseInt(value.slice(0, -1), 10);
	if (value.endsWith("L")) return BigInt(value.slice(0, -1));
	if (value.endsWith("f") || value.endsWith("d")) return parseFloat(value.slice(0, -1));
	if (!isNaN(value)) return Number(value);
	if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1);

	return value;
}