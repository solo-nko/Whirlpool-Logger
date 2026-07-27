import type { InjectionKey } from "vue";

const injectionKey = Symbol() as InjectionKey<{
	openPanel: Ref<number | string | null, number | string | null>;
	TogglePanel: (key: number | string) => void;
}>;

export { injectionKey };
