export const uniqueClasses = (classNames = '') : string => {
	const classes = classNames
		.split(' ')
		.map((c) => c.trim())
		.filter((c) => !!c);
	const unique: Array<string> = [];
	classes.forEach((c) => {
		if (unique.indexOf(c) < 0) unique.push(c);
	});
	return unique.join(' ');
};
