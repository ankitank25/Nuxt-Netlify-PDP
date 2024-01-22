export interface ProductMediaInterface {
  id: number;
  thumb: string;
  standard: string;
  large?: string;
  type: "video" | "image";
  url?: string;
  title?: string;
}

export interface ProductAttributeInterface {
  label: string;
  value: string;
}

export interface ProductInterface {
  name: string;
  brand: string;
  price: string;
  attributes: ProductAttributeInterface[];
  media: ProductMediaInterface[];
}

export interface ProductPopupTabInterface {
  name: string;
  id: string;
  href: string;
  current: boolean;
}

export enum ProductThumbnailDisplayStyleType {
  GRID = "grid",
  HORIZONTAL_SCROLL = "h-scroll",
}
