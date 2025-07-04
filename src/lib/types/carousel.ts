export type CarouselNavigationMode = "hover" | "always";
export type CarouselType = "default" | "card";

export interface CarouselImage {
  src: string;
  alt?: string;
}

export interface CarouselProps {
  images: CarouselImage[];
  autoplay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  navigationMode?: CarouselNavigationMode;
  type?: CarouselType;
  cardWidth?: string;
  cardScale?: number;
}

export interface CarouselEmits {
  (e: "change", index: number): void;
  (e: "update:current", index: number): void;
}
