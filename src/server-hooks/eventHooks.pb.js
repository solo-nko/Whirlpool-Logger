// whenever a user pings the category list, update their "syncedOn" key. This is to ensure they continue to be counted as "active" and don't get deleted in the ClearOldData hook. Skip this process for superusers, as it was causing issues on the webUI.
onRecordsListRequest((event) => {
	if (event.hasSuperuserAuth()) {
		event.next();
		return;
	}
	const userId = event.auth.id;
	const getUser = $app.findRecordById("users", userId);
	if (getUser) {
		console.log("Category access from Sync Code: ", getUser.get("syncCode"));
		getUser.set("syncedOn", new DateTime().string());
		$app.save(getUser);
	}
	event.next();
}, "categories");
