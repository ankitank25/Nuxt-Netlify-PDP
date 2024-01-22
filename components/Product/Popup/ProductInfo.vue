<script setup lang="ts">
import { type ProductInterface } from "@/types/product";

const props = defineProps({
  product: {
    type: Object as PropType<ProductInterface>,
    required: true,
  },
});

/** Method to get attribute value by code */
function getProductAttribute(attribute: string) {
  return props.product.attributes.findLast((attr) => attr.label === attribute)
    ?.value;
}
</script>
<template>
  <h2 class="text-2xl mb-4 hidden md:block">{{ product.name }}</h2>
  <h4 class="text-base mb-10 hidden md:block text-gray-500">
    Colour: {{ getProductAttribute("Colour") }}
  </h4>
</template>
