<script setup lang="ts">
import {
  type ProductInterface,
  type ProductMediaInterface,
} from "../types/product";

import productData from "../static/product.json";

/** reactive product data */
const product = ref<ProductInterface>(productData as ProductInterface);

/** reactive variable to toggle popup */
const openPopup = ref<boolean>(false);

/** reactive variable to set currently selected media id */
const currentImageId = ref<number>(0);

/** Product media items */
const mediaItems = ref<ProductMediaInterface[]>(product.value.media);

/** Watch open popup variable to add and remove overflow hidden to body */
watch(openPopup, (newValue) => {
  if (newValue) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
});

/** Open popup */
const openPopupWindow = (id: number) => {
  currentImageId.value = id;
  openPopup.value = true;
};
</script>
<template>
  <div class="pdp relative">
    <div class="grid md:grid-cols-5 gap-0 md:gap-4">
      <div class="col-span-3 xl:mr-20">
        <div
          v-if="mediaItems.length"
          class="w-full bg-white flex flex-col px-8"
        >
          <ProductImage
            :media="mediaItems"
            :product-name="product.name"
            @click="openPopupWindow"
          />
        </div>
      </div>
      <div class="col-span-5 md:col-span-2 mt-10 md:mt-0 pt-2">
        <h4 class="text-gray-500 uppercase mb-2">{{ product.brand }}</h4>
        <h1 class="mb-4 font-normal text-2xl">{{ product.name }}</h1>
        <div class="text-xl font-medium border-b border-gray-400 pb-3 mb-3">
          {{ product.price }}
        </div>
        <ProductAttributes
          v-if="product.attributes"
          :attributes="product.attributes"
        />
        <ProductQuantity />
      </div>
    </div>
    <Transition name="slide">
      <ProductPopup
        v-if="openPopup"
        :product="product"
        :current-media-id="currentImageId"
        @close="openPopup = false"
      />
    </Transition>
  </div>
</template>
<style scoped>
/** Image Popup slide transition **/
.slide-leave-active,
.slide-enter-active {
  transition: 0.2s;
}
.slide-enter-from {
  transform: translate(0, -100%);
}
.slide-leave-to {
  transform: translate(0, -120%);
}
</style>
