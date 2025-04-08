<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, nextTick } from 'vue'; // Added nextTick

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
    // Remove currency symbol and commas before parsing
    const cleanString = typeof val === 'string'
        ? val.replace(displaySymbol, '').replace(/,/g, '')
        : String(val);
    const num = parseFloat(cleanString);
    return isNaN(num) ? null : num;
};


// Initialize internalValue from modelValue
const syncFromModel = (modelVal: number | string | null) => {
    const num = parseValue(modelVal);
    // Store the raw numeric string without formatting
    internalValue.value = num === null ? '' : String(num);
};

watch(() => props.modelValue, (newValue, oldValue) => {
    const newNum = parseValue(newValue);
    const internalNum = parseValue(internalValue.value);

    // Only sync from model if not focused OR if the external value
    // is significantly different from the current internal numeric value.
    // This prevents minor formatting differences during typing from resetting the input.
    if (!isFocused.value || newNum !== internalNum) {
        syncFromModel(newValue);
    }
}, { immediate: true });


// Format number with commas for display when not focused
const formattedDisplayValue = computed(() => {
  if (!internalValue.value && internalValue.value !== '0') return ''; // Handle empty string correctly
  const num = parseFloat(internalValue.value); // Use the raw internal value
  if (isNaN(num)) return internalValue.value; // Show raw value if somehow invalid (shouldn't happen often)

  // Allow up to 2 decimal places for budget
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
});

// The value shown in the input depends on focus state
const displayValue = computed(() => {
    if (isFocused.value) {
        return internalValue.value; // Show raw number string when editing
    } else {
        // When not focused, show formatted value OR empty if internalValue is empty
        return internalValue.value === '' ? '' : formattedDisplayValue.value;
    }
});

// --- Event Handlers ---

const handleFocus = () => {
  isFocused.value = true;
  // When focusing, ensure the input shows the raw internal numeric string
  // Use nextTick to ensure the input value is updated *after* focus state changes displayValue
  nextTick(() => {
      if (inputRef.value) {
         inputRef.value.value = internalValue.value;
         // Optional: Select text on focus
         // inputRef.value.select();
      }
  });
};

const handleBlur = () => {
  isFocused.value = false;
  // Final validation and emit on blur
  let valueToEmit: number | null = null;
  let finalNumericValue : number | null = null;

  if (internalValue.value !== '') {
      let numericValue = parseFloat(internalValue.value);
      if (!isNaN(numericValue)) {
         // Enforce min/max strictly on blur
         if (numericValue < effectiveMin) numericValue = effectiveMin;
         if (numericValue > effectiveMax) numericValue = effectiveMax;

          // Round to 2 decimal places if necessary before emitting
         finalNumericValue = parseFloat(numericValue.toFixed(2));
         valueToEmit = finalNumericValue;

      } else {
          // If invalid content somehow remains, clear it or revert
           valueToEmit = null; // Clear if invalid
           finalNumericValue = null;
      }
  } // else valueToEmit remains null

  // Update internal value to the cleaned/constrained numeric string *without* formatting
  internalValue.value = finalNumericValue === null ? '' : String(finalNumericValue);

  // Emit only if the final validated numeric value differs from the current modelValue's parsed number
  const currentModelNum = parseValue(props.modelValue);
   // Compare numeric values directly, handling nulls
  if (currentModelNum !== valueToEmit) {
     emit('update:modelValue', valueToEmit);
  }

  // Force update the input display to the formatted value AFTER blur logic
  // Needed if the value was clamped or changed during blur validation.
  if (inputRef.value) {
      inputRef.value.value = displayValue.value; // Use computed displayValue for formatting
  }
};


// Prevent invalid characters on keydown (mostly allows standard input flow)
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement;
  const value = target.value; // Use current input value
  const key = event.key;

  // Allow: Backspace, Delete, Tab, Escape, Enter, Home, End, Arrow Keys
  if ([
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ].includes(key)) {
    return;
  }

  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X (Cmd on Mac)
  if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(key.toLowerCase())) {
    return;
  }

  // Allow digits
  if (/^\d$/.test(key)) {
       // Basic check against max value - prevent typing numbers obviously too large
       // More precise check happens in handleInput
       const potentialValue = value.slice(0, target.selectionStart ?? 0) + key + value.slice(target.selectionEnd ?? 0);
       const approxNumValue = parseFloat(potentialValue.replace(/,/g, '')); // Quick check
       if (!isNaN(approxNumValue) && approxNumValue > effectiveMax * 1.1) { // Allow slight over typing before blocking
           event.preventDefault();
           return;
       }
      return; // Allow digit
  }

  // Allow decimal point only if one doesn't already exist
  if (key === '.' && !value.includes('.')) {
    // Prevent leading decimal if desired (e.g., force '0.')
    // if (value === '' || target.selectionStart === 0) {
    //   target.value = '0.';
    //   internalValue.value = '0.'; // Sync internal state
    //   event.preventDefault(); // Prevent the original '.' insertion
    //   return;
    // }
    return; // Allow decimal point
  }

  // Prevent all other keys
  event.preventDefault();
};


// Handle input event for cleaning, basic validation, and emitting
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  const start = target.selectionStart; // Store cursor position

  // 1. Clean the input string: Allow only digits and one decimal point
  let numericString = value.replace(/[^\d.]/g, '');
  const parts = numericString.split('.');
  if (parts.length > 2) { // More than one decimal point? Keep only the first.
    numericString = parts[0] + '.' + parts.slice(1).join('');
  }
  // Optional: Limit decimal places during typing (e.g., to 2)
   if (parts[1] && parts[1].length > 2) {
       numericString = parts[0] + '.' + parts[1].substring(0, 2);
   }

  // 2. Update internal state *directly* with the cleaned string
  internalValue.value = numericString;

  // 3. Parse the cleaned string and prepare value to emit
  let valueToEmit: number | null = null;
  if (numericString === '') {
      valueToEmit = null; // Emit null if empty
  } else {
      const potentialNum = parseFloat(numericString);
      if (!isNaN(potentialNum)) {
          // Check against MAX - If exceeding max, cap the internal value and emit max.
          if (potentialNum > effectiveMax) {
              internalValue.value = String(effectiveMax); // Cap internal value
              valueToEmit = effectiveMax;              // Emit max value
              numericString = String(effectiveMax);     // Use capped string for display sync below
          } else {
              valueToEmit = potentialNum; // Emit the current valid number (could be below min temporarily)
          }
      } else {
          // If somehow still invalid after cleaning (e.g., just ".")
           // Treat as empty for emission purposes, but keep internalValue as is for typing continuity
           // internalValue.value = numericString; // Keep "." if user typed it
           valueToEmit = null; // Don't emit an invalid number
      }
  }

  // 4. Synchronize the input display IF IT CHANGED due to cleaning or capping
  // Use nextTick to avoid interfering with ongoing input composition
  nextTick(() => {
      if (target.value !== numericString) {
          target.value = numericString; // Update display to cleaned/capped value

          // Restore cursor position carefully
          if(start !== null) {
              // Calculate expected new cursor position based on length change
              const newLength = numericString.length;
              const oldLength = value.length; // Original value before cleaning
              let newPos = start + (newLength - oldLength);

              // Simple boundary checks for the new position
               newPos = Math.max(0, Math.min(newLength, newPos));

               // Attempt to set selection range
               try {
                   target.setSelectionRange(newPos, newPos);
               } catch (e) {
                   console.error("Error setting selection range:", e);
               }
          }
      }
  });


  // 5. Emit the potential numeric value (or null) if it differs from the *parsed* modelValue
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
        type="text" inputmode="decimal"
        :value="displayValue" @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="props.placeholder || '0'"
        class="component-input pl-8"
        :required="props.required"
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
