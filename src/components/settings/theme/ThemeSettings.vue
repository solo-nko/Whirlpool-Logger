<script setup lang="ts">
import { useTheme } from "vuetify";
import PaletteCube from "@/components/settings/theme/PaletteCube.vue";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";

const themeInstance = useTheme();

const changeTheme = (inputTheme: string) => {
	themeInstance.change(inputTheme);
	localStorage.setItem(LocalStorageKeys.Theme, inputTheme);
};

const availableThemes: {
	primaryColor: string;
	secondaryColor: string;
	tertiaryColor: string;
	label: string;
	themeVariable: string;
}[] = [
	{
		label: "Royal Cobalt",
		themeVariable: "royalCobalt",
		primaryColor: "#26427e",
		secondaryColor: "#08275d",
		tertiaryColor: "#eccb5b"
	},
	{
		label: "Wine Splash",
		themeVariable: "wineSplash",
		primaryColor: "#7e3737",
		secondaryColor: "#680f14",
		tertiaryColor: "#eccb5b"
	}
];
</script>

<template>
	<div>Here you can change the app's visual theme. Select from one of the options below!</div>

	<PaletteCube
		v-for="(theme, index) in availableThemes"
		:key="index"
		class="m-5 cursor-pointer"
		:primary-color="theme.primaryColor"
		:secondary-color="theme.secondaryColor"
		:third-color="theme.tertiaryColor"
		:label="theme.label"
		@click="changeTheme(theme.themeVariable)"
	/>
</template>

<style scoped></style>
