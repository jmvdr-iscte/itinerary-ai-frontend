<template>
	<input
		ref="inputRef"
		type="text"
		@input="handleInput"
		class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		placeholder="Enter destination (City, Country)"
	/>
</template>

<script lang="ts">
//TODO FIx colering
import { defineComponent, ref, onMounted, watch } from 'vue';

interface AddressComponents {
	long_name: string;
	short_name: string;
	types: string[];
}

export default defineComponent({
	name: 'DestinationInput',
	props: {
		modelValue: {
			type: String,
			required: true,
		},
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		const inputRef = ref<HTMLInputElement | null>(null);
		let autocomplete: google.maps.places.Autocomplete | null = null;
		const inputValue = ref(props.modelValue);

		const loadGoogleMapsScript = (): Promise<void> => {
			return new Promise((resolve, reject) => {
				if (window.google?.maps?.places) {
					resolve();
					return;
				}

				const script = document.createElement('script');
				script.src = `https://maps.googleapis.com/maps/api/js?key=${
					import.meta.env.VITE_GOOGLE_MAPS_API_KEY
				}&libraries=places`;
				script.async = true;
				script.defer = true;
				script.onload = () => resolve();
				script.onerror = (error) => reject(error);
				document.head.appendChild(script);
			});
		};

		const getAddressComponent = (
			components: AddressComponents[],
			type: string
		): string => {
			const component = components.find((c) => c.types.includes(type));
			return component?.long_name || '';
		};

		const formatAddress = (place: google.maps.places.PlaceResult): string => {
			const components = place.address_components || [];
			const city = getAddressComponent(components, 'locality');
			const state = getAddressComponent(components, 'administrative_area_level_1');
			const country = getAddressComponent(components, 'country');

			if (!city && !country) return place.name || '';

			let formatted = city;
			if (state) formatted += `, ${state}`;
			formatted += `, ${country}`;

			return formatted;
		};

		const initializeAutocomplete = () => {
			if (inputRef.value) {
				autocomplete = new google.maps.places.Autocomplete(inputRef.value, {
					types: ['(cities)'],
					fields: ['address_components', 'name'],
				});

				autocomplete.addListener('place_changed', () => {
					const place = autocomplete?.getPlace();
					if (place && place.address_components) {
						const formatted = formatAddress(place);
						inputRef.value!.value = formatted;
						emit('update:modelValue', formatted);
					}
				});
			}
		};

		const handleInput = (event: Event) => {
			const value = (event.target as HTMLInputElement).value;
			inputValue.value = value;
			emit('update:modelValue', value);
		};

		watch(() => props.modelValue, (newVal) => {
			if (inputRef.value && newVal !== inputRef.value.value) {
				inputRef.value.value = newVal;
			}
		});

		onMounted(async () => {
			await loadGoogleMapsScript();
			initializeAutocomplete();
			if (inputRef.value) {
				inputRef.value.value = props.modelValue;
			}
		});

		return {
			inputRef,
			handleInput,
		};
	},
});
</script>
