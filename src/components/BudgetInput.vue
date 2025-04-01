<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance } from 'vue';

const props = defineProps<{
  modelValue: number | string | null; // Allow null
  min?: number;
  max?: number;
  label?: string; // Added
  placeholder?: string; // Added
  required?: boolean; // Added
  currencySymbol?: string; // Added
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void; // Emit number or null
}>();

// Get unique component instance ID for aria attributes
const instance = getCurrentInstance();
const _uid = instance?.uid;

// Default min/max/symbol
const effectiveMin = props.min ?? 0;
const effectiveMax = props.max ?? 1000000;
const displaySymbol = props.currencySymbol || '$'; // Default to $

// Internal state
const internalValue = ref<string>(''); // Stores the raw numeric string for editing
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// Helper to parse value safely
const parseValue = (val: number | string | null): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val; // Remove commas before parsing
    return isNaN(num) ? null : num;
};

// Initialize internalValue from modelValue
const syncFromModel = (modelVal: number | string | null) => {
    const num = parseValue(modelVal);
    internalValue.value = num === null ? '' : String(num);
};

watch(() => props.modelValue, (newValue) => {
    // Avoid disrupting typing if focused, unless modelValue becomes drastically different
    if (!isFocused.value) {
        syncFromModel(newValue);
    } else {
        // If focused, check if external value differs significantly from internal
        const currentInternalNum = parseValue(internalValue.value);
        const newModelNum = parseValue(newValue);
        if (currentInternalNum !== newModelNum) {
             syncFromModel(newValue);
        }
    }
}, { immediate: true });


// Format number with commas for display when not focused
const formattedDisplayValue = computed(() => {
  if (internalValue.value === '') return '';
  const num = parseFloat(internalValue.value); // Use the raw internal value
  if (isNaN(num)) return internalValue.value; // Show raw value if somehow invalid
  // Allow up to 2 decimal places for budget
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

// The value shown in the input depends on focus state
const displayValue = computed(() => {
    return isFocused.value ? internalValue.value : formattedDisplayValue.value;
});

// --- Event Handlers ---

const handleFocus = () => {
  isFocused.value = true;
  // Optional: Select all text on focus for easier replacement
  // nextTick(() => inputRef.value?.select());
};

const handleBlur = () => {
  isFocused.value = false;
  // Final validation and emit on blur
  let valueToEmit: number | null = null;
  if (internalValue.value !== '') {
      let numericValue = parseFloat(internalValue.value);
      if (!isNaN(numericValue)) {
         // Enforce min/max strictly on blur
         if (numericValue < effectiveMin) numericValue = effectiveMin;
         if (numericValue > effectiveMax) numericValue = effectiveMax;
         valueToEmit = numericValue;
      } else {
          // If invalid content somehow remains, revert or clear
          valueToEmit = parseValue(props.modelValue); // Revert to last valid modelValue
      }
  } // else valueToEmit remains null

  // Update internal value to the cleaned numeric string
  internalValue.value = valueToEmit === null ? '' : String(valueToEmit);

  // Emit only if the validated numeric value differs from the current modelValue
  const currentModelNum = parseValue(props.modelValue);
  if (currentModelNum !== valueToEmit) {
     emit('update:modelValue', valueToEmit);
  }
};


// Prevent invalid characters on keydown
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;
  const value = target.value; // Use target.value as internalValue might not be updated yet
  const selectionStart = target.selectionStart ?? 0;
  const selectionEnd = target.selectionEnd ?? 0;
  const key = event.key;

  // Allow navigation, modification, and copy/paste keys
  if (event.ctrlKey || event.metaKey ||
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete',
       'Tab', 'Escape', 'Enter', 'Home', 'End', 'a', 'c', 'v', 'x', 'z', 'y'].includes(key.toLowerCase())) {
    return;
  }

  // Allow digits
  if (/^\d$/.test(key)) {
      // Check max length before allowing digit (e.g., 7 digits for integer part)
      const potentialValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd);
      const parts = potentialValue.split('.');
      if (parts[0] && parts[0].length > 7) { // Limit integer part length (adjust if needed)
          console.warn(`Max integer length reached`);
          event.preventDefault();
          return;
      }
      // Check if adding digit would exceed max value (approximate check)
      const approxNumValue = parseFloat(potentialValue.replace(/,/g, '')); // Quick check without full parsing
      if (!isNaN(approxNumValue) && approxNumValue > effectiveMax) {
          // If adding the digit makes it exceed max, potentially just set to max?
          // Or prevent if it's already at max and trying to add more.
          const currentNum = parseFloat(value.replace(/,/g, ''));
           if (!isNaN(currentNum) && currentNum >= effectiveMax){
                event.preventDefault(); // Prevent adding digit if already at max
                return;
           }
           // Allow if it brings it *up to* max, handleInput will cap it.
      }
      return; // Allow digit
  }

  // Allow decimal point if not already present
  if (key === '.' && !value.includes('.')) {
    return; // Allow decimal point
  }

  // Prevent all other keys
  event.preventDefault();
};

// Handle input event for validation and emitting
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  // Store cursor position
  const start = target.selectionStart;

  // Basic filtering: Allow only digits and one decimal point
  let numericString = value.replace(/[^\d.]/g, '');
  const parts = numericString.split('.');
  if (parts.length > 2) { // More than one decimal point
    numericString = parts[0] + '.' + parts.slice(1).join('');
  }
   // Limit decimal places (e.g., to 2) - optional, could do on blur instead
   if (parts[1] && parts[1].length > 2) {
       numericString = parts[0] + '.' + parts[1].substring(0, 2);
   }


  // Limit integer part length
  const integerPart = numericString.split('.')[0];
  if (integerPart && integerPart.length > 7) {
      const decimalPart = numericString.split('.')[1];
      numericString = integerPart.substring(0, 7) + (decimalPart !== undefined ? '.' + decimalPart : '');
  }


  let numericValue: number | null = null;
  let valueToEmit: number | null = null;

  if (numericString === '') {
      internalValue.value = '';
      valueToEmit = null;
  } else {
      numericValue = parseFloat(numericString);
      if (!isNaN(numericValue)) {
         // Apply min/max constraints
         if (numericValue < effectiveMin) numericValue = effectiveMin;
         if (numericValue > effectiveMax) numericValue = effectiveMax;
         valueToEmit = numericValue;
         internalValue.value = String(numericValue); // Update internal state with validated number string
      } else {
          // Should not happen often due to filtering, but handle just in case
          internalValue.value = ''; // Clear if invalid remains
          valueToEmit = null;
      }
  }


  // Ensure the input visually reflects the cleaned/capped value immediately
  // This is crucial if capping at max/min happened.
  const displaySyncValue = internalValue.value; // Use the cleaned internal value
  if (target.value !== displaySyncValue) {
      target.value = displaySyncValue;
      // Restore cursor position if possible (can be tricky)
      if(start !== null) {
          // Simple cursor restoration (might be off if length changed significantly)
          const diff = target.value.length - value.length;
          const newPos = Math.max(0, Math.min(target.value.length, start + diff));
          target.setSelectionRange(newPos, newPos);
      }
  }

  // Emit the validated numeric value (or null) if it differs from modelValue
  const currentModelNum = parseValue(props.modelValue);
   if (currentModelNum !== valueToEmit) {
      emit('update:modelValue', valueToEmit);
   }
};

// Formatted Max value for helper text
const formattedMax = computed(() => {
    return effectiveMax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
});

</script>

<template>
  <div>
    <label v-if="props.label" :for="`budget-input-${_uid}`" class="block text-sm font-medium text-gray-300 mb-1.5">
      {{ props.label }}
      <span v-if="props.required" class="text-red-400">*</span>
    </label>

    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <span class="text-gray-400">{{ displaySymbol }}</span>
      </div>

      <input
        :id="`budget-input-${_uid}`"
        ref="inputRef"
        type="text"
        inputmode="decimal" :value="displayValue" @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="props.placeholder || '0'"
        class="component-input pl-8" :required="props.required"
        :aria-describedby="`budget-hint-${_uid}`"
        aria-label="Budget amount input"
        autocomplete="off"
      />
      </div>

    <p :id="`budget-hint-${_uid}`" class="mt-1 text-xs text-gray-400">
       Enter total trip budget (Max: {{ displaySymbol }}{{ formattedMax }})
    </p>
  </div>
</template>

<style scoped>
/* Standard Input Style */
.component-input {
  @apply block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 transition duration-200 ease-in-out;
  @apply focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40;
}
.component-input:disabled {
    @apply opacity-60 cursor-not-allowed bg-white/10;
}

/* Adjust left padding for currency symbol */
.component-input.pl-8 {
    padding-left: 2rem; /* 32px - adjust if symbol width varies */
}

/* Optional: Style for placeholder */
.component-input::placeholder {
    @apply text-gray-500;
}
</style>
