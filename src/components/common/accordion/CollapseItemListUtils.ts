import type { InjectionKey } from "vue";

const injectionKey = Symbol() as InjectionKey<{
	openPanels: Ref<(number | string)[], (number | string)[]>;
	TogglePanel: (key: number | string) => void;
}>;

export { injectionKey };
