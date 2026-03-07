<script setup lang="ts">
import { EditorContent, useEditor, type JSONContent, type HTMLContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import type { VBtn } from "vuetify/components";
import { Placeholder } from "@tiptap/extensions";

type TipTapEditorProps = {
	modelValue?: JSONContent | HTMLContent;
	contentType?: "html" | "json";
};

const buttonFormatting: Pick<VBtn, "density" | "size"> = {
	density: "comfortable",
	size: "small"
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

const editor = useEditor({
	extensions: [
		StarterKit,
		Placeholder.configure({
			placeholder: "Write down your thoughts..."
		})
	],
	content: modelValue,
	onUpdate({ editor }) {
		if (contentType === "json") emits("update:modelValue", editor.getJSON());
		else if (contentType === "html") emits("update:modelValue", editor.getHTML());
	},
	editorProps: {
		attributes: {
			class: "editor-container"
		}
	}
});

const canUndo = computed(() => editor.value?.can().undo());
const canRedo = computed(() => editor.value?.can().redo());

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

onBeforeUnmount(() => {
	editor.value?.destroy();
});
</script>

<template>
	<div class="border-2 border-gray-200/50 rounded-lg w-full">
		<!--		Toolbar wrapper -->
		<div class="border-b-1 border-gray-200/50 flex justify-center">
			<VBtnGroup>
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-undo"
							v-bind="activatorProps"
							:disabled="!canUndo"
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
							@click="toggleStrikethrough"
						/>
					</template>
					<span>Strikethrough</span>
				</VTooltip>
				<VDivider vertical gradient thickness="2" />
				<VTooltip location="top">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							:density="buttonFormatting.density"
							:size="buttonFormatting.size"
							icon="mdi-format-list-bulleted"
							v-bind="activatorProps"
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
							@click="toggleOrderedList"
						/>
					</template>
					<span>Numbered List</span>
				</VTooltip>
			</VBtnGroup>
		</div>
		<!--		Editor wrapper-->
		<div class="overflow-y-auto max-h-40 min-h-20 px-2">
			<EditorContent :editor="editor" />
		</div>
	</div>
</template>

<style scoped>
/* https://github.com/ueberdosis/tiptap/issues/526#issuecomment-1146048772 */
::v-deep(.ProseMirror:focus-visible) {
	outline: none;
}

::v-deep(.tiptap) {
	min-height: 3rem;
}

::v-deep(.tiptap p) {
	font-size: 0.75rem;
}

::v-deep(.tiptap p.is-editor-empty:first-child::before) {
	color: #adb5bd;
	content: attr(data-placeholder);
	float: left;
	height: 0;
	pointer-events: none;
}
</style>
