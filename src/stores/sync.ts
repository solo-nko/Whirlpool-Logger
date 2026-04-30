import { WhirlpoolAPI } from "@/utils/config/backend.ts";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";

const useSyncStore = defineStore("sync-store", () => {
	const api = ref(new WhirlpoolAPI());
	const syncCode = ref<string | null>(localStorage.getItem(LocalStorageKeys.SyncCode));

	return { api, syncCode };
});

export default useSyncStore;
