namespace TOTVS {

	export class Deferred<T> {

		public resolve: (value?: any) => void = null;
		public reject: (error?: any) => void = null;
		public promise: Promise<any> = null;

		constructor() {
			this.promise = new Promise<any>((resolve: (value?: any) => void, reject: (error?: any) => void) => {
				this.resolve = resolve;
				this.reject = reject;
			});

			Object.freeze(this);
		}

	}

}
