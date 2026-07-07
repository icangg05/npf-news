<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Undo2, Redo2,
} from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
}>(), {
  placeholder: 'Tulis catatan…',
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = shallowRef<Editor>()

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue || '',
    // hindari mismatch hidrasi SSR
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder: props.placeholder }),
    ],
    editorProps: {
      attributes: {
        class: 'rte-content min-h-[120px] px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? '' : editor.getHTML()
      emit('update:modelValue', html)
    },
  })
})

// sinkron bila parent mengganti nilai (mis. saat mulai edit trade lain)
watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  if (value === (editor.value.isEmpty ? '' : editor.value.getHTML())) return
  editor.value.commands.setContent(value || '', { emitUpdate: false })
})

onBeforeUnmount(() => editor.value?.destroy())

interface ToolBtn {
  key: string
  icon: any
  title: string
  run: () => void
  active?: () => boolean
}

const buttons = computed<ToolBtn[]>(() => {
  const e = editor.value
  if (!e) return []
  return [
    { key: 'bold', icon: Bold, title: 'Tebal', run: () => e.chain().focus().toggleBold().run(), active: () => e.isActive('bold') },
    { key: 'italic', icon: Italic, title: 'Miring', run: () => e.chain().focus().toggleItalic().run(), active: () => e.isActive('italic') },
    { key: 'strike', icon: Strikethrough, title: 'Coret', run: () => e.chain().focus().toggleStrike().run(), active: () => e.isActive('strike') },
    { key: 'h2', icon: Heading2, title: 'Judul', run: () => e.chain().focus().toggleHeading({ level: 2 }).run(), active: () => e.isActive('heading', { level: 2 }) },
    { key: 'h3', icon: Heading3, title: 'Subjudul', run: () => e.chain().focus().toggleHeading({ level: 3 }).run(), active: () => e.isActive('heading', { level: 3 }) },
    { key: 'bullet', icon: List, title: 'Daftar', run: () => e.chain().focus().toggleBulletList().run(), active: () => e.isActive('bulletList') },
    { key: 'ordered', icon: ListOrdered, title: 'Daftar bernomor', run: () => e.chain().focus().toggleOrderedList().run(), active: () => e.isActive('orderedList') },
    { key: 'quote', icon: Quote, title: 'Kutipan', run: () => e.chain().focus().toggleBlockquote().run(), active: () => e.isActive('blockquote') },
    { key: 'undo', icon: Undo2, title: 'Urungkan', run: () => e.chain().focus().undo().run() },
    { key: 'redo', icon: Redo2, title: 'Ulangi', run: () => e.chain().focus().redo().run() },
  ]
})
</script>

<template>
  <div class="overflow-hidden rounded-md border bg-background focus-within:ring-1 focus-within:ring-ring">
    <ClientOnly>
      <!-- toolbar -->
      <div class="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-1.5 py-1">
        <button
          v-for="b in buttons"
          :key="b.key"
          type="button"
          :title="b.title"
          :aria-label="b.title"
          class="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          :class="b.active?.() ? 'bg-accent text-primary' : ''"
          @click="b.run"
        >
          <component :is="b.icon" class="h-4 w-4" />
        </button>
      </div>
      <EditorContent :editor="editor" />

      <template #fallback>
        <div class="min-h-[120px] px-3 py-2 text-sm text-muted-foreground">{{ placeholder }}</div>
      </template>
    </ClientOnly>
  </div>
</template>
