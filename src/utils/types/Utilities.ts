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

export { TransformVariableName, TransformWhirlpoolFieldName };
