<template>
  <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑养护记录' : '添加养护记录'" style="max-width: 400px; margin: 16px">
    <div class="space-y-4">
      <n-form-item label="养护类型" path="type">
        <n-select v-model:value="formValue.type" :options="recordTypeOptions" placeholder="选择养护类型" />
      </n-form-item>

      <n-form-item label="健康度评分">
        <div class="flex items-center space-x-4 w-4/5">
          <n-slider v-model:value="formValue.healthScore" :min="1" :max="10" :step="1" />
          <span class="text-sm text-gray-600 w-10 text-center">{{ formValue.healthScore }}分</span>
        </div>
      </n-form-item>

      <n-form-item label="光照强度 (%)">
        <div class="flex items-center space-x-4 w-4/5">
          <n-slider v-model:value="formValue.lightLevel" :min="0" :max="100" :step="10" />
          <span class="text-sm text-gray-600 w-10 text-center">{{ formValue.lightLevel }}%</span>
        </div>
      </n-form-item>

      <n-form-item label="备注">
        <n-input v-model:value="formValue.notes" type="textarea" placeholder="添加备注信息..." :rows="2" />
      </n-form-item>

      <n-form-item label="图片">
        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="(img, index) in previewUrls"
            :key="index"
            class="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              @click="removeImage(index)"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>
          <div
            v-if="previewUrls.length < 6"
            @click="triggerFileInput"
            class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
          >
            <i class="fa fa-plus text-gray-400"></i>
          </div>
        </div>
        <input type="file" ref="fileInputRef" accept="image/*" multiple class="hidden" @change="handleFileChange" />
      </n-form-item>
    </div>

    <template #footer>
      <div class="flex space-x-3">
        <n-button @click="showModal = false" class="flex-1">取消</n-button>
        <n-button type="primary" @click="handleSubmit" class="flex-1" :loading="submitting">保存</n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NModal, NFormItem, NInput, NSelect, NSlider, NButton, useMessage } from 'naive-ui'
import { RECORD_TYPES, type RecordType, type CareRecord } from '@/types'
import { saveImages } from '@/composables/useIndexedDB'

const props = defineProps<{
  visible: boolean
  plantId: string
  editRecord?: CareRecord | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success', data: {
    type: RecordType
    healthScore: number
    lightLevel: number
    notes: string
    images: string[]
  }): void
}>()

const message = useMessage()

const showModal = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.editRecord)

const fileInputRef = ref<HTMLInputElement | null>(null)
const submitting = ref(false)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const originalImageKeys = ref<string[]>([])

const recordTypeOptions = RECORD_TYPES.map(rt => ({
  label: rt.label,
  value: rt.value
}))

const formValue = ref({
  type: 'watering' as RecordType,
  healthScore: 7,
  lightLevel: 50,
  notes: ''
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.editRecord) {
      formValue.value = {
        type: props.editRecord.type,
        healthScore: props.editRecord.healthScore,
        lightLevel: props.editRecord.lightLevel,
        notes: props.editRecord.notes
      }
      originalImageKeys.value = props.editRecord.images || []
      previewUrls.value = []
    } else {
      resetForm()
    }
  }
})

function resetForm() {
  formValue.value = {
    type: 'watering',
    healthScore: 7,
    lightLevel: 50,
    notes: ''
  }
  selectedFiles.value = []
  previewUrls.value = []
  originalImageKeys.value = []
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  for (let i = 0; i < files.length && previewUrls.value.length < 6; i++) {
    const file = files[i]
    if (file.size > 2 * 1024 * 1024) {
      message.warning('图片大小不能超过 2MB')
      continue
    }
    selectedFiles.value.push(file)
    previewUrls.value.push(URL.createObjectURL(file))
  }

  target.value = ''
}

function removeImage(index: number) {
  if (index < originalImageKeys.value.length) {
    originalImageKeys.value.splice(index, 1)
  } else {
    const fileIndex = index - originalImageKeys.value.length
    selectedFiles.value.splice(fileIndex, 1)
    URL.revokeObjectURL(previewUrls.value[index])
    previewUrls.value.splice(index, 1)
  }
}

async function handleSubmit() {
  submitting.value = true

  try {
    let allImageKeys = [...originalImageKeys.value]

    if (selectedFiles.value.length > 0) {
      const base64List: string[] = []
      for (const file of selectedFiles.value) {
        const base64 = await fileToBase64(file)
        base64List.push(base64)
      }
      const newKeys = await saveImages(base64List)
      allImageKeys = [...allImageKeys, ...newKeys]
    }

    emit('success', {
      type: formValue.value.type,
      healthScore: formValue.value.healthScore,
      lightLevel: formValue.value.lightLevel,
      notes: formValue.value.notes,
      images: allImageKeys
    })

    showModal.value = false
    message.success(isEdit.value ? '记录已更新' : '记录已添加')
  } catch (error) {
    console.error(error)
    message.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
</script>
