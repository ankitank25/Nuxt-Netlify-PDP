<script setup lang="ts">
import type { PropType } from "vue";
import { type ProductAttributeInterface } from "../../types/product";
defineProps({
  // eslint-disable-next-line vue/require-default-prop
  attributes: {
    type: Array as PropType<ProductAttributeInterface[]>,
    require: true,
  },
});
</script>
<template>
  <ul class="border-b border-gray-400 pb-3 mb-3">
    <li
      v-for="({ label, value }, ai) in attributes"
      :key="ai"
      class="text-sm mb-6"
    >
      <span class="font-semibold inline-block">{{ label }}:</span> {{ value }}
    </li>
  </ul>
</template>
