declare global {
    interface Window {
        readonly wrappedJSObject: this;
    }
}

export type CloneIntoOptions = {
    cloneFunctions?: boolean;
    target?: object;
    wrapReflectors?: boolean;
};

export type ExportOptions = {
    target?: object;
};

export type ExportFunctionOptions = {
    allowCrossOriginArguments?: boolean;
    defineAs?: string;
    target?: object;
};

interface GMCompat {
    readonly apply: <T, A extends readonly ArrayLike<any>, R>($this: T, fn: ((this: T, ...args: A) => R), args: A) => R;
    readonly call: <T, A extends readonly ArrayLike<any>, R>($this: T, fn: ((this: T, ...args: A) => R), ...args: A) => R;
    readonly cloneInto: <T extends object>(object: T, options?: CloneIntoOptions) => T;
    readonly export: <T extends object>(value: T, options?: ExportOptions) => T;
    readonly exportFunction: <T extends Function>(fn: T, options?: ExportFunctionOptions) => T;
    readonly unsafeWindow: typeof window;
    readonly unwrap: <T extends object>(object: T) => T;
};

declare var GMCompat: GMCompat;

export default GMCompat;
