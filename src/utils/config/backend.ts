import PocketBase, { type RecordService } from "pocketbase";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";

// TODO: update sync with new type changes (plainContent for whirlpools, and hidden fields for categories)
/** Tweaked version of the DatabaseWhirlpool type which requires syncCode and omits unsyncedChanges. */
export type ServerWhirlpool = Omit<
	InstanceType<typeof DatabaseWhirlpool>,
	"unsyncedChanges" | "syncCode" | "id"
> & {
	id?: string;
	clientId: string;
	syncCode: string;
};

export type ServerCategory = Omit<
	InstanceType<typeof DatabaseCategory>,
	"unsyncedChanges" | "syncCode" | "id"
> & {
	id?: string;
	clientId: string;
	syncCode: string;
};

interface APIUser {
	syncCode: string;
	syncedOn: string;
}

interface TypedPocketBase extends PocketBase {
	collection(name: string): RecordService;
	collection(name: "whirlpools"): RecordService<ServerWhirlpool>;
	collection(name: "categories"): RecordService<ServerCategory>;
	collection(name: "users"): RecordService<APIUser>;
}

class WhirlpoolAPI {
	instance: TypedPocketBase;
	endpointURL: string | undefined;
	endpointLoaded: boolean;

	constructor() {
		const getEndpointURL = import.meta.env.VITE_API_URL;
		if (getEndpointURL) {
			this.instance = new PocketBase(getEndpointURL) as TypedPocketBase;
			this.endpointURL = getEndpointURL;
			this.endpointLoaded = true;
		} else {
			this.instance = new PocketBase() as TypedPocketBase;
			this.endpointLoaded = false;
		}
	}

	async Authenticate(syncCode: string) {
		return await this.instance
			.collection("users")
			.authWithPassword(syncCode, import.meta.env.VITE_API_PASSWORD);
	}

	async Logout() {
		this.instance.authStore.clear();
	}
}

export { WhirlpoolAPI };
