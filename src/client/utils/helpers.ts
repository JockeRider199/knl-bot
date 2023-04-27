export function formatTicketNumber(number: number) {
	let out = number.toString();
	while (out.length < 4) {
		out = "0" + out;
	}

	return out;
}
