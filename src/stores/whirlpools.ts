import { useObservable } from "@vueuse/rxjs";
import { DateTime } from "luxon";
import { from } from "rxjs";
import { liveQuery } from "dexie";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";

const useWhirlpoolStore = defineStore("whirlpool-store", () => {
	const databaseWhirlpools = useObservable<DatabaseWhirlpool[]>(
		from(liveQuery(async () => LoggerDatabase.whirlpools.toArray()))
	);

	const clientWhirlpools = computed<WhirlpoolLog[]>(() => {
		const stored = databaseWhirlpools.value;
		if (stored) {
			return stored.map((log): WhirlpoolLog => {
				return {
					...log,
					status: log.status ? DatabaseStatus.ConvertStatusesFromDatabase(log.status) : undefined,
					categoryId: log.categoryId,
					deletedOn: log.deletedOn ? DateTime.fromISO(log.deletedOn) : null,
					updatedOn: DateTime.fromISO(log.updatedOn),
					createdOn: DateTime.fromISO(log.createdOn)
				};
			});
		}
		return [];
	});

	return { databaseWhirlpools, clientWhirlpools };
});

export default useWhirlpoolStore;
