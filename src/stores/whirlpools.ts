import { useObservable } from "@vueuse/rxjs";
import { DateTime } from "luxon";
import { from } from "rxjs";
import { liveQuery } from "dexie";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";
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
					category: DatabaseCategory.ConvertCategoryFromDatabase(log.category),
					deletedOn: log.deletedOn ? DateTime.fromJSDate(log.deletedOn) : null,
					updatedOn: DateTime.fromJSDate(log.updatedOn),
					createdOn: DateTime.fromJSDate(log.createdOn)
				};
			});
		}
		return [];
	});

	return { databaseWhirlpools, clientWhirlpools };
});

export default useWhirlpoolStore;
