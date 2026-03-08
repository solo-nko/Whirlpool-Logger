import type { DexieExportJsonStructure } from "dexie-export-import/dist/json-structure";

async function ImportOldFormat(oldDb: File) {
	const stringifiedDb = await oldDb.text();
	let oldDatabase: DexieExportJsonStructure;
	try {
		const tryParse = await JSON.parse(stringifiedDb);
		if ("formatName" in tryParse && tryParse.formatName === "dexie")
			oldDatabase = tryParse as DexieExportJsonStructure;
		else return;
	} catch (error) {
		console.log(error);
		return;
	}
	const { data } = oldDatabase;
	console.log(data);
	// import games
	const gamesEntries = data.data.find((element) => element.tableName === "games");

	// import tv
	const tvEntries = data.data.find((element) => element.tableName === "television");

	// import movies
	const movieEntries = data.data.find((element) => element.tableName === "movies");

	// import books
	const booksEntries = data.data.find((element) => element.tableName === "books");
}

export { ImportOldFormat };
