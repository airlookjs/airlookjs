module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(js?|ts?)$': 'babel-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$',
	testPathIgnorePatterns: ['/lib/', '/node_modules/'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	collectCoverage: true,
};
