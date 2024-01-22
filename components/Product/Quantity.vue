<script setup lang="ts">
const quantity = ref<number>(1);

/** Increase Qty method */
function increaseQty(): void {
  if (quantity.value < 10) quantity.value++;
}

/** Decrease Qty method */
function decreaseQty(): void {
  if (quantity.value > 1) quantity.value--;
}
</script>
<template>
  <div>
    <button class="text-4xl align-middle" @click.prevent="decreaseQty">
      -
    </button>
    <input
      type="number"
      min="1"
      max="10"
      class="w-16 p-2 mx-4 align-middle bg-gray-300"
      :value="quantity"
    />
    <button class="text-4xl align-middle" @click.prevent="increaseQty">
      +
    </button>
  </div>
</template>
