<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";

const model = defineModel({
	type: Object,
	default: () => ({ type: "doc", content: [] })
});

const editor = useEditor({
	extensions: [StarterKit],
	onUpdate({ editor }) {
		model.value = editor.getJSON();
	},
	editorProps: {
		attributes: {
			class: "editor-container"
		}
	}
});

function ToggleBold() {
	editor.value?.chain().focus().toggleBold().run();
}

function ToggleItalic() {
	editor.value?.chain().focus().toggleItalic().run();
}

function ToggleUnderline() {
	editor.value?.chain().focus().toggleUnderline().run();
}
</script>

<template>
	<div class="border-2 border-gray-200 w-full">
		<!--		Toolbar wrapper -->
		<div class="border-b-1 border-gray-200 flex justify-center">
			<VBtnGroup>
				<VTooltip location="bottom">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							density="comfortable"
							size="small"
							icon="mdi-format-bold"
							v-bind="activatorProps"
							@click="ToggleBold"
						>
						</VBtn>
					</template>
					Bold
				</VTooltip>
				<VTooltip location="bottom">
					<template v-slot:activator="{ props: activatorProps }">
						<VBtn
							density="comfortable"
							size="small"
							icon="mdi-format-italic"
							v-bind="activatorProps"
							@click="ToggleItalic"
						/>
					</template>
					Italic
				</VTooltip>

				<VBtn
					density="comfortable"
					size="small"
					icon="mdi-format-underline"
					@click="ToggleUnderline"
				/>
			</VBtnGroup>
		</div>
		<!--		Editor wrapper-->
		<div class="overflow-y-auto max-h-40">
			<EditorContent :editor="editor" />
		</div>
	</div>
</template>

<style scoped>
/* https://github.com/ueberdosis/tiptap/issues/526#issuecomment-1146048772 */
::v-deep(.ProseMirror:focus-visible) {
	outline: none;
}

::v-deep(.tiptap p) {
	font-size: 0.75rem;
}
</style>
