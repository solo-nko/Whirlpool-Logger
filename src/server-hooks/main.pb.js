import "./types.d.ts";

cronAdd("Clear Expired Data", "0 0 * * *", ClearOldData);

function ClearOldData() {
	const now = new DateTime();
	// define the "expiration date"
	const thirtyDaysPrior = now.addDate(0, 0, -30);
	// get list of users
	const users = $app.findAllRecords("users");
	users.forEach((user) => {
		const syncedOn = user.getDateTime("syncedOn");
		// if user hasn't contacted the server since before the expiration date...
		if (syncedOn && syncedOn.before(thirtyDaysPrior)) {
			const syncCode = user.getString("syncCode");
			// get all categories and whirlpools matching user's sync code and delete them
			const categories = $app.findAllRecords("categories", $dbx.exp(`syncCode = '${syncCode}'`));
			const whirlpools = $app.findAllRecords("whirlpools", $dbx.exp(`syncCode = '${syncCode}'`));
			categories.forEach((category) => {
				if (category) $app.delete(category);
			});
			whirlpools.forEach((whirlpool) => {
				if (whirlpool) $app.delete(whirlpool);
			});
			// finally, delete the user
			$app.delete(user);
		}
	});
}
