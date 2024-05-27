// healthcheck.routes.js: return a 2xx response when your server is healthy, else send a 5xx response
import express, { Router, RequestHandler } from 'express';
import os from 'os';
import { create } from 'xmlbuilder2';

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e6;
export const DEFAULT_TIMEOUT = 5000;

export enum Status {
	Ok = 'OK',
	Error =  'ERROR',
	Warning = 'WARNING',
}

export const STATUS_FOR_CODE = {
	[Status.Error]: 503
};

export interface StatusResponse {
	applicationname: string;
	applicationversion: string;
	applicationstatus: Status;
	servername: string;
	uptime: number;
	timestamp: string;
	check: CheckResponse[];
}

type CheckFn = ((check?: CheckFnArg) => void | string | Promise<void | string>);

const timeout = <ExceptionType>(
	prom: Promise<ReturnType<CheckFn>>, 
	time: number, 
	exception: ExceptionType
) => {
	let timer: NodeJS.Timeout;
	return Promise.race([
		prom,
		new Promise((_r, rej) => timer = setTimeout(rej, time, exception))
	]).finally(() => clearTimeout(timer));
};

export interface CheckFnArg extends Partial<Pick<Check, 'warnOnError'>>, Partial<Pick<CheckResponse, 'status' | 'message'>> {}

export interface Check {
	name: string;
	timeout?: number;
	description?: string;
	warnOnError?: boolean;
	checkFn: CheckFn;
}

export interface CheckResponse {
	name: string;
	status: Status;
	message: string;
	responseinms: number;
}

export function make_checks(checksArray: Check[]): Promise<CheckResponse>[] {
	return checksArray.map(function(check) {
		return make_check(check);
	});
}

async function make_check(check: Check): Promise<CheckResponse> {
	const checkFnArg: CheckFnArg = {
		warnOnError: check.warnOnError ?? false
	};

	const timeout_ms = (typeof check.timeout === 'undefined') ? DEFAULT_TIMEOUT : check.timeout;
	const message_prefix = (typeof check.description === 'undefined') ? '' : check.description + ':';

	const startTime = process.hrtime(); // start timer

	const checkFnPromise	= new Promise<ReturnType<CheckFn>>((resolve, reject) => {
		try {
			const res = check.checkFn(checkFnArg);
			resolve(res);
		} catch(error) {
			reject(error); 
		}
	});

	const timeoutError = Symbol();

	let message: string;
	let status: Status;

	try {
		const resp = await timeout(checkFnPromise, timeout_ms, timeoutError);

		status = checkFnArg.status ?? Status.Ok;
		message= checkFnArg.message ?? `${message_prefix} ${typeof resp === "string"  ? resp : 'OK'}`;
	} catch (error) {
		status = checkFnArg.warnOnError ? Status.Warning : Status.Error;

		if (error === timeoutError) {
			message = `${message_prefix} ERROR was: Check did not complete before timeout of ${timeout_ms}ms`; 
		} else {
			let errorMessage = "exception type not Error or string, not possible to typecast to string"
			if (typeof error === "string") {
				errorMessage = error;
			} else if (error instanceof Error) {
				errorMessage  = error.message;
			}
			message = `${message_prefix} ERROR was: ${errorMessage}`; 
		}
	}

	const timeDiff = process.hrtime(startTime); // end timer
	const timeDiffInNanoseconds = (timeDiff[0] * NS_PER_SEC) + timeDiff[1];

	return {
		name: check.name,
		status: status,
		message: message,
		responseinms: timeDiffInNanoseconds / MS_PER_NS
	};
}

const checkStatus = (status: Status, desiredStatus: Status) => status === desiredStatus;

const getAppStatus = (checks:CheckResponse[]) => {
	if (checks.some((check) => checkStatus(check.status, Status.Error))) {
		return Status.Error;
	}
	if (checks.some((check) => checkStatus(check.status, Status.Warning))) {
		return Status.Warning;
	}
	return Status.Ok;
};

export async function getStatus(healthchecks: Check[]): Promise<StatusResponse> {
	const checks = await Promise.all(make_checks(healthchecks));

	return {
		applicationname: process.env.npm_package_name  ?? "undefined name check package.json",
		applicationversion: process.env.npm_package_version ?? "undefined bersion check package.json",
		applicationstatus: getAppStatus(checks),
		servername: os.hostname(), 
		uptime: process.uptime(),
		timestamp: new Date().toISOString(),
		check: checks
	};
}

export function getStatusXml(status: Awaited<ReturnType<typeof getStatus>>): string {
	const doc = create({status: status});
	return doc.end({ prettyPrint: true });
}

export const getExpressHealthRoute = function(healthchecks: Check[]): Router {
	const router = express.Router({});

	router.get('/', (async (_req, res) => {
		const status = await getStatus(healthchecks);

		if(status.applicationstatus === Status.Error) {
			res.status(STATUS_FOR_CODE[Status.Error]);
		}
		
		const jsonResponse = function() {
			res.json({status: status});
		}; 

		res.format({
			xml: function() {
				res.send(getStatusXml(status));
			},
			json: jsonResponse,
			default: jsonResponse
		});
	}) as RequestHandler);

	return router;
};
export default getExpressHealthRoute;
