<template>
  <div class="min-h-screen bg-neutral-light pb-20">
    <GlassNav :notificationCount="0" />

    <main class="page-container py-6">
      <div class="flex items-center mb-6 slide-up">
        <button @click="goBack" class="p-2 -ml-2 text-gray-600">
          <i class="fa fa-arrow-left"></i>
        </button>
        <h1 class="text-xl font-bold flex-1 text-center pr-10">{{ isEditing ? '编辑植物' : '添加新植物' }}</h1>
      </div>

      <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="top" class="slide-up" style="animation-delay: 0.1s">
        <div class="bg-white rounded-2xl p-4 card-shadow mb-6">
          <div class="space-y-4">
            <n-form-item label="植物名称" path="name">
              <n-input v-model:value="formValue.name" placeholder="请输入植物名称，如：绿萝" />
            </n-form-item>

            <n-form-item label="植物种类" path="type">
              <n-select v-model:value="formValue.type" :options="plantTypeOptions as any" placeholder="选择种类" />
            </n-form-item>

            <n-form-item label="浇水周期（天）" path="wateringCycle">
              <n-input-number v-model:value="formValue.wateringCycle" :min="1" :max="30" />
            </n-form-item>

            <n-form-item label="光照需求" path="lightRequirement">
              <n-select v-model:value="formValue.lightRequirement" :options="lightLevelOptions as any" />
            </n-form-item>

            <n-form-item label="植物照片">
              <div
                class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                @click="triggerFileInput"
              >
                <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileChange" />
                <div v-if="previewUrl" class="relative">
                  <img :src="previewUrl" class="w-24 h-24 object-cover rounded-lg mx-auto" />
                  <button @click.stop="removePhoto" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    <i class="fa fa-times text-xs"></i>
                  </button>
                </div>
                <div v-else>
                  <i class="fa fa-camera text-3xl text-gray-400 mb-2"></i>
                  <p class="text-sm text-gray-600">点击上传照片或拍照</p>
                </div>
              </div>
            </n-form-item>
          </div>
        </div>

        <n-form-item label="备注">
          <n-input v-model:value="formValue.notes" type="textarea" placeholder="添加备注信息..." :rows="3" />
        </n-form-item>

        <n-button
          type="primary"
          block
          size="large"
          :loading="submitting"
          @click="handleSubmit"
          class="mt-6"
        >
          {{ isEditing ? '保存修改' : '添加植物' }}
        </n-button>
      </n-form>
    </main>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, useMessage, type FormRules } from 'naive-ui'
import GlassNav from '@/components/GlassNav.vue'
import BottomNav from '@/components/BottomNav.vue'
import { usePlantsStore } from '@/stores/plants'
import { saveImage } from '@/composables/useIndexedDB'
import { PLANT_TYPES, LIGHT_LEVELS } from '@/types'
import type { Plant } from '@/types'

const route = useRoute()
const router = useRouter()
const plantsStore = usePlantsStore()
const message = useMessage()

const isEditing = computed(() => route.name === 'edit-plant')
const plantId = computed(() => route.params.id as string)

const formRef = ref()
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const submitting = ref(false)

const formValue = reactive({
  name: '',
  type: 'leaf' as Plant['type'],
  wateringCycle: 7,
  lightRequirement: 'medium' as Plant['lightRequirement'],
  notes: '',
  photoKey: undefined as string | undefined
})

const plantTypeOptions = PLANT_TYPES
const lightLevelOptions = LIGHT_LEVELS

const rules: FormRules = {
  name: { required: true, message: '请输入植物名称', trigger: 'blur' },
  type: { required: true, message: '请选择植物种类', trigger: 'change' },
  wateringCycle: { required: true, type: 'number', message: '请输入浇水周期', trigger: 'blur' },
  lightRequirement: { required: true, message: '请选择光照需求', trigger: 'change' }
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    message.warning('图片大小不能超过 2MB')
    return
  }

  photoFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function removePhoto() {
  previewUrl.value = null
  photoFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    let photoKey: string | undefined

    if (photoFile.value) {
      photoKey = `plant-${Date.now()}`
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(photoFile.value!)
      })
      await saveImage(photoKey, base64)
    }

    const today = new Date()
    const nextWatering = new Date(today)
    nextWatering.setDate(today.getDate() + formValue.wateringCycle)

    const plantData = {
      name: formValue.name,
      type: formValue.type,
      wateringCycle: formValue.wateringCycle,
      lightRequirement: formValue.lightRequirement,
      healthStatus: 'good' as const,
      lastWatered: today.toISOString().split('T')[0],
      nextWatering: nextWatering.toISOString().split('T')[0],
      notes: formValue.notes,
      photoKey
    }

    if (isEditing.value && plantId.value) {
      plantsStore.updatePlant(plantId.value, plantData)
      message.success('植物信息已更新')
    } else {
      plantsStore.addPlant(plantData)
      message.success('植物添加成功！')
    }

    router.push({ name: 'home' })
  } catch (error) {
    console.error(error)
    message.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(() => {
  if (isEditing.value) {
    const plant = plantsStore.getPlantById(plantId.value)
    if (plant) {
      formValue.name = plant.name
      formValue.type = plant.type
      formValue.wateringCycle = plant.wateringCycle
      formValue.lightRequirement = plant.lightRequirement
      formValue.notes = plant.notes
      formValue.photoKey = plant.photoKey
    }
  }
})
</script>
