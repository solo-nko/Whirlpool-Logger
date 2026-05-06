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

	async function SetUnsyncedChanges(ids: string[], setting = false) {
		await LoggerDatabase.whirlpools.bulkUpdate(
			ids.map((id) => ({
				key: id,
				changes: { unsyncedChanges: setting }
			}))
		);
	}

	function CheckAuth() {
		if (!api.value.instance.authStore.isValid) return false;
		if (
			lastSynced.value &&
			lastSynced.value.isValid &&
			lastSynced.value.diffNow(["hours"]).hours < -48
		) {
			return false;
		}
		return true;
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

	async function SyncCategories(
		clientCategories: ServerCategory[],
		serverCategories: ServerCategory[]
	) {
		// No categories on server, meaning this is likely a first-time sync
		if (serverCategories.length === 0) {
			const createBatches: ServerCategory[][] = [];
			let createBatch: ServerCategory[] = [];
			clientCategories.forEach((category) => {
				// check if current batch has reached limit. if so add it to the batch array, then start a new one
				if (createBatch.length === MAX_BATCH_LENGTH) {
					createBatches.push(createBatch);
					createBatch = [];
				}
				createBatch.push({ ...category, id: undefined });
			});
			// add final batch
			if (createBatch.length > 0) createBatches.push(createBatch);
			// create and send a set of batch requests, up to MAX_BATCH_REQUESTS requests for batch
			if (createBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of createBatches) {
					const batchCreateCategoryRequest = api.value.instance.createBatch();
					batch.forEach((request) => {
						batchCreateCategoryRequest.collection("categories").create({ ...request });
						syncedIds.push(request.clientId);
					});
					const responses = await batchCreateCategoryRequest.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.id);
						}
					});
				}
				// for each successfully synced item, flip 'unsyncedChanges' property to false
				await SetUnsyncedChanges(syncedIds);
			}
		} else {
			// Switch from arrays to maps for performance
			const clientCategoriesMap = new Map<string, ServerCategory>();
			const serverCategoriesMap = new Map<string, ServerCategory>();
			for (const clientCategory of clientCategories) {
				clientCategoriesMap.set(clientCategory.clientId, clientCategory);
			}
			for (const serverCategory of serverCategories) {
				serverCategoriesMap.set(serverCategory.clientId, serverCategory);
			}

			const upsertBatches: ServerCategory[][] = [];
			let upsertBatch: ServerCategory[] = [];

			for (const clientCategory of clientCategoriesMap) {
				// check if current batch has reached limit. If so, add it to the batch array, then start a new one
				if (upsertBatch.length === MAX_BATCH_LENGTH) {
					upsertBatches.push(upsertBatch);
					upsertBatch = [];
				}

				const getServerCategory = serverCategoriesMap.get(clientCategory[0]);
				// Skip client categories that don't exist on the server (because it's not currently possible for the user to create categories, the only way this should happen is via categories created at db initialization)
				if (getServerCategory === undefined) continue;
				const serverUpdatedOn = DateTime.fromISO(getServerCategory.updatedOn);
				const clientUpdatedOn = DateTime.fromISO(clientCategory[1].updatedOn);
				// If server category is outdated, update it.
				if (serverUpdatedOn < clientUpdatedOn) {
					upsertBatch.push({ ...clientCategory[1] });
				}
			}
			// add final batch
			if (upsertBatch.length > 0) upsertBatches.push(upsertBatch);

			if (upsertBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of upsertBatches) {
					const batchUpsertCategoryRequest = api.value.instance.createBatch();
					batch.forEach((request) => {
						batchUpsertCategoryRequest.collection("categories").upsert({ ...request });
						syncedIds.push(request.clientId);
					});
					const responses = await batchUpsertCategoryRequest.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.id);
						}
					});
				}

				// for each successfully synced item, flip 'unsyncedChanges' property to false
				await SetUnsyncedChanges(syncedIds);
			}

			const newClientCategories: DatabaseCategory[] = [];
			const updatedClientCategories: DatabaseCategory[] = [];
			for (const serverCategory of serverCategoriesMap) {
				const getClientCategory = clientCategoriesMap.get(serverCategory[0]);
				// If client is missing any categories that the server has, create them.
				if (getClientCategory === undefined) {
					newClientCategories.push({
						...serverCategory[1],
						id: serverCategory[1].clientId,
						unsyncedChanges: false
					});
				} else {
					const serverUpdatedOn = DateTime.fromISO(serverCategory[1].updatedOn);
					const clientUpdatedOn = DateTime.fromISO(getClientCategory.updatedOn);

					// If client category is outdated, update it
					if (clientUpdatedOn < serverUpdatedOn) {
						updatedClientCategories.push({
							...serverCategory[1],
							id: serverCategory[1].clientId,
							unsyncedChanges: false
						});
					}
				}
			}
			/*
			 * https://dexie.org/docs/Table/Table.update()
			 * "The difference between update() and put() is that update() will only apply the given changes to the object while put() will replace the entire object"
			 * */
			await LoggerDatabase.categories.bulkPut([...newClientCategories, ...updatedClientCategories]);
		}
	}

	async function SyncWhirlpools(
		clientWhirlpools: ServerWhirlpool[],
		serverWhirlpools: ServerWhirlpool[]
	) {
		// No whirlpools on server, meaning this is likely a first-time sync
		if (serverWhirlpools.length === 0) {
			const createBatches: ServerWhirlpool[][] = [];
			let createBatch: ServerWhirlpool[] = [];
			clientWhirlpools.forEach((whirlpool) => {
				// check if current batch has reached limit. If so, add it to the batch array, then start a new one.
				if (createBatch.length === MAX_BATCH_LENGTH) {
					createBatches.push(createBatch);
					createBatch = [];
				}
				createBatch.push({ ...whirlpool, id: undefined });
			});

			// add final batch
			if (createBatch.length > 0) createBatches.push(createBatch);

			// create and send a set of batch requests, up to MAX_BATCH_REQUESTS requests per batch
			if (createBatches.length > 0) {
				const syncedIds: string[] = [];
				// TODO: foreach isn't recommended for async processes. Check if there are any dexie operations using it
				for (const batch of createBatches) {
					const batchCreateWhirlpoolsRequest = api.value.instance.createBatch();
					batch.forEach((request) => {
						batchCreateWhirlpoolsRequest.collection("whirlpools").create({ ...request });
					});
					const responses = await batchCreateWhirlpoolsRequest.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.id);
						}
					});
				}
				// for each successfully synced item, flip 'unsyncedChanges' property to false
				await SetUnsyncedChanges(syncedIds);
			}
		} else {
			// Switch from arrays to maps for performance
			const clientWhirlpoolsMap = new Map<string, ServerWhirlpool>();
			const serverWhirlpoolsMap = new Map<string, ServerWhirlpool>();
			for (const clientWhirlpool of clientWhirlpools) {
				clientWhirlpoolsMap.set(clientWhirlpool.clientId, clientWhirlpool);
			}
			for (const serverWhirlpool of serverWhirlpools) {
				serverWhirlpoolsMap.set(serverWhirlpool.clientId, serverWhirlpool);
			}

			const upsertBatches: ServerWhirlpool[][] = [];
			let upsertBatch: ServerWhirlpool[] = [];

			for (const clientWhirlpool of clientWhirlpoolsMap) {
				// check if current batch has reached limit. If so, add it to the batch array, then start a new one.
				if (upsertBatch.length === MAX_BATCH_LENGTH) {
					upsertBatches.push(upsertBatch);
					upsertBatch = [];
				}

				const getServerWhirlpool = serverWhirlpoolsMap.get(clientWhirlpool[0]);
				// If server is missing any whirlpools that the client has, create them (via upsert)
				if (getServerWhirlpool === undefined) {
					upsertBatch.push({ ...clientWhirlpool[1] });
				} else {
					// If server whirlpool is outdated, update it
					const serverUpdatedOn = DateTime.fromISO(getServerWhirlpool.updatedOn);
					const clientUpdatedOn = DateTime.fromISO(clientWhirlpool[1].updatedOn);

					if (serverUpdatedOn < clientUpdatedOn) {
						upsertBatch.push({ ...clientWhirlpool[1] });
					}
				}
			}
			// add final batch
			if (upsertBatch.length > 0) upsertBatches.push(upsertBatch);

			if (upsertBatches.length > 0) {
				const syncedIds: string[] = [];
				for (const batch of upsertBatches) {
					const batchUpsertWhirlpoolsRequest = api.value.instance.createBatch();
					batch.forEach((request) => {
						batchUpsertWhirlpoolsRequest.collection("whirlpools").upsert({ ...request });
						syncedIds.push(request.clientId);
					});
					const responses = await batchUpsertWhirlpoolsRequest.send();
					responses.forEach((response) => {
						if (response.status === 200) {
							syncedIds.push(response.body.id);
						}
					});
				}
				// for each successfully synced item, flip 'unsyncedChanges' property to false
				await SetUnsyncedChanges(syncedIds);
			}

			const newClientWhirlpools: DatabaseWhirlpool[] = [];
			const updatedClientWhirlpools: DatabaseWhirlpool[] = [];
			for (const serverWhirlpool of serverWhirlpoolsMap) {
				const getClientWhirlpool = clientWhirlpoolsMap.get(serverWhirlpool[0]);
				// If client is missing any whirlpools that the server has, create them
				if (getClientWhirlpool === undefined) {
					newClientWhirlpools.push({
						...serverWhirlpool[1],
						id: serverWhirlpool[1].clientId,
						unsyncedChanges: false
					});
				} else {
					const serverUpdatedOn = DateTime.fromISO(serverWhirlpool[1].updatedOn);
					const clientUpdatedOn = DateTime.fromISO(serverWhirlpool[1].updatedOn);

					// If client whirlpool is outdated, update it
					if (clientUpdatedOn < serverUpdatedOn) {
						updatedClientWhirlpools.push({
							...serverWhirlpool[1],
							id: serverWhirlpool[1].clientId,
							unsyncedChanges: false
						});
					}
				}
			}

			await LoggerDatabase.whirlpools.bulkPut([...newClientWhirlpools, ...updatedClientWhirlpools]);
		}
	}

	async function SyncWithServer(inputSyncCode: string): Promise<IProcessResult> {
		syncInProgress.value = true;
		let syncError: boolean = false;

		// make sure current sync code is properly applied to data
		await ApplySyncCodeToWhirlpools(inputSyncCode);
		await ApplySyncCodeToCategories(inputSyncCode);

		// Get server records
		const serverWhirlpools = await api.value.instance
			.collection("whirlpools")
			.getFullList({ filter: `syncCode = '${inputSyncCode}'` })
			.catch((error) => {
				console.error("Sync Error: ", error);
				syncError = true;
				return [] as ServerWhirlpool[];
			});

		if (syncError) {
			syncInProgress.value = false;
			return { result: "error", message: "There was an error getting the server whirlpools." };
		}

		const serverCategories = await api.value.instance
			.collection("categories")
			.getFullList({ filter: `syncCode = '${inputSyncCode}'` })
			.catch((error) => {
				console.error("Sync Error: ", error);
				syncError = true;
				return [] as ServerCategory[];
			});

		if (syncError) {
			syncInProgress.value = false;
			return { result: "error", message: "There was an error getting the server categories." };
		}

		// Get client records
		const clientWhirlpools: ServerWhirlpool[] = whirlpoolStore.databaseWhirlpools
			? whirlpoolStore.databaseWhirlpools.map(
					(dbWhirlpool): ServerWhirlpool => ({
						...dbWhirlpool,
						id: undefined,
						clientId: dbWhirlpool.id,
						syncCode: dbWhirlpool.syncCode === inputSyncCode ? dbWhirlpool.syncCode : inputSyncCode
					})
				)
			: [];
		const clientCategories = categoryStore.databaseCategories
			? categoryStore.databaseCategories.map(
					(dbCategory): ServerCategory => ({
						...dbCategory,
						id: undefined,
						clientId: dbCategory.id,
						syncCode: dbCategory.syncCode === inputSyncCode ? dbCategory.syncCode : inputSyncCode
					})
				)
			: [];

		// Sync categories first
		await SyncCategories(clientCategories, serverCategories).catch((error) => {
			console.error("Sync Error: ", error);
			syncInProgress.value = false;
			syncError = true;
		});
		if (syncError) {
			syncInProgress.value = false;
			return { result: "error", message: "There was an error syncing the categories." };
		}
		await SyncWhirlpools(clientWhirlpools, serverWhirlpools).catch((error) => {
			console.error("Sync Error: ", error);
			syncError = true;
		});
		if (syncError) {
			syncInProgress.value = false;
			return { result: "error", message: "There was an error syncing the whirlpools." };
		}

		// set lastSynced
		const now = DateTime.now();
		lastSynced.value = now;
		localStorage.setItem(LocalStorageKeys.LastSynced, now.toISO());

		// last step: delete any categories that don't have whirlpools attached to them.
		const categoriesToDelete: string[] = [];
		for (const category of clientCategories) {
			const getAttachedWhirlpool = clientWhirlpools.find(
				(whirlpool) => whirlpool.categoryId === category.clientId
			);
			if (getAttachedWhirlpool === undefined) {
				categoriesToDelete.push(category.clientId);
			}
		}
		await LoggerDatabase.categories.bulkDelete(categoriesToDelete);
		// TODO: This code assumes that the user does not create any whirlpools before their first sync. We should create a dialog or other UI that lets the user migrate orphaned whirlpools to the synced ones.
		syncInProgress.value = false;
		return { result: "ok", message: "Sync complete." };
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
			return { result: "error", message: "Failed to authenticate. Please check the Sync Code." };
		}
	}

	async function AutoSync() {
		if (!syncCode.value || !ValidateSyncCode(syncCode.value)) {
			autoSyncEnabled.value = false;
			settingsStore.DisplayToast(
				"There was a problem with the sync code. Auto sync has been disabled."
			);
			return;
		}
		if (!CheckAuth()) {
			const validation = await ValidateUser();
			if (validation.result !== "ok") {
				autoSyncEnabled.value = false;
				settingsStore.DisplayToast(
					"There was a problem with authentication. Auto sync has been disabled."
				);
				return;
			}
		}
		const result = await SyncWithServer(syncCode.value);
		if (result.result !== "ok") {
			autoSyncEnabled.value = false;
			settingsStore.DisplayToast("There was a problem with sync. Auto Sync has been disabled.");
		}
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
		lastSynced,
		CheckAuth,
		ValidateSyncCode,
		autoSyncEnabled,
		SyncWithServer,
		RequestSyncCode,
		ValidateUser,
		syncInProgress,
		AutoSync
	};
});

export default useSyncStore;
