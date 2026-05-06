// pockethost hibernates instances after a short while, making crons ineffective. So we use webhooks instead.

// cronAdd("ClearOrphanedCategories", "0 * * * *", ClearOrphanedCategories);
routerAdd("GET", "/api/webhooks/clear-orphaned-categories", ClearOrphanedCategories);

/** Searches for and deletes categories that don't have a user associated with them. */
function ClearOrphanedCategories() {
	const categories = $app.findAllRecords("categories");
	let recordsDeleted = 0;
	for (const category of categories) {
		if (category) {
			try {
				$app.findFirstRecordByData("users", "syncCode", category.get("syncCode"));
			} catch (error) {
				if (String(error).includes("no rows in result set")) {
					$app.delete(category);
					recordsDeleted += 1;
				}
			}
		} else continue;
	}
	console.log(`Deleted ${recordsDeleted} orphaned category records.`);
}

// cronAdd("ClearOrphanedWhirlpools", "0 * * * *", ClearOrphanedWhirlpools);
routerAdd("GET", "/api/webhooks/clear-orphaned-whirlpools", ClearOrphanedWhirlpools);

/** Searches for and deletes whirlpools that don't have a user associated with them. */
function ClearOrphanedWhirlpools() {
	console.log("Clearing old data...");
	const whirlpools = $app.findAllRecords("whirlpools");
	let recordsDeleted = 0;
	for (const whirlpool of whirlpools) {
		if (whirlpool) {
			try {
				$app.findFirstRecordByData("users", "syncCode", whirlpool.get("syncCode"));
			} catch (error) {
				if (String(error).includes("no rows in result set")) {
					$app.delete(whirlpool);
					recordsDeleted += 1;
				}
			}
		} else continue;
	}
	console.log(`Deleted ${recordsDeleted} orphaned whirlpool records.`);
}

// checks and deletes old records on every hour
// (or maybe run more often depending on your use case)
// cronAdd("ClearOldData", "0 * * * *", ClearOldData);
routerAdd("GET", "/api/webhooks/clear-expired-data", ClearOldData);

/** Searches for and deletes users and their categories and whirlpools that are old past a specified date. */
function ClearOldData() {
	let expiry = new Date();
	expiry.setHours(expiry.getHours() - 1);
	const expiryString = expiry.toISOString().replace("T", " ");

	let usersDeleted = 0;
	do {
		const getOldUsers = $app.findRecordsByFilter(
			"users",
			"syncedOn <= {:oldDate}",
			"created",
			100,
			0,
			{ oldDate: expiryString }
		);

		usersDeleted = 0;

		for (const user of getOldUsers) {
			let whirlpoolsDeleted = 0;
			do {
				const whirlpoolsToDelete = $app.findRecordsByFilter(
					"whirlpools",
					"syncCode = {:userSyncCode}",
					"created",
					100,
					0,
					{ userSyncCode: user.get("syncCode") }
				);

				whirlpoolsDeleted = 0;

				for (const whirlpool of whirlpoolsToDelete) {
					try {
						$app.delete(whirlpool);
						whirlpoolsDeleted += 1;
					} catch (error) {
						console.log("Whirlpool deletion error: ", error);
					}
				}
			} while (whirlpoolsDeleted > 0);

			let categoriesDeleted = 0;
			do {
				const categoriesToDelete = $app.findRecordsByFilter(
					"categories",
					"syncCode = {:userSyncCode}",
					"created",
					100,
					0,
					{ userSyncCode: user.get("syncCode") }
				);

				categoriesDeleted = 0;

				for (const category of categoriesToDelete) {
					try {
						$app.delete(category);
						categoriesDeleted += 1;
					} catch (error) {
						console.log("Category deletion error: ", error);
					}
				}
			} while (categoriesDeleted > 0);

			try {
				console.log("Deleting user: ", user.get("syncCode"));
				$app.delete(user);
				usersDeleted += 1;
			} catch (error) {
				console.log("User deletion error: ", error);
			}
		}
	} while (usersDeleted > 0);
	console.log("Job finished.");
}
