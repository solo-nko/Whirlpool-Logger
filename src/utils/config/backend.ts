import PocketBase, { type RecordService } from "pocketbase";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";

interface APIUser {
	syncCode: string;
	syncedOn: Date;
}

interface TypedPocketBase extends PocketBase {
	collection(name: string): RecordService;
	collection(name: "whirlpools"): RecordService<DatabaseWhirlpool>;
	collection(name: "categories"): RecordService<DatabaseCategory>;
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
		await this.instance.collection("whirlpools").authWithPassword(syncCode, syncCode);
		await this.instance.collection("categories").authWithPassword(syncCode, syncCode);
	}

	async Logout() {
		this.instance.authStore.clear();
	}
}

export { WhirlpoolAPI };
