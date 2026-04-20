// import { deepToRaw } from "vuetify/lib/util/helpers.mjs";

import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import { FieldType, type IField } from "@/utils/types/IField.ts";

/**
 * Takes a variable name and transforms it by capitalizing the first letter and adding a space before subsequent words.
 * @param input Variable name. MUST be camelCase or this won't work correctly.
 */
function TransformVariableName(input: string) {
	const inputArray = input.split("");
	const capitalLettersRegEx = /[A-Z]/;
	const transformedArray = inputArray.map((char, index) => {
		if (index === 0) return char.toUpperCase();
		if (capitalLettersRegEx.test(char)) return ` ${char}`;
		return char;
	});
	return transformedArray.join("");
}

/** Function for specifically handling Whirlpool field names */
function TransformWhirlpoolFieldName(input: string) {
	const transformedInput = TransformVariableName(input);
	if (transformedInput === "Status Id") return "Status";
	if (transformedInput == "Tag Ids") return "Tags";
	if (transformedInput == "User Updated On") return "Last Updated";
	return transformedInput;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Takes a Vue ref and returns the plain object. Goes deeper than Vue's provided toRaw() function.
 * Taken from https://github.com/vuejs/core/issues/5303#issuecomment-1543596383
 * Funny enough, Vuetify seems to have copied this function as well, as there's one in their helper libraries that's written almost exactly the same way.
 * @param sourceObj Original Vue ref
 */
function DeepToRaw<T extends Record<string, any>>(sourceObj: T): T {
	const objectIterator = (input: any): any => {
		if (Array.isArray(input)) {
			return input.map((item) => objectIterator(item));
		}
		if (isRef(input) || isReactive(input) || isProxy(input)) {
			return objectIterator(toRaw(input));
		}
		if (input && typeof input === "object") {
			return Object.keys(input).reduce((acc, key) => {
				acc[key as keyof typeof acc] = objectIterator(input[key]);
				return acc;
			}, {} as T);
		}
		return input;
	};

	return objectIterator(sourceObj);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function SortWhirlpoolByUpdated(a: WhirlpoolLog, b: WhirlpoolLog) {
	return a.updatedOn.toMillis() - b.updatedOn.toMillis();
}

function HasValue(value: string, fieldName: string) {
	if (value && value.length > 0) return true;
	return `${fieldName} is required.`;
}

/** Generates an array of validation rules to feed to Vuetify inputs' `rules` prop, based on the information provided via the IField interface. Intended for use with generic fields. */
function GetFieldRules(fieldInfo: IField): ((value: string | undefined) => boolean | string)[] {
	const rules = [];
	if (fieldInfo.required) {
		const hasValue = (value: string | undefined) =>
			HasValue(value || "", fieldInfo.label || "This field");
		rules.push(hasValue);
	}
	if (fieldInfo.maxLength && fieldInfo.maxLength > 0 && fieldInfo.type === FieldType.TEXT) {
		const withinMaxLength = (value: string | undefined) => {
			if (value === undefined || fieldInfo.maxLength === undefined) return true;
			if (value.length <= fieldInfo.maxLength) return true;
			return `This must be ${fieldInfo.maxLength} characters or less.`;
		};
		rules.push(withinMaxLength);
	}
	return rules;
}

/** Toast duration in milliseconds. */
const TOAST_TIMEOUT = 3000;

export {
	TransformVariableName,
	TransformWhirlpoolFieldName,
	DeepToRaw,
	SortWhirlpoolByUpdated,
	HasValue,
	GetFieldRules,
	TOAST_TIMEOUT
};
