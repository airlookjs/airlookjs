import express from 'express';
import request from 'supertest';
import { create } from 'xmlbuilder2';
import { expect, describe, it } from "vitest";

import {
	Check,
	DEFAULT_TIMEOUT,
	getExpressHealthRoute,
	Status,
	STATUS_FOR_CODE
} from '../src/healthcheck.routes';

describe('healthcheck.routes', function () {
	let app;
	let res;
	let checks;

	const checkThatWillFail = {
		name: 'Might never work',
		description: 'Change a const',
		checkFn: function () {
			const breakfast = '';
			// @ts-expect-error expecting a reassignment to const to fail
			breakfast = 'just constant eggs'; //eslint-disable-line @typescript-eslint/no-unused-vars
		},
	};

	const checkThatWillWarn = {
		name: 'Warning',
		description: 'Will return a warning on throw, preset',
		warnOnError: true,

		checkFn: function () {
			const breakfast = '';
			// @ts-expect-error expecting a reassignment to const to fail
			breakfast = 'just constant eggs'; //eslint-disable-line @typescript-eslint/no-unused-vars
		},
	};

	const checkThatWillSucceed: Check = {
		name: 'yay',
		description: 'It will be fine',
		checkFn: () => {
			return 'All good';
		},
	};

	const checkThatWillTimeout = {
		name: 'will we make it in time',
		description: 'running late',
		timeout: 100,
		checkFn: async function () {
			await new Promise((resolve) => setTimeout(resolve, 200));
		},
	};

	beforeEach(() => {
		app = express();
	});

	describe('with content type json', () => {
		describe('with checks that will succeed', () => {
			it('status endpoint should return json and encode date as ISO8601', async function () {
				app.use(
					'/',
					getExpressHealthRoute([checkThatWillSucceed, checkThatWillSucceed])
				);

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect('Content-Type', /json/)
					.expect(200);
				const responseBody = res.body.status;
				expect(responseBody.applicationname).toBe(
					'@airlookjs/node-healthcheck'
				);
				expect(responseBody.applicationstatus).toBe(Status.Ok);
				expect(typeof responseBody.timestamp).toBe('string');
				expect(responseBody.timestamp).toBe(
					new Date(res.body.status.timestamp).toISOString()
				);
				expect(responseBody.check[0].message).toEqual(
					'It will be fine: All good'
				);
				expect(responseBody.check[1].message).toEqual(
					'It will be fine: All good'
				);
			});

			it('check status and message can be overridden manually', async function () {
				let customWarn = true;
				const customMessage = 'this is just a warning';

				const checkWithManualOverrides = {
					name: 'a check',
					description: 'this is the check description',

					checkFn: function (check) {
						if (customWarn) {
							check.message = customMessage;
							check.status = Status.Warning;
						}
					},
				};

				app.use('/', getExpressHealthRoute([checkWithManualOverrides]));

				let res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(200);

				let responseBody = res.body.status;
				expect(responseBody.applicationstatus).toBe(Status.Warning);

				expect(responseBody.check[0].message).toBe(customMessage);
				expect(responseBody.check[0].status).toBe(Status.Warning);

				customWarn = false;
				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(200);

				responseBody = res.body.status;
				expect(responseBody.applicationstatus).toBe(Status.Ok);
				expect(responseBody.check[0].message).toBe(
					'this is the check description: OK'
				);
				expect(responseBody.check[0].status).toBe(Status.Ok);
			});
		});

		describe('with checks that will fail', () => {
			it('if any check returns Status.Error, applicationstatus should be ERROR', async function () {
				app.use(
					'/',
					getExpressHealthRoute([checkThatWillSucceed, checkThatWillFail])
				);

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(STATUS_FOR_CODE[Status.Error]);

				const responseBody = res.body.status;
				expect(responseBody.check[0].message).toEqual(
					'It will be fine: All good'
				);
				expect(responseBody.check[1].message).toEqual(
					'Change a const: ERROR was: Assignment to constant variable.'
				);
			});

			it('check should time out', async function () {
				app.use('/', getExpressHealthRoute([checkThatWillTimeout]));

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(STATUS_FOR_CODE[Status.Error]);

				expect(res.body.status.applicationstatus).toEqual(Status.Error);
			});

			it('check should handle timeout correctly with check that throws late', async function () {
				checks = [
					{
						name: 'throws after timeout',
						timeout: 100,
						checkFn: async function () {
							await new Promise((resolve) =>
								setTimeout(function () {
									resolve('done');
								}, 200)
							);

							throw new Error('nested throw');
						},
					},
				];

				app.use('/', getExpressHealthRoute(checks));

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(STATUS_FOR_CODE[Status.Error]);

				expect(res.body.status.applicationstatus).toEqual(Status.Error);
			});

			it('check should handle timeout correctly with check that rejects late', async function () {
				checks = [
					{
						name: 'rejects after timeout',
						timeout: 100,
						checkFn: async function () {
							return await new Promise((resolve, reject) => {
								setTimeout(function () {
									reject('nested reject');
								}, 200);
							});
						},
					},
				];

				app.use('/', getExpressHealthRoute(checks));

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(STATUS_FOR_CODE[Status.Error]);

				expect(res.body.status.applicationstatus).toEqual(Status.Error);
			});

			it('should time out with default timeout if it never returns', async function () {
				const checks = [
					{
						name: 'won\'t ever make it',
						description: 'eternal loop',
						timeout: DEFAULT_TIMEOUT + 1000,
						checkFn: async function () {
							await new Promise(() => {});
						},
					},
				];

				app.use('/', getExpressHealthRoute(checks));

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/json' })
					.expect(STATUS_FOR_CODE[Status.Error]);
				expect(res.body.status.applicationstatus).toEqual(Status.Error);
			}, DEFAULT_TIMEOUT + 1050);
		});
		

		it('sample application with test that checks variables', async function () {
			let appWarning = false;
			let appError = false;

			const appTest = {
				name: 'check for error or warning',
				checkFn: function (check) {
					if (appError) {
						throw new Error('warning');
					} else if (appWarning) {
						check.warnOnError = true;
						throw new Error('error');
					}
				},
			};

			const app = express();
			app.use('/', getExpressHealthRoute([appTest]));

			let res = await request(app)
				.get('/')
				.set({ Accept: 'application/json' })
				.expect(200);
			expect(res.body.status.applicationstatus).toEqual(Status.Ok);

			appWarning = true;
			res = await request(app)
				.get('/')
				.set({ Accept: 'application/json' })
				.expect(200);
			expect(res.body.status.applicationstatus).toEqual(Status.Warning);

			appError = true;
			res = await request(app)
				.get('/')
				.set({ Accept: 'application/json' })
				.expect(STATUS_FOR_CODE[Status.Error]);
			expect(res.body.status.applicationstatus).toEqual(Status.Error);

			appError = false;
			appWarning = false;
			res = await request(app)
				.get('/')
				.set({ Accept: 'application/json' })
				.expect(200);
			expect(res.body.status.applicationstatus).toEqual(Status.Ok);
		});
	});

	describe('with content type xml', () => {
		describe('with checks that will succeed', () => {
			it('status endpoint should return xml and encode date as ISO8601', async function () {
				app.use(
					'/',
					getExpressHealthRoute([checkThatWillSucceed, checkThatWillSucceed])
				);

				res = await request(app)
					.get('/')
					.set({ Accept: 'application/xml' })
					.expect('Content-Type', /xml/)
					.expect(200);

				//@ts-expect-error xml builder isn't aware of the format of the response
				const responseBody = create(res.text).end({ format: 'object' }).status;

				expect(responseBody.applicationname).toBe(
					'@airlookjs/node-healthcheck'
				);
				expect(responseBody.applicationstatus).toBe(Status.Ok);
				expect(typeof responseBody.timestamp).toBe('string');
				expect(responseBody.check[0].message).toEqual(
					'It will be fine: All good'
				);
				expect(responseBody.check[1].message).toEqual(
					'It will be fine: All good'
				);
			});

			it('status endpoint should return most severe status', async function () {
				app.use(
					'/',
					getExpressHealthRoute([
						checkThatWillSucceed,
						checkThatWillWarn,
						checkThatWillFail,
					])
				);
		
				const res = await request(app)
					.get('/')
					.set({ Accept: 'application/xml' })
					.expect('Content-Type', /xml/)
					.expect(STATUS_FOR_CODE[Status.Error]);
		
				//@ts-expect-error xml builder isn't aware of the format of the response
				const responseBody = create(res.text).end({ format: 'object' }).status;
		
				expect(responseBody.applicationname).toBe('@airlookjs/node-healthcheck');
				expect(responseBody.applicationstatus).toBe(Status.Error);
				expect(typeof responseBody.timestamp).toBe('string');
				expect(responseBody.check[0].message).toEqual('It will be fine: All good');
				expect(responseBody.check[1].message).toEqual(
					'Will return a warning on throw, preset: ERROR was: Assignment to constant variable.'
				);
				expect(responseBody.check[1].status).toEqual(Status.Warning);
				expect(responseBody.check[2].message).toEqual(
					'Change a const: ERROR was: Assignment to constant variable.'
				);
				expect(responseBody.check[2].status).toEqual(Status.Error);
			});

			it('status endpoint should warn, flag set in check object', async function () {
				app.use(
					'/',
					getExpressHealthRoute([checkThatWillSucceed, checkThatWillWarn])
				);
		
				const res = await request(app)
					.get('/')
					.set({ Accept: 'application/xml' })
					.expect('Content-Type', /xml/)
					.expect(200);
		
				//@ts-expect-error xml builder isn't aware of the format of the response
				const responseBody = create(res.text).end({ format: 'object' }).status;
				expect(responseBody.applicationname).toBe('@airlookjs/node-healthcheck');
				expect(responseBody.applicationstatus).toBe(Status.Warning);
				expect(typeof responseBody.timestamp).toBe('string');
				expect(responseBody.timestamp).toBe(
					new Date(responseBody.timestamp).toISOString()
				);
				expect(responseBody.check[0].message).toEqual('It will be fine: All good');
				expect(responseBody.check[0].status).toEqual(Status.Ok);
		
				expect(responseBody.check[1].message).toEqual(
					'Will return a warning on throw, preset: ERROR was: Assignment to constant variable.'
				);
				expect(responseBody.check[1].status).toEqual(Status.Warning);
			});

			it('check should warn with flag set in function', async function () {
				const checkThatWillWarnInteractive = {
					name: 'Warning',
					description: 'Will return a warning on throw, interactive',
					checkFn: function (check) {
						check.warnOnError = true;
						const breakfast = '';
						// @ts-expect-error expecting a reassignment to const to fail
						breakfast = 'just constant eggs'; //eslint-disable-line @typescript-eslint/no-unused-vars
					},
				};
		
				app.use(
					'/',
					getExpressHealthRoute([
						checkThatWillWarnInteractive
					])
				);
		
				const res = await request(app)
					.get('/')
					.set({ Accept: 'application/xml' })
					.expect('Content-Type', /xml/)
					.expect(200);
		
				//@ts-expect-error xml builder isn't aware of the format of the response
				const responseBody = create(res.text).end({ format: 'object' }).status;
		
				// status.should.be.an.Object();
				// status.check.should.be.an.Object();
				// status.timestamp.should.be.a.String();
				// status.applicationstatus.should.equal(Status.Warning);
		
				expect(responseBody.applicationname).toBe('@airlookjs/node-healthcheck');
				expect(responseBody.applicationstatus).toBe(Status.Warning);
				expect(typeof responseBody.timestamp).toBe('string');
				expect(responseBody.check.message).toBe(
					'Will return a warning on throw, interactive: ERROR was: Assignment to constant variable.'
				);
				expect(responseBody.check.status).toBe(Status.Warning);
			});
		});

		describe('with checks that will fail',  () => {

		});
	});
});
