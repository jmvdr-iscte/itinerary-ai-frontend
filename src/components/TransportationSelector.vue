<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modelValue: string[];
  options: Array<{ value: string; label: string; icon: string }>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const toggleOption = (option: string) => {
  const currentValue = [...props.modelValue];
  const index = currentValue.indexOf(option);

  if (index === -1) {
    currentValue.push(option);
  } else {
    currentValue.splice(index, 1);
  }

  emit('update:modelValue', currentValue);
};

const isSelected = (option: string) => {
  return props.modelValue.includes(option);
};
</script>

<template>
  <div class="transportation-selector">
    <label class="block text-gray-300 font-medium mb-2">Transportation</label>
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="option in options"
        :key="option.value"
        @click="toggleOption(option.value)"
        :class="[
          'flex items-center p-3 rounded-xl border cursor-pointer transition-all',
          isSelected(option.value)
            ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20'
            : 'bg-[#0F1629] border-gray-700 text-gray-400 hover:border-gray-500'
        ]"
      >
        <span class="text-xl mr-2">{{ option.icon }}</span>
        <span>{{ option.label }}</span>
        <span v-if="isSelected(option.value)" class="ml-auto text-[#8B5CF6]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
    <p class="text-xs text-gray-400 mb-2">
        <span class="text-purple-400">*</span> Enter the transportation options you prefer. You can select multiple options.
    </p>
  </div>
</template>

<style scoped>
.transportation-selector .grid > div {
  position: relative;
  overflow: hidden;
}

.transportation-selector .grid > div::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.transportation-selector .grid > div:hover::before {
  opacity: 1;
}
</style>
