namespace TOTVS {

	export class PromiseQueue {

		private pendingPromises: number;
		private maxPendingPromises: number;
		private maxQueuedPromises: number;
		private queue: Array<any>;

		constructor(maxPendingPromises?: number, maxQueuedPromises?: number) {
			this.pendingPromises = 0;
			this.maxPendingPromises = typeof maxPendingPromises !== 'undefined' ? maxPendingPromises : 1;
			this.maxQueuedPromises = typeof maxQueuedPromises !== 'undefined' ? maxQueuedPromises : Infinity;
			this.queue = [];
		}

		add(promiseGenerator) {
			var self = this;

			return new Promise(function(resolve, reject, notify) {
				// Do not queue to much promises
				if (self.queue.length >= self.maxQueuedPromises) {
					reject(new Error('Queue limit reached'));
					return;
				}

				// Add to queue
				self.queue.push({
					promiseGenerator: promiseGenerator,
					resolve: resolve,
					reject: reject,
					notify: notify || self.noop
				});

				self._dequeue();
			});
		}

		noop() {

		}

		setMaxPendingPromises(length: number) {
			let diff: number = (length - this.maxPendingPromises);

			this.maxPendingPromises = length;

			for (; diff > 0; diff--) {
				this._dequeue();
			}
		}

		getPendingLength(): number {
			return this.pendingPromises;
		}

		getQueueLength(): number {
			return this.queue.length;
		}

		_dequeue() {
			var self = this;
			if (this.pendingPromises >= this.maxPendingPromises) {
				return false;
			}

			// Remove from queue
			var item = this.queue.shift();
			if (!item) {
				return false;
			}

			try {
				this.pendingPromises++;

				this.resolveWith(item.promiseGenerator())
					// Forward all stuff
					.then(function(value) {
						// It is not pending now
						self.pendingPromises--;
						// It should pass values
						item.resolve(value);
						self._dequeue();
					}, function(err) {
						// It is not pending now
						self.pendingPromises--;
						// It should not mask errors
						item.reject(err);
						self._dequeue();
					}, function(message) {
						// It should pass notifications
						item.notify(message);
					});
			}
			catch (err) {
				self.pendingPromises--;
				item.reject(err);
				self._dequeue();
			}

			return true;
		}

		resolveWith(value) {
			if (value && typeof value.then === 'function') {
				return value;
			}

			return new Promise(function(resolve) {
				resolve(value);
			});
		}
	}

}
