<script setup lang="ts">
import { EditorContent, useEditor, type JSONContent, type HTMLContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import type { VBtn } from "vuetify/components";
import { Placeholder } from "@tiptap/extensions";
import { Color, TextStyle } from "@tiptap/extension-text-style";

type TipTapEditorProps = {
	modelValue?: JSONContent | HTMLContent;
	contentType?: "html" | "json";
};

const buttonFormatting: Pick<VBtn, "density" | "size"> = {
	density: "comfortable",
	size: "large"
};

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

// TODO: overwrite tab shortcut for lists: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts
const editor = useEditor({
	extensions: [
		StarterKit.configure({
			paragraph: {
				HTMLAttributes: {
					class: "my-0"
				}
			},
			orderedList: {
				HTMLAttributes: {
					class: "my-0"
				}
			},
			bulletList: {
				HTMLAttributes: {
					class: "my-0"
				}
			}
		}),
		Placeholder.configure({
			placeholder: "Write down your thoughts..."
		}),
		TextStyle,
		Color
	],
	content: modelValue,
	onUpdate({ editor }) {
		if (contentType === "json") emits("update:modelValue", editor.getJSON());
		else if (contentType === "html") emits("update:modelValue", editor.getHTML());
	},
	editorProps: {
		attributes: {
			class: "editor-container min-h-15 m-2"
		}
	}
});

const canUndo = computed(() => editor.value?.can().undo());
const canRedo = computed(() => editor.value?.can().redo());
const currentColor = computed(() => editor.value?.getAttributes("textStyle").color);

const textColor = ref<string | undefined>();

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

// TODO: figure out a way to unset color/remove formatting
watch(textColor, (newColor, oldColor) => {
	if (newColor !== undefined) {
		editor.value?.commands.setColor(newColor);
	}
	console.log("previous:", oldColor);
	console.log("new:", newColor);
});

onBeforeUnmount(() => {
	editor.value?.destroy();
});
</script>

<template>
	<div class="border-2 border-gray-200/50 rounded-lg w-full">
		<!--		Toolbar wrapper -->
		<div class="border-b-1 border-gray-200/50 flex justify-center">
			<VBtnToggle multiple>
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-undo"
							v-bind="activatorProps"
							:disabled="!canUndo"
							variant="text"
							@click="executeUndo"
						>
						</VBtn>
					</template>
					<span>Undo</span>
				</VTooltip>
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-redo"
							v-bind="activatorProps"
							:disabled="!canRedo"
							variant="text"
							@click="executeRedo"
						>
						</VBtn>
					</template>
					<span>Redo</span>
				</VTooltip>
				<VDivider vertical gradient thickness="2" />

				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-bold"
							v-bind="activatorProps"
							variant="text"
							@click="toggleBold"
						>
						</VBtn>
					</template>
					<span>Bold</span>
				</VTooltip>
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-italic"
							v-bind="activatorProps"
							variant="text"
							@click="toggleItalic"
						/>
					</template>
					<span>Italic</span>
				</VTooltip>
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-underline"
							v-bind="activatorProps"
							variant="text"
							@click="toggleUnderline"
						/>
					</template>
					<span>Underline</span>
				</VTooltip>

				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-strikethrough-variant"
							v-bind="activatorProps"
							variant="text"
							@click="toggleStrikethrough"
						/>
					</template>
					<span>Strikethrough</span>
				</VTooltip>
				<VMenu location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							v-bind="activatorProps"
							variant="text"
							class="v-btn--icon"
						>
							<div class="color-icon-container">
								<VIcon class="color-icon-text" icon="mdi-format-color-text"></VIcon>
								<VIcon class="color-icon-bar" icon="mdi-color-helper" :color="currentColor"></VIcon>
							</div>
						</VBtn>
					</template>
					<VColorPicker
						v-model="textColor"
						title="Text Color"
						show-swatches
						:hide-title="false"
						hide-canvas
						hide-eye-dropper
						hide-sliders
						hide-inputs
					/>
				</VMenu>
				<VDivider vertical gradient thickness="2" />
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-list-bulleted"
							v-bind="activatorProps"
							variant="text"
							@click="toggleBulletList"
						/>
					</template>
					<span>Bulleted List</span>
				</VTooltip>

				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-list-numbered"
							v-bind="activatorProps"
							variant="text"
							@click="toggleOrderedList"
						/>
					</template>
					<span>Numbered List</span>
				</VTooltip>
			</VBtnToggle>
		</div>
		<!--		Editor wrapper-->
		<div class="overflow-y-auto max-h-120 min-h-30 px-2">
			<EditorContent :editor="editor" />
		</div>
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
