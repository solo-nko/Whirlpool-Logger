/* eslint-disable no-console */
import { DateTime } from "luxon";
import { type ServerCategory, type ServerWhirlpool, WhirlpoolAPI } from "@/utils/config/backend.ts";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import useCategoriesStore from "@/stores/categories.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import type { IProcessResult } from "@/utils/types/IProcessResult.ts";
import useSettingsStore from "@/stores/settings.ts";

const useSyncStore = defineStore("sync-store", () => {
	const getLocalStorageSyncCode = localStorage.getItem(LocalStorageKeys.SyncCode);
	const getLocalStorageLastSynced = localStorage.getItem(LocalStorageKeys.LastSynced);
	const getLocalStorageAutoSync = localStorage.getItem(LocalStorageKeys.AutoSync);
	const whirlpoolStore = useWhirlpoolStore();
	const categoryStore = useCategoriesStore();
	const settingsStore = useSettingsStore();
	const api = ref(new WhirlpoolAPI());
	const syncCode = ref<string | null>(getLocalStorageSyncCode);
	const autoSyncEnabled = ref(getLocalStorageAutoSync === "true" || false);
	const syncInProgress = ref(false);
	const lastSynced = ref<DateTime | null>(
		getLocalStorageLastSynced ? DateTime.fromISO(getLocalStorageLastSynced) : null
	);
	const MAX_BATCH_LENGTH = 50;
	const serverWhirlpools = ref<ServerWhirlpool[] | null>(null);
	const serverCategories = ref<ServerCategory[] | null>(null);

	async function SetUnsyncedChanges(params: {
		ids: string[];
		type: "whirlpools" | "categories";
		setting?: boolean;
	}) {
		const { ids, type, setting } = params;
		if (type === "whirlpools") {
			await LoggerDatabase.whirlpools.bulkUpdate(
				ids.map((id) => ({
					key: id,
					changes: { unsyncedChanges: setting ?? false }
				}))
			);
		} else {
			await LoggerDatabase.categories.bulkUpdate(
				ids.map((id) => ({
					key: id,
					changes: { unsyncedChanges: setting ?? false }
				}))
			);
		}
	}

	function CheckAuth() {
		const { authStore } = api.value.instance;
		if (authStore.record === null) return false;
		if (authStore.record.syncCode !== syncCode.value) return false;
		return authStore.isValid;
	}

	async function ApplySyncCodeToWhirlpools(newSyncCode: string) {
		if (whirlpoolStore.databaseWhirlpools === undefined) return;
		await LoggerDatabase.whirlpools.bulkUpdate(
			whirlpoolStore.databaseWhirlpools.map((whirlpool) => ({
				key: whirlpool.id,
				changes: { syncCode: newSyncCode }
			}))
		);
	}

	async function ApplySyncCodeToCategories(newSyncCode: string) {
		if (categoryStore.databaseCategories === undefined) return;
		await LoggerDatabase.categories.bulkUpdate(
			categoryStore.databaseCategories.map((category) => ({
				key: category.id,
				changes: { syncCode: newSyncCode }
			}))
		);
	}

	function ValidateSyncCode(code: string) {
		const testCondition = /^[a-zA-Z0-9]{10}$/;
		return testCondition.test(code);
	}

	async function Synchronizer(params: {
		syncCode: string;
		clientCategories: DatabaseCategory[];
		serverCategories: ServerCategory[];
		clientWhirlpools: DatabaseWhirlpool[];
		serverWhirlpools: ServerWhirlpool[];
	}) {
		const { syncCode, clientCategories, serverCategories, clientWhirlpools, serverWhirlpools } =
			params;
		// if there is no server data, the source of truth is the client.
		// if there is server data but no client data, the source of truth is the server.
		// if there is server data and there is client data...
		// the source of truth is the server, except where client data has unsyncedChanges set to true.

		// map categories
		const clientCategoriesMap = new Map<string, ServerCategory>();
		const serverCategoriesMap = new Map<string, ServerCategory>();
		for (const clientCategory of clientCategories) {
			const { id, ...everythingElse } = clientCategory;
			clientCategoriesMap.set(id, {
				...everythingElse,
				clientId: id,
				syncCode: everythingElse.syncCode ?? syncCode
			});
		}
		for (const serverCategory of serverCategories) {
			serverCategoriesMap.set(serverCategory.clientId, serverCategory);
		}
		// map whirlpools
		const clientWhirlpoolsMap = new Map<string, ServerWhirlpool>();
		const serverWhirlpoolsMap = new Map<string, ServerWhirlpool>();
		for (const clientWhirlpool of clientWhirlpools) {
			const { id, ...everythingElse } = clientWhirlpool;
			clientWhirlpoolsMap.set(id, {
				...everythingElse,
				clientId: id,
				syncCode: everythingElse.syncCode ?? syncCode
			});
		}
		for (const serverWhirlpool of serverWhirlpools) {
			serverWhirlpoolsMap.set(serverWhirlpool.clientId, serverWhirlpool);
		}

		async function OverwriteLocalCategories() {
			await LoggerDatabase.categories.clear();
			await LoggerDatabase.categories.bulkAdd(
				serverCategories.map((serverCategory): DatabaseCategory => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id, ...everythingElse } = serverCategory;
					console.log(everythingElse);
					return {
						...everythingElse,
						id: everythingElse.clientId,
						unsyncedChanges: false
					};
				})
			);
		}

		async function OverwriteLocalWhirlpools() {
			await LoggerDatabase.whirlpools.clear();
			await LoggerDatabase.whirlpools.bulkAdd(
				serverWhirlpools.map((serverWhirlpool): DatabaseWhirlpool => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id, ...everythingElse } = serverWhirlpool;
					console.log(everythingElse);
					return {
						...everythingElse,
						id: everythingElse.clientId,
						unsyncedChanges: false
					};
				})
			);
		}

		async function UploadLocalCategories() {
			// The server is configured to only accept so many requests at a time, so we create a "batch of batches." Once a single batch has reached the limit, we set it aside and create a new one.
			const createBatches: ServerCategory[][] = [];
			let currentCreateBatch: ServerCategory[] = [];
			clientCategories.forEach((clientCategory) => {
				// check if the current batch has reached the limit. If so, add it to the batch array, then start a new one
				if (currentCreateBatch.length === MAX_BATCH_LENGTH) {
					createBatches.push(currentCreateBatch);
					currentCreateBatch = [];
				}
				// to avoid needless use of bandwidth, only send categories that have unsynced changes
				if (clientCategory.unsyncedChanges) {
					currentCreateBatch.push({
						...clientCategory,
						id: undefined,
						clientId: clientCategory.id,
						syncCode: clientCategory.syncCode ?? syncCode
					});
				}
			});

			// add final batch
			if (currentCreateBatch.length > 0) createBatches.push(currentCreateBatch);

			// create and send set of batch requests
			if (createBatches.length > 0) {
				// track which categories have been synced
				const syncedIds: string[] = [];
				for (const batch of createBatches) {
					const createCategoryRequestBatch = api.value.instance.createBatch();
					batch.forEach((request) => {
						createCategoryRequestBatch.collection("categories").create({ ...request });
					});
					const responses = await createCategoryRequestBatch.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.clientId);
						}
					});
				}
				// for each successfully synced item, flip 'unsyncedChanges' property to false.
				await SetUnsyncedChanges({ ids: syncedIds, type: "categories" });
			}
		}

		async function UploadLocalWhirlpools() {
			const createBatches: ServerWhirlpool[][] = [];
			let currentCreateBatch: ServerWhirlpool[] = [];
			clientWhirlpools.forEach((clientWhirlpool) => {
				if (currentCreateBatch.length === MAX_BATCH_LENGTH) {
					createBatches.push(currentCreateBatch);
					currentCreateBatch = [];
				}
				if (clientWhirlpool.unsyncedChanges) {
					currentCreateBatch.push({
						...clientWhirlpool,
						id: undefined,
						clientId: clientWhirlpool.id,
						syncCode: clientWhirlpool.syncCode ?? syncCode
					});
				}
			});

			if (currentCreateBatch.length > 0) createBatches.push(currentCreateBatch);

			if (createBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of createBatches) {
					const createWhirlpoolRequestBatch = api.value.instance.createBatch();
					batch.forEach((request) => {
						createWhirlpoolRequestBatch.collection("whirlpools").create({ ...request });
					});
					const responses = await createWhirlpoolRequestBatch.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.clientId);
						}
					});
				}
				await SetUnsyncedChanges({ ids: syncedIds, type: "whirlpools" });
			}
		}

		if (serverWhirlpools.length === 0) {
			await UploadLocalCategories();
			await UploadLocalWhirlpools();
		} else if (clientWhirlpools.length === 0) {
			await OverwriteLocalCategories();
			await OverwriteLocalWhirlpools();
		} else {
			const unsyncedCategories = new Map(
				clientCategories.filter((cat) => cat.unsyncedChanges).map((cat) => [cat.id, cat])
			);
			const unsyncedWhirlpools = new Map(
				clientWhirlpools.filter((wp) => wp.unsyncedChanges).map((wp) => [wp.id, wp])
			);

			const categoriesToDownload = serverCategories
				.filter((serverCat) => {
					const getLocalCategory = clientCategoriesMap.get(serverCat.clientId);
					// if there isn't a local category, we assume that means the server version is new. otherwise, we compare updatedOn fields.
					const serverIsNewer =
						getLocalCategory === undefined ||
						DateTime.fromISO(serverCat.updatedOn) > DateTime.fromISO(getLocalCategory.updatedOn);
					return !unsyncedCategories.has(serverCat.clientId) && serverIsNewer;
				})
				.map((finalCat): DatabaseCategory => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id, ...everythingElse } = finalCat;
					return {
						...everythingElse,
						id: everythingElse.clientId,
						unsyncedChanges: false
					};
				});

			const whirlpoolsToDownload = serverWhirlpools
				.filter((serverWp) => {
					const getLocalWhirlpool = clientWhirlpoolsMap.get(serverWp.clientId);
					const serverIsNewer =
						getLocalWhirlpool === undefined ||
						DateTime.fromISO(serverWp.updatedOn) > DateTime.fromISO(getLocalWhirlpool.updatedOn);
					return !unsyncedWhirlpools.has(serverWp.clientId) && serverIsNewer;
				})
				.map((finalWp): DatabaseWhirlpool => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { id, ...everythingElse } = finalWp;
					return {
						...everythingElse,
						id: everythingElse.clientId,
						unsyncedChanges: false
					};
				});

			// write categories to client
			await LoggerDatabase.categories.bulkPut(categoriesToDownload);
			// write whirlpools to client
			await LoggerDatabase.whirlpools.bulkPut(whirlpoolsToDownload);

			// send categories to server
			const upsertCategoryBatches: ServerCategory[][] = [];
			let currentUpsertCategoryBatch: ServerCategory[] = [];
			for (const unsyncedCategory of unsyncedCategories) {
				if (currentUpsertCategoryBatch.length === MAX_BATCH_LENGTH) {
					upsertCategoryBatches.push(currentUpsertCategoryBatch);
					currentUpsertCategoryBatch = [];
				}
				const getServerCategory = serverCategoriesMap.get(unsyncedCategory[0]);
				// the category exists on the server, this is an update operation and we'll need the server id. otherwise, we leave id undefined and the server will generate one when it creates a new record for the category.
				currentUpsertCategoryBatch.push({
					...unsyncedCategory[1],
					id: getServerCategory ? getServerCategory.id : undefined,
					clientId: unsyncedCategory[1].id,
					syncCode: syncCode
				});
			}

			// add final batch
			if (currentUpsertCategoryBatch.length > 0)
				upsertCategoryBatches.push(currentUpsertCategoryBatch);
			if (upsertCategoryBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of upsertCategoryBatches) {
					const upsertCategoryRequestBatch = api.value.instance.createBatch();
					batch.forEach((request) => {
						upsertCategoryRequestBatch.collection("categories").upsert({ ...request });
					});
					const responses = await upsertCategoryRequestBatch.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.clientId);
						}
					});
				}

				await SetUnsyncedChanges({ ids: syncedIds, type: "categories" });
			}

			// send whirlpools to server
			// send categories to server
			const upsertWhirlpoolBatches: ServerWhirlpool[][] = [];
			let currentUpsertWhirlpoolBatch: ServerWhirlpool[] = [];
			for (const unsyncedWhirlpool of unsyncedWhirlpools) {
				if (currentUpsertWhirlpoolBatch.length === MAX_BATCH_LENGTH) {
					upsertWhirlpoolBatches.push(currentUpsertWhirlpoolBatch);
					currentUpsertWhirlpoolBatch = [];
				}
				const getServerWhirlpool = serverWhirlpoolsMap.get(unsyncedWhirlpool[0]);
				currentUpsertWhirlpoolBatch.push({
					...unsyncedWhirlpool[1],
					id: getServerWhirlpool ? getServerWhirlpool.id : undefined,
					clientId: unsyncedWhirlpool[1].id,
					syncCode: syncCode
				});
			}

			// add final batch
			if (currentUpsertWhirlpoolBatch.length > 0)
				upsertWhirlpoolBatches.push(currentUpsertWhirlpoolBatch);
			if (upsertWhirlpoolBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of upsertWhirlpoolBatches) {
					const upsertWhirlpoolRequestBatch = api.value.instance.createBatch();
					batch.forEach((request) => {
						upsertWhirlpoolRequestBatch.collection("whirlpools").upsert({ ...request });
					});
					const responses = await upsertWhirlpoolRequestBatch.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.clientId);
						}
					});
				}

				await SetUnsyncedChanges({ ids: syncedIds, type: "whirlpools" });
			}
		}
	}

	async function GetServerRecords(inputSyncCode: string): Promise<IProcessResult> {
		let getError: boolean = false;

		// Get server records
		serverWhirlpools.value = await api.value.instance
			.collection("whirlpools")
			.getFullList({ filter: `syncCode = '${inputSyncCode}'` })
			.catch((error) => {
				console.error("Sync Error: ", error);
				getError = true;
				return [] as ServerWhirlpool[];
			});

		if (getError) {
			serverWhirlpools.value = null;
			return {
				result: "error",
				message:
					"There was an error getting the server whirlpools. You may need to validate your Sync Code again."
			};
		}

		serverCategories.value = await api.value.instance
			.collection("categories")
			.getFullList({ filter: `syncCode = '${inputSyncCode}'` })
			.catch((error) => {
				console.error("Sync Error: ", error);
				getError = true;
				return [] as ServerCategory[];
			});

		if (getError) {
			serverWhirlpools.value = null;
			return {
				result: "error",
				message:
					"There was an error getting the server categories. You may need to validate your Sync Code again."
			};
		}
		return {
			result: "ok"
		};
	}

	async function SyncWithServer(syncCode: string): Promise<IProcessResult> {
		let syncError = false;
		// make sure current sync code is properly applied to data
		await ApplySyncCodeToWhirlpools(syncCode);
		await ApplySyncCodeToCategories(syncCode);

		if (serverWhirlpools.value === null || serverCategories.value === null) {
			return { result: "error", message: "There was an error resolving server data." };
		}
		await Synchronizer({
			syncCode,
			serverWhirlpools: toRaw(serverWhirlpools.value) ?? [],
			serverCategories: toRaw(serverCategories.value) ?? [],
			clientCategories: categoryStore.databaseCategories ?? [],
			clientWhirlpools: whirlpoolStore.databaseWhirlpools ?? []
		}).catch((error) => {
			console.error("Sync Error: ", error);
			syncError = true;
		});

		// set lastSynced
		const now = DateTime.now();
		lastSynced.value = now;
		localStorage.setItem(LocalStorageKeys.LastSynced, now.toISO());

		// TODO: consider what the app should do when you do the following: Input a new sync code, for which you know there is data on the server, while also having existing data locally. I'm thinking the server should be considered the source of truth in such a case.
		return syncError
			? { result: "error", message: "An error occurred during sync." }
			: { result: "ok", message: "Sync Complete" };
	}

	async function RequestSyncCode(): Promise<IProcessResult> {
		try {
			const pass = import.meta.env.VITE_API_PASSWORD;
			if (pass) {
				const newUser = await api.value.instance.collection("users").create({
					password: pass,
					passwordConfirm: pass,
					syncedOn: DateTime.now().toISO()
				});
				if (newUser) {
					const newCode = newUser.syncCode;
					localStorage.setItem(LocalStorageKeys.SyncCode, newCode);
					syncCode.value = newCode;
					return { result: "ok", message: "New Sync Code issued by the server." };
				}
				return { result: "error", message: "The server did not issue a new Sync Code." };
			}
			return { result: "error", message: "There was an issue with sending the Sync Code request." };
		} catch (error) {
			console.log(error);
			return { result: "error", message: "There was an error requesting a Sync Code." };
		}
	}

	async function ValidateUser(): Promise<IProcessResult> {
		if (!syncCode.value) return { result: "error", message: "Sync Code is missing or incorrect." };
		try {
			await api.value.Authenticate(syncCode.value);
			localStorage.setItem(LocalStorageKeys.SyncCode, syncCode.value);
			return {
				result: "ok",
				message: "Sync Code successfully validated. You can now initiate a sync."
			};
		} catch (error) {
			console.error("Authentication Error: ", error);
			localStorage.removeItem(LocalStorageKeys.SyncCode);
			return {
				result: "error",
				message: "Failed to authenticate. Your Sync Code may be incorrect or expired."
			};
		}
	}

	async function AutoSync() {
		syncInProgress.value = true;
		if (!syncCode.value || !ValidateSyncCode(syncCode.value)) {
			autoSyncEnabled.value = false;
			settingsStore.DisplayToast(
				"There was a problem with the sync code. Auto sync has been disabled."
			);
			syncInProgress.value = false;
			return;
		}
		if (!CheckAuth()) {
			const validation = await ValidateUser();
			if (validation.result !== "ok") {
				autoSyncEnabled.value = false;
				settingsStore.DisplayToast(
					"There was a problem with authentication. Auto sync has been disabled."
				);
				syncInProgress.value = false;
				return;
			}
		}
		const getServerRecords = await GetServerRecords(syncCode.value);
		if (getServerRecords.result !== "ok") {
			autoSyncEnabled.value = false;
			settingsStore.DisplayToast(
				"There was a problem getting data from the server. Auto Sync has been disabled."
			);
			syncInProgress.value = false;
			return;
		}
		const syncResult = await SyncWithServer(syncCode.value);
		if (syncResult.result !== "ok") {
			autoSyncEnabled.value = false;
			settingsStore.DisplayToast("There was a problem with sync. Auto Sync has been disabled.");
			syncInProgress.value = false;
			return;
		}
		syncInProgress.value = false;
	}

	watch(
		() => autoSyncEnabled.value,
		(newValue) => {
			localStorage.setItem(LocalStorageKeys.AutoSync, String(newValue));
		}
	);

	return {
		api,
		syncCode,
		autoSyncEnabled,
		syncInProgress,
		lastSynced,
		serverWhirlpools,
		serverCategories,
		CheckAuth,
		ValidateSyncCode,
		GetServerRecords,
		SyncWithServer,
		RequestSyncCode,
		ValidateUser,
		AutoSync
	};
});

export default useSyncStore;
