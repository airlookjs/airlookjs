export const uniqueClasses = (classNames = '') : string => {
	const classes = classNames
		.split(' ')
		.map((c) => c.trim())
		.filter((c) => !!c);
	const unique: string[] = [];
	classes.forEach((c) => {
		if (unique.includes(c)) unique.push(c);
	});
	return unique.join(' ');
};
