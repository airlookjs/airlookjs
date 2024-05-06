import axios from 'axios';

axios
	.get('http://localhost:80/status', { timeout: 5000 })
	.then(function (response) {
		// handle success
		console.log(JSON.stringify(response.data, null, ' '));
		process.exit(0);
	})
	.catch(function (error) {
		// handle error
		if (error.response) {
			if (error.response.data) console.error(JSON.stringify(error.response.data, null, ' '));
			else console.error(`{"ERROR": "${error.response.status}"}`);
			process.exit(1);
		}
		console.error(`{"ERROR": "${error}"}`);
		process.exit(1);
	})
	.then(function () {
		console.error('{"ERROR": END OF STATUS CALL SHUOLD NOT BE REACHED"}');
		process.exit(1);
	});
