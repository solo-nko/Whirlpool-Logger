import { useObservable } from "@vueuse/rxjs";
import { DateTime } from "luxon";
import { from } from "rxjs";
import { liveQuery } from "dexie";
import type DatabaseWhirlpool from "@/utils/database/models/DatabaseWhirlpool.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { IWhirlpoolLog } from "@/utils/types/IWhirlpoolLog.ts";

const useWhirlpoolStore = defineStore("whirlpool-store", () => {
	const databaseWhirlpools = useObservable<DatabaseWhirlpool[]>(
		from(liveQuery(async () => LoggerDatabase.whirlpools.toArray()))
	);

	const clientWhirlpools = computed<IWhirlpoolLog[]>(() => {
		const stored = databaseWhirlpools.value;
		if (stored) {
			return stored.map((log): IWhirlpoolLog => {
				return {
					...log,
					deletedOn: log.deletedOn ? DateTime.fromJSDate(log.deletedOn) : undefined,
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
