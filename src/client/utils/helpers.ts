export function formatTicketNumber(number: number) {
	let out = number.toString();
	while (out.length < 4) {
		out = "0" + out;
	}

	return out;
}

export function calculateXpForLevel(level: number) {
	return Math.floor(level * 2 + Math.pow(level, 3) + level * 102);
}

export function calculateLevelForXp(xp: number) {
	let level = 0;
	while (calculateXpForLevel(level + 1) <= xp) {
		level++;
	}
	return level;
}

export function formatBigNumber(number: number) {
	if (number > 1000) return (number / 1000).toFixed(1) + "k";
	else if (number > 1000000) return (number / 1000000).toFixed(1) + "m";
	else if (number > 1000000000) return (number / 1000000000).toFixed(1) + "b";
	else return number.toString();
}
