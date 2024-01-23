<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import {
  type ProductPopupTabInterface,
  type ProductInterface,
  type ProductMediaInterface,
  ProductThumbnailDisplayStyleType,
} from "@/types/product";

const { width } = useWindowSize();

const props = defineProps({
  product: {
    type: Object as PropType<ProductInterface>,
    required: true,
  },
  currentMediaId: {
    type: Number,
    default: 0,
  },
});

defineEmits(["close"]);

function checkIsMobile(): boolean {
  if (width.value < 768) {
    return true;
  }

  return false;
}

/* Logic to switch and set currently selected tab */
const tabs = ref<ProductPopupTabInterface[]>([
  { name: "videos", id: "video", href: "#", current: false },
  { name: "images", id: "image", href: "#", current: true },
]);

const getCurrentTab: ComputedRef<ProductPopupTabInterface | undefined> =
  computed(() => tabs.value.findLast((t) => t.current === true));

function selectTab(tabId: string): void {
  tabs.value.forEach((t) => {
    t.current = false;
    if (t.id === tabId) {
      t.current = true;
    }
  });
}

/* Mobile double tap pan zoom logic start */
const zoomContainerRef = ref<HTMLElement[]>([]);
const zoomImageRef = ref<HTMLElement[]>([]);
const isZoomed = ref<boolean>(false);

const isClicking = ref(false);
const previousX = ref<number>(0);
const previousY = ref<number>(0);

let tapedTwice: boolean = false;

function tapHandler(event: TouchEvent): void | boolean {
  if (!tapedTwice) {
    tapedTwice = true;
    setTimeout(function () {
      tapedTwice = false;
    }, 300);
    return false;
  }
  event.preventDefault();
  startZoom(event);
}

function touchStart(event: TouchEvent): void {
  isClicking.value = true;
  previousX.value = event.touches[0].clientX;
  previousY.value = event.touches[0].clientY;
}

async function startZoom(event: TouchEvent) {
  const imgEl = zoomImageRef.value[0] as HTMLElement;
  const zoomContainerEl = zoomContainerRef.value[0] as HTMLElement;
  if (isZoomed.value === true) {
    isZoomed.value = false;
  } else {
    const initialClientWidth = imgEl.clientWidth;
    const initialClientHeight = imgEl.clientHeight;

    isZoomed.value = true;

    previousX.value = event.touches[0].clientX;
    previousY.value = event.touches[0].clientY;

    await nextTick();

    zoomContainerEl.scrollLeft =
      (imgEl.clientWidth * previousX.value) / initialClientWidth;
    zoomContainerEl.scrollTop =
      (imgEl.clientHeight * previousY.value) / initialClientHeight;
  }
}

function moveTouchZoom(event: TouchEvent): void {
  if (isZoomed.value && isClicking.value) {
    const zoomContainerEl = zoomContainerRef.value[0] as HTMLElement;

    const clientX = event.touches[0].clientX;
    const clientY = event.touches[0].clientY;

    zoomContainerEl.scrollLeft =
      zoomContainerEl.scrollLeft + (previousX.value - clientX);
    zoomContainerEl.scrollTop =
      zoomContainerEl.scrollTop + (previousY.value - clientY);

    previousX.value = clientX;
    previousY.value = clientY;
  }
}

/* Click pan zoom logic start */
const desktopZoomed = ref(false);

async function startDesktopZoom(event: MouseEvent) {
  if (!checkIsMobile()) {
    if (desktopZoomed.value) {
      desktopZoomed.value = false;
    } else {
      desktopZoomed.value = true;
      await nextTick();

      const zoomContainerEl = zoomContainerRef.value[0] as HTMLElement;
      zoomContainerEl.scrollLeft = event.clientX;
      zoomContainerEl.scrollTop = event.clientY;
    }
  }
}

function moveDesktopZoom(event: MouseEvent) {
  if (!checkIsMobile() && desktopZoomed.value) {
    const zoomContainerEl = zoomContainerRef.value[0] as HTMLElement;

    if (event.clientX < zoomContainerEl.clientWidth / 2) {
      zoomContainerEl.scrollLeft = event.clientX - 150;
    } else {
      zoomContainerEl.scrollLeft = event.clientX;
    }

    if (event.clientY < zoomContainerEl.clientHeight / 2) {
      zoomContainerEl.scrollTop = event.clientY - 150;
    } else {
      zoomContainerEl.scrollTop = event.clientY;
    }
  }
}

/* Logic to switch and set currently selected media */
const currentMediaIndex = ref<number>(0);

const getCurrentMedia: ComputedRef<ProductMediaInterface | undefined> =
  computed(() => {
    if (getCurrentTab.value !== undefined) {
      return props.product.media
        .filter((m) => m.type === getCurrentTab.value?.id)
        .at(currentMediaIndex.value);
    }

    return undefined;
  });

function switchMedia(index: number): void {
  currentMediaIndex.value = index;
  isZoomed.value = false;
  desktopZoomed.value = false;
}

/* Logic to change video source */
const videoSrcRef = ref<HTMLSourceElement>();
const videoRef = ref<HTMLVideoElement[]>([]);
watch(
  getCurrentMedia,
  (newValue) => {
    if (newValue && newValue.url && videoSrcRef.value) {
      (videoSrcRef.value as HTMLSourceElement).src = newValue.url;
      videoRef.value.at(0)?.load();
    }
  },
  { immediate: false },
);

const thumbnailDisplayStyle = ref<ProductThumbnailDisplayStyleType>(
  ProductThumbnailDisplayStyleType.GRID,
);

onMounted(() => {
  /* Logic to switch tab on desktop based on selected media type start */
  const mediaItems = props.product.media;
  const selectedMediaType = mediaItems.findLast(
    (i) => i.id === props.currentMediaId,
  )?.type;

  if (selectedMediaType) {
    selectTab(selectedMediaType);
    currentMediaIndex.value = mediaItems
      .filter((i) => i.type === selectedMediaType)
      .findIndex((i) => i.id === props.currentMediaId);
  } else {
    selectTab("image");
    currentMediaIndex.value = 0;
  }

  /* Logic to switch thumbnail display style based on device width on component mount */
  if (checkIsMobile()) {
    thumbnailDisplayStyle.value =
      ProductThumbnailDisplayStyleType.HORIZONTAL_SCROLL;
  } else {
    thumbnailDisplayStyle.value = ProductThumbnailDisplayStyleType.GRID;
  }
});
</script>
<template>
  <div
    class="fixed bg-white border border-gray-500 top-2 md:top-24 bottom-2 md:bottom-24 left-2 md:left-24 right-2 md:right-24 z-50 rounded-md p-4"
    @keydown.esc.capture="$emit('close')"
  >
    <button
      title="Close"
      class="absolute md:right-4 mt-3 md:mt-0 z-20"
      @click.prevent="$emit('close')"
    >
      <span class="hidden md:block"><XCircleIcon /></span>
      <span
        class="md:hidden border border-gray-500 px-4 py-3 rounded-md shadow-md font-semibold"
        >Back</span
      >
    </button>
    <div class="tabs hidden md:block">
      <div class="block">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <a
              v-for="tab in tabs"
              :key="tab.name"
              :href="tab.href"
              :class="[
                tab.current
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium uppercase',
              ]"
              :aria-current="tab.current ? 'page' : undefined"
              @click.prevent="selectTab(tab.id)"
              >{{ tab.name }}</a
            >
          </nav>
        </div>
      </div>
    </div>
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      :class="[tab.current ? 'flex' : 'hidden', 'tab-content h-5/6 md:h-[97%]']"
    >
      <div
        v-if="tab.id === 'image'"
        class="grid grid-cols-1 md:grid-cols-6 h-auto md:h-auto pt-14 md:pt-0 overflow-hidden"
      >
        <div
          ref="zoomContainerRef"
          :class="[
            'disable-dbl-tap-zoom img-container current-image overflow-hidden md:overflow-auto',
            !isZoomed ? 'md:col-span-4 flex items-center md:items-start' : '',
          ]"
          @touchstart="touchStart"
          @touchmove="moveTouchZoom"
          @click="startDesktopZoom"
          @mousemove="moveDesktopZoom"
        >
          <img
            v-if="getCurrentMedia"
            ref="zoomImageRef"
            :src="getCurrentMedia.large"
            :alt="product.name"
            :class="[
              desktopZoomed ? 'max-w-fit cursor-zoom-out' : 'cursor-zoom-in',
              isZoomed ? 'zoomed' : '',
            ]"
            @touchstart="tapHandler"
          />
        </div>
        <div
          class="thumbnails group popup md:col-span-2 md:pl-10 absolute bottom-0 md:static w-11/12 md:w-full"
        >
          <ProductPopupProductInfo :product="product" />
          <ProductThumbnails
            :media="product.media.filter((i) => i.type == 'image')"
            :current-media-index="currentMediaIndex"
            :product-name="product.name"
            :display-style="thumbnailDisplayStyle"
            @click="switchMedia"
          />
        </div>
      </div>
      <div
        v-else-if="tab.id === 'video'"
        class="grid grid-cols-1 md:grid-cols-6 h-full pt-4 overflow-hidden"
      >
        <div
          class="current-image md:col-span-4 flex items-center relative h-full"
        >
          <video
            v-if="
              getCurrentMedia &&
              getCurrentMedia.type == 'video' &&
              getCurrentMedia.url
            "
            ref="videoRef"
            width="100%"
            controls
            autoplay
          >
            <source
              ref="videoSrcRef"
              :src="getCurrentMedia.url"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div
          class="thumbnails md:col-span-2 md:pl-10 absolute bottom-0 md:static w-11/12 md:w-full"
        >
          <ProductPopupProductInfo :product="product" />
          <div class="video-thumbnails">
            <h3 class="bg-slate-300 font-bold rounded-md mb-10 p-2 px-4">
              Videos for this product
            </h3>
            <div
              v-for="(video, videoIndex) in product.media.filter(
                (i) => i.type == 'video',
              )"
              :key="videoIndex"
              class="grid grid-cols-3 mb-3 mx-6 cursor-pointer p-2"
              :class="[
                videoIndex === currentMediaIndex
                  ? 'ring-offset ring ring-gray-500 rounded-md'
                  : '',
              ]"
              @click="switchMedia(videoIndex)"
            >
              <img
                :src="video.thumb"
                alt=""
                class="w-full object-cover h-24 rounded-md overflow-hidden ring-offset ring-2 ring-red-500"
              />
              <div class="col-span-2 ml-4 font-semibold">
                {{ video.title || product.name }}
                <br />
                <span class="clear-both text-sm text-gray-500"
                  >Merchant video</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.disable-dbl-tap-zoom {
  touch-action: manipulation;
}
.zoomed {
  cursor: zoom-out;
  max-width: fit-content;
  height: auto;
}
.img-container {
  width: auto;
  max-height: 100vh;
  transition: all 0.5s ease;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.img-container::-webkit-scrollbar {
  display: none; /* for Chrome, Safari, and Opera */
}
</style>
