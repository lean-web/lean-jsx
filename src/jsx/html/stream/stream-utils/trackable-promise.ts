export type PromiseStatus = "pending" | "fulfilled" | "rejected";
export interface PendingPromise {
    status: "pending";
    value: unknown;
    error: unknown;
}

export interface FulfilledPromise<T> {
    status: "fulfilled";
    value: T;
    error: unknown;
}

export interface RejectedPromise<E> {
    status: "rejected";
    value: undefined;
    error: E;
}

export type TrackablePromiseState<T, E> =
    | PendingPromise
    | FulfilledPromise<T>
    | RejectedPromise<E>;

export class TrackablePromise<T, E> {
    private _status: PromiseStatus = "pending";
    private _promise: Promise<T>;
    private _value: T | undefined;
    private _id?: string;
    private _err?: E;

    constructor(p: Promise<T>, id?: string) {
        void p
            .then((result) => {
                this._status = "fulfilled";
                this._value = result;
            })
            .catch((err) => {
                this._status = "rejected";
                this._err = err as E;
            });

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!p) {
            throw new Error(`Promise must be present`);
        }
        this._id = id;
        this._promise = p;
    }

    isFulfilled(): this is FulfilledPromise<T> {
        return this.status === "fulfilled";
    }

    isRejected(): this is RejectedPromise<E> {
        return this.status === "rejected";
    }

    isPending(): this is PendingPromise {
        return this.status === "pending";
    }

    get status(): PromiseStatus {
        return this._status;
    }

    get promise(): Promise<T> {
        return this._promise;
    }

    get value() {
        if (this.status === "fulfilled") {
            return this._value;
        } else {
            return undefined;
        }
    }

    get error() {
        if (this.status === "rejected") {
            return this._err;
        }
        return undefined;
    }

    get id() {
        return this._id;
    }

    get then() {
        return this._promise.then.bind(this._promise);
    }
}
