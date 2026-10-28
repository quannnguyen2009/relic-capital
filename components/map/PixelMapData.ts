/**
 * Pixel Art Game-Style Map Dataset for Relic Capital
 * 16-bit retro arcade cartography of Vietnam exploration theater
 */

export const PIXEL_MAP_DIMS = { width: 560, height: 700 } as const;

/** Stepped pixel polygon outlining mainland Vietnam's S-curve */
export const VIETNAM_STEPPED_PATH =
  "140,80 170,80 170,70 210,70 210,60 250,60 280,70 310,70 330,80 " +
  "330,100 350,100 350,120 330,120 330,140 " +
  "310,140 310,170 290,170 290,200 280,200 280,230 " +
  "270,230 270,260 290,260 290,290 320,290 320,320 " +
  "340,320 340,350 370,350 370,380 390,380 390,420 " +
  "380,420 380,450 390,450 390,490 380,490 380,520 " +
  "360,520 360,550 330,550 330,580 300,580 300,610 " +
  "260,610 260,630 220,630 220,610 190,610 190,580 " +
  "190,560 210,560 210,540 230,540 230,510 260,510 260,480 " +
  "280,480 280,430 260,430 260,380 230,380 230,340 210,340 210,300 " +
  "180,300 180,260 160,260 160,220 140,220 140,180 120,180 120,140 140,140";

/** Regional biome polygons for the 5 game zones */
export const REGION_BIOMES = {
  north: {
    points: "120,140 140,80 170,80 170,70 210,70 210,60 250,60 280,70 310,70 330,80 330,120 280,180 230,180 180,220 140,220 120,180",
    color: "#16382a",
    borderColor: "#2d664e",
    label: "MIỀN BẮC",
    sub: "Upland Valleys · Fansipan Peaks",
    labelPos: { x: 190, y: 105 },
  },
  delta: {
    points: "230,130 280,130 330,120 350,120 330,140 310,140 310,170 290,170 290,200 280,200 240,200 230,170",
    color: "#1d4e38",
    borderColor: "#4da87a",
    label: "ĐỒNG BẰNG SÔNG HỒNG",
    sub: "Đông Sơn Hearth · Alluvial Plain",
    labelPos: { x: 340, y: 175 },
  },
  central: {
    points: "270,230 270,260 290,260 290,290 320,290 320,320 340,320 340,350 370,350 370,380 390,380 390,420 380,420 350,420 320,380 290,340 260,300 260,260",
    color: "#382e18",
    borderColor: "#c89b3c",
    label: "MIỀN TRUNG",
    sub: "Champa Coastal Corridors",
    labelPos: { x: 385, y: 310 },
  },
  highlands: {
    points: "260,380 350,420 380,420 380,450 390,450 390,490 380,490 350,510 300,510 260,480 280,430",
    color: "#28381c",
    borderColor: "#5c7d3c",
    label: "TÂY NGUYÊN",
    sub: "Basalt Plateau · Megalithic Basins",
    labelPos: { x: 320, y: 440 },
  },
  south: {
    points: "260,510 350,510 380,520 360,550 330,550 330,580 300,580 300,610 260,610 260,630 220,630 220,610 190,610 190,560 210,560 210,540 230,540",
    color: "#184033",
    borderColor: "#3a8f72",
    label: "NAM BỘ",
    sub: "Óc Eo Entrepôt · Mekong Delta",
    labelPos: { x: 260, y: 645 },
  },
} as const;

/** Site game coordinates on the 560x700 pixel map */
export const PIXEL_SITE_COORDS: Record<
  string,
  {
    x: number;
    y: number;
    name: string;
    icon: "castle" | "cave" | "trench" | "kiln" | "tower" | "dolmen" | "port";
    labelAnchor: "left" | "right" | "top";
    labelOffset: [number, number];
  }
> = {
  "north-co-loa": {
    x: 260,
    y: 125,
    name: "Cổ Loa Citadel",
    icon: "castle",
    labelAnchor: "right",
    labelOffset: [18, -2],
  },
  "north-hoa-binh": {
    x: 205,
    y: 160,
    name: "Hòa Bình Shelter",
    icon: "cave",
    labelAnchor: "left",
    labelOffset: [-18, 0],
  },
  "delta-lien-lau": {
    x: 295,
    y: 160,
    name: "Liên Lậu Grid",
    icon: "trench",
    labelAnchor: "right",
    labelOffset: [18, -2],
  },
  "delta-ma-the": {
    x: 260,
    y: 190,
    name: "Má Thẹn Mound",
    icon: "kiln",
    labelAnchor: "right",
    labelOffset: [18, 4],
  },
  "central-tra-kieu": {
    x: 355,
    y: 355,
    name: "Trà Kiệu Towers",
    icon: "tower",
    labelAnchor: "left",
    labelOffset: [-18, 0],
  },
  "highlands-dak-son": {
    x: 340,
    y: 460,
    name: "Đắk Sơn Basin",
    icon: "dolmen",
    labelAnchor: "left",
    labelOffset: [-18, 0],
  },
  "south-oc-eo": {
    x: 220,
    y: 575,
    name: "Óc Eo Port",
    icon: "port",
    labelAnchor: "right",
    labelOffset: [18, 0],
  },
};

/** Hanoi Headquarters Pin */
export const PIXEL_HANOI_HQ = {
  x: 245,
  y: 145,
  name: "Hà Nội Institute HQ",
} as const;

/** Pixel Art Islands */
export const PIXEL_ISLANDS = [
  { name: "Đảo Phú Quốc", x: 160, y: 580, w: 16, h: 24, labelPos: [145, 615] as [number, number] },
  { name: "Côn Đảo", x: 285, y: 650, w: 12, h: 10, labelPos: [290, 672] as [number, number] },
  { name: "Cát Bà", x: 325, y: 135, w: 10, h: 8, labelPos: [340, 138] as [number, number] },
];

/** Pixel Art Archipelagos (Hoàng Sa & Trường Sa) */
export const PIXEL_ARCHIPELAGOS = {
  hoangSa: {
    label: "QUẦN ĐẢO HOÀNG SA",
    sub: "Paracel Islands",
    bounds: { x: 430, y: 300, w: 100, h: 70 },
    atolls: [
      { x: 450, y: 320, r: 4 },
      { x: 470, y: 310, r: 5 },
      { x: 490, y: 335, r: 4 },
      { x: 465, y: 350, r: 3 },
    ],
  },
  truongSa: {
    label: "QUẦN ĐẢO TRƯỜNG SA",
    sub: "Spratly Islands",
    bounds: { x: 430, y: 520, w: 110, h: 100 },
    atolls: [
      { x: 450, y: 540, r: 4 },
      { x: 490, y: 535, r: 5 },
      { x: 475, y: 570, r: 5 },
      { x: 510, y: 565, r: 4 },
      { x: 460, y: 600, r: 4 },
    ],
  },
};

/** Pixel Art Rivers */
export const PIXEL_RIVERS = [
  // Sông Hồng (Red River) from NW into the Gulf
  "170,110 210,130 245,145 285,165 315,160",
  // Sông Đáy / nhánh sông phụ
  "230,150 250,175 270,195",
  // Sông Thu Bồn (Central / Trà Kiệu)
  "315,350 355,355 375,355",
  // Sông Tiền & Sông Hậu (Mekong Delta channels)
  "210,540 235,560 260,580 290,600",
  "235,560 220,575 240,610",
];

/** Pixel Art Mountain Peaks (fansipan, truong son, etc.) */
export const PIXEL_PEAKS = [
  // Northwest (Hoàng Liên Sơn / Fansipan)
  { x: 175, y: 95 },
  { x: 195, y: 85 },
  { x: 165, y: 120 },
  { x: 185, y: 135 },
  // Annamite Range (Dãy Trường Sơn)
  { x: 255, y: 245 },
  { x: 275, y: 280 },
  { x: 305, y: 330 },
  { x: 330, y: 375 },
  { x: 360, y: 435 },
  { x: 350, y: 485 },
];

/** Pixel Art Jungle Trees in Highlands */
export const PIXEL_TREES = [
  { x: 310, y: 420 },
  { x: 330, y: 410 },
  { x: 365, y: 450 },
  { x: 320, y: 475 },
  { x: 345, y: 500 },
];
