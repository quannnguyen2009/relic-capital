// Bilingual localization engine: English & Tiếng Việt for Relic Capital

export type Lang = "en" | "vi";

export const DICT = {
  en: {
    // Branding & Header
    instituteTitle: "Relic Capital",
    instituteSubtitle: "Independent Institute for Vietnamese Archaeology",
    day: "Day",
    cash: "Cash",
    research: "Research",
    reputation: "Reputation",
    runway: "Runway",
    advanceDay: "Advance day →",
    progressSaved: "Progress saved",
    saving: "Saving…",
    newGameReset: "New game / reset",

    // Navigation Tabs
    nav_command: "Command Center",
    nav_map: "Exploration Map",
    nav_expedition: "Expedition",
    nav_archive: "Artifact Archive",
    nav_lab: "Research Lab",
    nav_finance: "Finance & Grants",
    nav_market: "Market Observatory",
    nav_dev: "Institute Development",
    nav_codex: "Codex & Journal",

    // Common Actions
    planExpedition: "Plan expedition",
    launchExpedition: "Launch expedition",
    digOn: "Dig on — advance one day",
    viewReport: "View report",
    publish: "Publish finding",
    verify: "Verify evidence",
    classify: "Artifact classification",
    referenceMatch: "Reference matching",
    curateExhibition: "Stage Special Exhibition",
    activeExhibition: "Current Exhibition",

    // Warnings & Status
    insolvencyRisk: "Insolvency risk — cash is negative",
    insolvencyTip: "Sell market positions or apply for grants in Finance.",
    stableRunway: "stable",
    daysCount: "d",
    soundOn: "Sound: On",
    soundMuted: "Sound: Muted",
    langToggle: "Tiếng Việt",
  },
  vi: {
    // Branding & Header
    instituteTitle: "Cổ Vật Thủ Đô",
    instituteSubtitle: "Viện Nghiên cứu Khảo cổ học Việt Nam Độc lập",
    day: "Ngày",
    cash: "Ngân sách",
    research: "Nghiên cứu",
    reputation: "Uy tín",
    runway: "Dự trữ",
    advanceDay: "Chuyển ngày →",
    progressSaved: "Đã lưu",
    saving: "Đang lưu…",
    newGameReset: "Trò chơi mới / Đặt lại",

    // Navigation Tabs
    nav_command: "Trung tâm Chỉ huy",
    nav_map: "Bản đồ Thám hiểm",
    nav_expedition: "Đoàn Khai quật",
    nav_archive: "Kho Lưu trữ",
    nav_lab: "Phòng Thí nghiệm",
    nav_finance: "Tài chính & Tài trợ",
    nav_market: "Thị trường Khảo cổ",
    nav_dev: "Phát triển Viện",
    nav_codex: "Thư tịch & Nhật ký",

    // Common Actions
    planExpedition: "Lập kế hoạch khai quật",
    launchExpedition: "Xuất phát đoàn",
    digOn: "Tiếp tục đào — qua một ngày",
    viewReport: "Xem báo cáo",
    publish: "Xuất bản công trình",
    verify: "Thẩm định bằng chứng",
    classify: "Phân loại hiện vật",
    referenceMatch: "Đối chiếu tư liệu mẫu",
    curateExhibition: "Tổ chức Triển lãm Đặc biệt",
    activeExhibition: "Triển lãm Đang Mở",

    // Warnings & Status
    insolvencyRisk: "Nguy cơ mất khả năng chi trả — ngân sách âm",
    insolvencyTip: "Bán các vị thế thị trường hoặc nộp đơn xin tài trợ khẩn cấp.",
    stableRunway: "ổn định",
    daysCount: "ngày",
    soundOn: "Âm thanh: Bật",
    soundMuted: "Âm thanh: Tắt",
    langToggle: "English",
  },
} as const;

export type DictKey = keyof typeof DICT["en"];

export function t(key: DictKey, lang: Lang = "en"): string {
  return DICT[lang]?.[key] ?? DICT["en"][key] ?? key;
}
