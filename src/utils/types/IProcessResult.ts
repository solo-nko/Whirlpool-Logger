// TODO: add this to other parts of the app for error-handling and such
export type IProcessResult = {
	result: "ok" | "warn" | "error";
	message?: string;
};
