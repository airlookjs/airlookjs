export class FileNotFoundError extends Error {
	constructor (msg: string)  {
		super(msg)

			// Set the prototype explicitly.
			Object.setPrototypeOf(this, FileNotFoundError.prototype);
	}
}
