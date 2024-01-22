<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import type { ProductMediaInterface } from "@/types/product";

/** Variable to check mobile device */
const isMobileDevice = ref<boolean>(false);
const { width } = useWindowSize();

function checkIsMobile(): void {
  if (width.value < 768) {
    isMobileDevice.value = true;
  } else {
    isMobileDevice.value = false;
  }
}

const props = defineProps({
  media: {
    type: Array as PropType<ProductMediaInterface[]>,
    required: true,
  },
});

const emit = defineEmits(["prev", "next", "click"]);

/** Logic to set currently selected media item */
const currentMediaIndex = ref<number>(0);

/** Media items reactive var */
const mediaItems = ref<ProductMediaInterface[]>(props.media);

/** Logic to slide/switch image */
const carouselRef = ref<HTMLElement>();

function slideImage(index: number): void {
  const carousel = carouselRef.value as HTMLElement;
  carousel.style.transform = `translateX(-${carousel.clientWidth * index}px)`;
}

const back = ref<boolean>(false);

function prevImage(): void {
  back.value = true;
  const prevIndex = getNewIndex(currentMediaIndex.value - 1);
  slideImage(prevIndex);
  currentMediaIndex.value = prevIndex;
}

function nextImage(): void {
  back.value = false;
  const nextIndex = getNewIndex(currentMediaIndex.value + 1);
  slideImage(nextIndex);
  currentMediaIndex.value = nextIndex;
}

function switchImage(index: number): void {
  currentMediaIndex.value = index;
}

/** Logic to find next/previous image index */
function getNewIndex(index: number): number {
  checkIsMobile();
  if (mediaItems.value) {
    if (isMobileDevice.value === true) {
      mediaItems.value = mediaItems.value.filter((m) => m.type !== "video");
    }
    const itemCount = mediaItems.value.length;
    if (index < 0) {
      index = itemCount - 1;
    }
    if (index >= itemCount) {
      index = 0;
    }
    return index;
  }

  return 0;
}

/** Logic to render zoom lense/window */
const showZoomWindow = ref<boolean>(false);
const zoomLensWindowRef = ref<HTMLElement>();
const zoomLensRef = ref<HTMLElement>();
const mainImageRefs = ref<HTMLElement[]>([]);

function renderLens(event: MouseEvent): void {
  const mainImageElement = mainImageRefs.value[
    currentMediaIndex.value
  ] as HTMLElement;
  const lens = zoomLensRef.value as HTMLElement;
  const zoomElement = zoomLensWindowRef.value as HTMLElement;
  const mainImageRect = mainImageElement.getBoundingClientRect();

  const x: number = Math.ceil(
    ((event.clientX - mainImageRect.left) * 100) / mainImageElement.clientWidth,
  );
  const y: number = Math.ceil(
    ((event.clientY - mainImageRect.top) * 100) / mainImageElement.clientHeight,
  );

  zoomElement.style.backgroundPositionX = `${x}%`;
  zoomElement.style.backgroundPositionY = `${y}%`;

  let lensX: number = event.clientX - mainImageRect.left - lens.offsetWidth / 2;
  let lensY: number = event.clientY - mainImageRect.top - lens.offsetHeight / 2;

  if (lensX > mainImageRect.width - lens.offsetWidth) {
    lensX = mainImageRect.width - lens.offsetWidth;
  }
  if (lensX < 0) {
    lensX = 0;
  }
  if (lensY > mainImageRect.height - lens.offsetHeight) {
    lensY = mainImageRect.height - lens.offsetHeight;
  }
  if (lensY < 0) {
    lensY = 0;
  }

  lens.style.left = `${lensX}px`;
  lens.style.top = `${lensY}px`;
}

/** Logic to get currently selected media item */
const getCurrentImage = computed(() => {
  return mediaItems.value[currentMediaIndex.value];
});

watch(
  () => {
    return { currentIndex: currentMediaIndex.value, isMobileDevice };
  },
  (newValues) => {
    slideImage(newValues.currentIndex);
  },
  { immediate: false },
);
</script>
<template>
  <div>
    <div class="product-base-image py-8 relative">
      <a
        href="#"
        class="absolute -left-7 top-1/2 z-30"
        @click.prevent="prevImage"
      >
        <ChevronLeftIcon size="1.5x" class="custom-class" />
      </a>
      <a
        href="#"
        class="absolute -right-7 top-1/2 z-30"
        @click.prevent="nextImage"
      >
        <ChevronRightIcon size="1.5x" class="custom-class" />
      </a>
      <div
        v-touch:swipe.left="nextImage"
        v-touch:swipe.right="prevImage"
        class="carousel-container relative group select-none"
        @touchmove="showZoomWindow = false"
        @touchstart="showZoomWindow = false"
        @mousemove="renderLens"
        @mouseleave="showZoomWindow = false"
        @mouseenter="showZoomWindow = true"
        @click="
          showZoomWindow = false;
          emit('click', mediaItems[currentMediaIndex].id);
        "
      >
        <div ref="carouselRef" class="carousel">
          <span
            v-for="({ standard, type }, index) in mediaItems"
            :key="index"
            ref="mainImageRefs"
            :class="[
              `flex-[0_0_auto] basis-full relative carousel-span ${type} cursor-pointer`,
            ]"
          >
            <img
              :src="standard"
              alt=""
              :class="[`slide slide-item-type-${type}`]"
            />
          </span>
        </div>
        <span
          ref="zoomLensRef"
          class="img-zoom-lens absolute border-2 bg-gray-500/10 border-gray-500 w-10 h-10 z-20 hidden invisible group-hover:visible"
          :class="[getCurrentImage.type == 'video' ? 'hidden' : 'md:block']"
        ></span>
      </div>
      <Transition>
        <div
          v-show="showZoomWindow && getCurrentImage.type != 'video'"
          ref="zoomLensWindowRef"
          class="absolute zoomWindow bg-gray-600 bg-no-repeat border border-gray-500 z-50 hidden md:block top-0"
          :style="{
            'background-image': `url(${getCurrentImage.large})`,
          }"
        ></div>
      </Transition>
    </div>
    <ProductThumbnails
      :media="mediaItems"
      :current-media-index="currentMediaIndex"
      product-name="Test"
      @click="switchImage"
    />
  </div>
</template>
<style scoped>
.zoomWindow {
  width: 700px;
  height: 700px;
  left: calc(100% + 33px);
}

.carousel-container {
  position: relative;
  overflow: hidden;
}

.carousel {
  display: flex;
  max-width: 1000px;
  transition: transform 0.5s ease-in-out;
  gap: 0px;
}

.carousel-image {
  -webkit-box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.5);
}

.carousel-span.video::before {
  background: url("/images/play-circle.svg") no-repeat center center transparent;
  background-size: 90px;
  content: "";
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
