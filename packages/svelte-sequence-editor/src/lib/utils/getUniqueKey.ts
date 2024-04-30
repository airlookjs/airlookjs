export const getUniqueKey = (title: string, startIndex = 1, existingNames: string[]) => {
	// dissallow dots in name, replace with dash
	let name = title.toLowerCase().replace(/[.]/g, '-');

	// replace -NUMBER
	const nameWithoutNumber = name.replace(/-[0-9]+$/, '');

	let i = startIndex;
	while (existingNames.includes(name)) {
		i++;
		name = `${nameWithoutNumber}-${i}`;
	}
	return name;
};
