<script setup lang="ts">
import { EditorContent, type HTMLContent, type JSONContent, useEditor } from "@tiptap/vue-3";
import type { VBtn } from "vuetify/components";
import useSettingsStore from "@/stores/settings.ts";
import { editorExtensions } from "@/components/TipTapEditor/EditorUtils.ts";

type TipTapEditorProps = {
	modelValue?: JSONContent | HTMLContent;
	contentType?: "html" | "json";
};

const buttonFormatting: Pick<VBtn, "density" | "size"> = {
	density: "comfortable",
	size: "large"
};

const settingsStore = useSettingsStore();

const { mdAndUp } = settingsStore.display;

const {
	modelValue = {
		type: "doc",
		content: [
			{
				type: "paragraph"
			}
		]
	},
	contentType = "json"
} = defineProps<TipTapEditorProps>();
const emits = defineEmits(["update:modelValue"]);

const textSelected = ref<boolean>(false);
const linkText = ref<string>("");

// TODO: overwrite tab shortcut for lists: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts
// Editor instance
const editor = useEditor({
	extensions: editorExtensions,
	content: modelValue,
	onUpdate({ editor }) {
		if (contentType === "json") emits("update:modelValue", editor.getJSON());
		else if (contentType === "html") emits("update:modelValue", editor.getHTML());
	},
	onSelectionUpdate(selectionProps) {
		textSelected.value =
			selectionProps.editor.state.selection.$from.pos !==
			selectionProps.editor.state.selection.$to.pos;
	},
	editorProps: {
		attributes: {
			class: "editor-container min-h-25 m-2"
		}
	}
});

const currentTextColor = computed(() => editor.value?.getAttributes("textStyle").color ?? "");
const currentHighlightColor = computed(() => editor.value?.getAttributes("highlight").color ?? "");
const canUndo = computed(() => editor.value?.can().undo());
const canRedo = computed(() => editor.value?.can().redo());

const isBold = computed(() => editor.value?.isActive("bold"));
const isItalics = computed(() => editor.value?.isActive("italic"));
const isUnderline = computed(() => editor.value?.isActive("underline"));
const isStrikeThrough = computed(() => editor.value?.isActive("strike"));

const toggleBold = () => {
	editor.value?.chain().focus().toggleBold().run();
};

const toggleItalic = () => {
	editor.value?.chain().focus().toggleItalic().run();
};

const toggleUnderline = () => {
	editor.value?.chain().focus().toggleUnderline().run();
};

const toggleBulletList = () => {
	editor.value?.chain().focus().toggleBulletList().run();
};

const toggleOrderedList = () => {
	editor.value?.chain().focus().toggleOrderedList().run();
};

const toggleStrikethrough = () => {
	editor.value?.chain().focus().toggleStrike().run();
};

const executeUndo = () => {
	editor.value?.chain().focus().undo().run();
};

const executeRedo = () => {
	editor.value?.chain().focus().redo().run();
};

const setLink = () => {
	editor.value?.commands.toggleLink({ href: linkText.value, target: "_blank" });
	linkText.value = "";
};

const hasLink = computed(() => {
	return editor.value?.getAttributes("link").href;
});

const onClickLinkButton = () => {
	if (!textSelected.value) return;
	if (editor.value?.getAttributes("link").href) editor.value.commands.unsetLink();
	else setLink();
};

const onChangeTextColor = (color: string) => {
	if (color === "#FFFFFF00") editor.value?.commands.unsetColor();
	else editor.value?.commands.setColor(color);
};

const onChangeHighlightColor = (color: string) => {
	if (color === "#FFFFFF00") editor.value?.commands.unsetHighlight();
	else editor.value?.commands.setHighlight({ color: color });
};

watch(
	() => modelValue,
	(newValue) => {
		let isSame = true;
		if (contentType === "json")
			isSame = JSON.stringify(editor.value?.getJSON()) === JSON.stringify(newValue);
		else if (contentType === "html") isSame = editor.value?.getHTML() === newValue;
		if (isSame) return;
		editor.value?.commands.setContent(newValue);
	}
);

onBeforeUnmount(() => {
	editor.value?.destroy();
});
</script>

<template>
	<div class="border-2 rounded-lg w-full">
		<!--		Toolbar wrapper -->
		<div class="border-b-1 flex justify-center">
			<VBtnGroup multiple class="grid grid-cols-6 md:flex">
				<!--	Undo -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$undo"
							v-bind="activatorProps"
							:disabled="!canUndo"
							variant="text"
							@click="executeUndo"
						>
						</VBtn>
					</template>
					<span>Undo</span>
				</VTooltip>
				<!--	Redo -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$redo"
							v-bind="activatorProps"
							:disabled="!canRedo"
							variant="text"
							@click="executeRedo"
						>
						</VBtn>
					</template>
					<span>Redo</span>
				</VTooltip>
				<VDivider v-if="mdAndUp" vertical gradient thickness="2" />
				<!--	Bold -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$bold"
							v-bind="activatorProps"
							variant="text"
							:active="isBold"
							@click="toggleBold"
						>
						</VBtn>
					</template>
					<span>Bold</span>
				</VTooltip>
				<!--	Italics -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$italic"
							v-bind="activatorProps"
							variant="text"
							:active="isItalics"
							@click="toggleItalic"
						/>
					</template>
					<span>Italic</span>
				</VTooltip>
				<!--	Underline -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$underline"
							v-bind="activatorProps"
							variant="text"
							:active="isUnderline"
							@click="toggleUnderline"
						/>
					</template>
					<span>Underline</span>
				</VTooltip>
				<!--	Strikethrough -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$strike"
							v-bind="activatorProps"
							variant="text"
							:active="isStrikeThrough"
							@click="toggleStrikethrough"
						/>
					</template>
					<span>Strikethrough</span>
				</VTooltip>
				<!--	Text Color -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							id="btn-text-color"
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							v-bind="activatorProps"
							variant="text"
							class="v-btn--icon"
						>
							<div class="color-icon-container">
								<VIcon class="color-icon-text" icon="$textColor"></VIcon>
								<VIcon class="color-icon-bar" icon="$colorBar" :color="currentTextColor"></VIcon>
							</div>
						</VBtn>
					</template>
					<span>Text Color</span>
				</VTooltip>
				<!--	Highlight Color -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							id="btn-text-highlight"
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							v-bind="activatorProps"
							variant="text"
							class="v-btn--icon"
						>
							<div class="color-icon-container">
								<VIcon class="color-icon-text" icon="$highlightColor"></VIcon>
								<VIcon
									class="color-icon-bar"
									icon="$colorBar"
									:color="currentHighlightColor"
								></VIcon>
							</div>
						</VBtn>
					</template>
					<span>Text Highlight</span>
				</VTooltip>
				<VDivider v-if="mdAndUp" vertical gradient thickness="2" />
				<!--	Text Align -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$alignText"
							v-bind="activatorProps"
							variant="text"
						/>
					</template>
					<span>Text Align</span>
				</VTooltip>
				<!--	Bulleted List -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$bulletList"
							v-bind="activatorProps"
							variant="text"
							@click="toggleBulletList"
						/>
					</template>
					<span>Bulleted List</span>
				</VTooltip>
				<!--	Numbered List -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$numberList"
							v-bind="activatorProps"
							variant="text"
							@click="toggleOrderedList"
						/>
					</template>
					<span>Numbered List</span>
				</VTooltip>
				<VDivider v-if="mdAndUp" vertical gradient thickness="2" />
				<!--	Link -->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							v-if="!hasLink"
							id="link-button"
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$link"
							variant="text"
							class="v-btn--icon"
							:disabled="!textSelected"
							v-bind="activatorProps"
						/>
						<VBtn
							v-else
							id="link-button"
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$link"
							variant="text"
							class="v-btn--icon"
							:disabled="!textSelected"
							v-bind="activatorProps"
							@click="onClickLinkButton"
						/>
					</template>
					<span>Add Link</span>
				</VTooltip>
				<!--	Clear Formatting	-->
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							tabindex="-1"
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="$removeFormatting"
							v-bind="activatorProps"
							variant="text"
						/>
					</template>
					<span>Clear Formatting</span>
				</VTooltip>
			</VBtnGroup>
		</div>
		<!--	Editor wrapper-->
		<div class="overflow-y-auto max-h-120 min-h-30 px-2">
			<EditorContent :editor="editor" />
		</div>
		<!--	Toolbar Menus-->
		<!--	Text Color Menu -->
		<!-- eslint-disable		vue/v-on-event-hyphenation-->
		<VMenu location="top" activator="#btn-text-color">
			<VColorPicker
				title="Text Color"
				show-swatches
				:hide-title="false"
				hide-canvas
				hide-eye-dropper
				hide-sliders
				hide-inputs
				@update:modelValue="onChangeTextColor"
			/>
		</VMenu>
		<!-- Text Highlight Menu	-->
		<VMenu location="top" activator="#btn-text-highlight">
			<VColorPicker
				title="Highlight Color"
				show-swatches
				:hide-title="false"
				hide-canvas
				hide-eye-dropper
				hide-sliders
				hide-inputs
				@update:modelValue="onChangeHighlightColor"
			/>
		</VMenu>
		<!-- eslint-enable		vue/v-on-event-hyphenation-->
		<!-- Link Menu -->
		<VMenu location="top" :close-on-content-click="false" activator="#link-button">
			<VCard class="w-60">
				<VCardTitle>Set Link</VCardTitle>
				<VRow>
					<VTextField v-model="linkText" density="compact" variant="outlined">
						<template v-slot:append>
							<VBtn @click="setLink">Set</VBtn>
						</template>
					</VTextField>
				</VRow>
			</VCard>
		</VMenu>
	</div>
</template>

<style scoped>
/* https://github.com/ueberdosis/tiptap/issues/526#issuecomment-1146048772 */
::v-deep(.ProseMirror:focus-visible) {
	outline: none;
}

::v-deep(.tiptap p.is-editor-empty:first-child::before) {
	color: #adb5bd;
	content: attr(data-placeholder);
	float: left;
	height: 0;
	pointer-events: none;
}

::v-deep(.tiptap p, li) {
	font-size: 0.8rem;
}

::v-deep(.tiptap ::marker) {
	font-size: 0.8rem;
}

::v-deep(.mdi-format-color-fill) {
	top: 2px;
}

.color-icon-container {
	display: grid;
	grid-template: 1fr/ 1fr;
	place-items: center;
}

.color-icon-container > * {
	grid-column: 1 / 1;
	grid-row: 1 / 1;
}

.color-icon-container .color-icon-text {
	z-index: 1;
}

.color-icon-container .color-icon-bar {
	z-index: 2;
}
</style>
