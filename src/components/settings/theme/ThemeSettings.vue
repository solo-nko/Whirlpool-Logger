<script setup lang="ts">
import { useTheme } from "vuetify";
import PaletteCube from "@/components/settings/theme/PaletteCube.vue";
import LocalStorageKeys from "@/utils/config/LocalStorageKeys.ts";
import {
	lizardMint,
	midnightElectric,
	royalCobalt,
	wineSplash
} from "@/utils/config/themes/darkThemes.ts";

const themeInstance = useTheme();

const changeTheme = (inputTheme: string) => {
	themeInstance.change(inputTheme);
	localStorage.setItem(LocalStorageKeys.Theme, inputTheme);
};

const currentTheme = computed(() =>
	availableThemes.find((theme) => theme.themeVariable === themeInstance.name.value)
);

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
		primaryColor: (royalCobalt.colors?.surface as string) ?? "",
		secondaryColor: (royalCobalt.colors?.background as string) ?? "",
		tertiaryColor: "#fbfcff"
	},
	{
		label: "Wine Splash",
		themeVariable: "wineSplash",
		primaryColor: (wineSplash.colors?.surface as string) ?? "",
		secondaryColor: (wineSplash.colors?.background as string) ?? "",
		tertiaryColor: "#fbfcff"
	},
	{
		label: "Lizard Mint",
		themeVariable: "lizardMint",
		primaryColor: (lizardMint.colors?.surface as string) ?? "",
		secondaryColor: (lizardMint.colors?.background as string) ?? "",
		tertiaryColor: "#fbfcff"
	},
	{
		label: "Midnight Electric",
		themeVariable: "midnightElectric",
		primaryColor: (midnightElectric.colors?.surface as string) ?? "",
		secondaryColor: (midnightElectric.colors?.background as string) ?? "",
		tertiaryColor: (midnightElectric.colors?.["on-background"] as string) ?? ""
	}
];
</script>

<template>
	<h2>Theme Settings</h2>
	<div>Here you can change the app's visual theme. Select from one of the options below!</div>
	<h3 v-if="currentTheme">Current Theme: {{ currentTheme.label }}</h3>
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
