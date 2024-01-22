<script setup lang="ts">
import {
  type ProductMediaInterface,
  ProductThumbnailDisplayStyleType,
} from "@/types/product";

const props = defineProps({
  media: {
    type: Array as PropType<ProductMediaInterface[]>,
    required: true,
  },
  currentMediaIndex: {
    type: Number,
    default: 0,
  },
  productName: {
    type: String,
    required: true,
  },
  displayStyle: {
    type: String as PropType<ProductThumbnailDisplayStyleType>,
    default: ProductThumbnailDisplayStyleType.HORIZONTAL_SCROLL,
  },
});

const emit = defineEmits(["click"]);

const thumbnailRef = ref<HTMLElement>();
const thumbnailMediaRefs = ref<HTMLElement[]>([]);

/** Logic to scroll thumbnail slider based on selected index position */
function scrollThumbnails(index: number): void {
  if (
    props.displayStyle !== ProductThumbnailDisplayStyleType.GRID &&
    thumbnailMediaRefs.value[index] !== undefined
  ) {
    const thumbnailContainer = thumbnailRef.value as HTMLElement;
    const currentThumbnailRef = thumbnailMediaRefs.value[index] as HTMLElement;

    if (
      props.displayStyle === ProductThumbnailDisplayStyleType.HORIZONTAL_SCROLL
    ) {
      const scrollLeft =
        currentThumbnailRef.offsetLeft - thumbnailContainer.offsetWidth / 2;
      thumbnailContainer.scrollTo({ left: scrollLeft });
    }
  }
}

watch(
  () => props.currentMediaIndex,
  (newCurrentMediaIndex) => {
    scrollThumbnails(newCurrentMediaIndex);
  },
  { immediate: false },
);

/** Logic to switch media item */
function switchMedia(index: number): void {
  emit("click", index);
}
</script>
<template>
  <div
    class="thumbnails w-full pb-8 pt-0"
    :class="`displayStyle-${displayStyle}`"
  >
    <div
      ref="thumbnailRef"
      :class="[
        'thumbnail-slider hidden md:flex group-[.popup]:flex',
        displayStyle === ProductThumbnailDisplayStyleType.HORIZONTAL_SCROLL
          ? 'flex overflow-x-auto -m-1 p-1 flex-nowrap'
          : 'flex flex-wrap',
      ]"
    >
      <span
        v-for="(item, index) in media"
        :key="`media-item-thumb-${index}`"
        ref="thumbnailMediaRefs"
        :class="[
          `mr-2 thumbnail-span ${item.type} last:mr-0 cursor-pointer w-20 relative`,
          index === currentMediaIndex ? 'ring-offset ring ring-gray-500' : '',
          displayStyle === ProductThumbnailDisplayStyleType.HORIZONTAL_SCROLL
            ? 'flex-[0_0_auto]'
            : 'mb-2',
        ]"
        @click.prevent="switchMedia(index)"
      >
        <img
          :alt="productName"
          :src="item.thumb"
          class="thumbnail-img last:mr-0 cursor-pointer w-full"
        />
      </span>
    </div>
    <div
      class="thumbnail-dots md:hidden group-[.popup]:hidden flex gap-4 justify-center"
    >
      <span
        v-for="(item, index) in media"
        :key="`media-item-dot-${index}`"
        class="block md:hidden w-2.5 h-2.5"
        :class="[
          index === currentMediaIndex ? 'ring-orange-700' : 'ring-gray-500',
          index === currentMediaIndex && item.type === 'video'
            ? 'border-l-orange-700'
            : 'ring-gray-500',
          item.type === 'video'
            ? 'hidden -mt-0.5 border-t-[7px] border-t-transparent border-l-[9px] border-l-gray-500 border-b-[7px] border-b-transparent'
            : 'bg-gray-200 ring-2 ring-gray-500 rounded-full',
        ]"
        @click.prevent="switchMedia(index)"
      ></span>
    </div>
  </div>
</template>
<style scoped>
.thumbnail-slider {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.thumbnail-slider::-webkit-scrollbar {
  display: none;
}

.thumbnail-span.video::before {
  background: url("/images/play-circle.svg") no-repeat center center transparent;
  background-size: 50%;
  content: "";
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
