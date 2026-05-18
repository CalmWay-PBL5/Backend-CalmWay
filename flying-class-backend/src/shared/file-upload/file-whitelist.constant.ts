export const MIME_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/webp"] as const,
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
  VIDEO: ["video/mp4", "video/webm"] as const,
  AUDIO: ["audio/mpeg", "audio/wav"] as const,
} as const;

export const FILE_UPLOAD_RULES = {
  KYC_DOCUMENT: {
    allowedMimes: [...MIME_TYPES.IMAGE, "application/pdf"],
    maxSizeMB: 5,
    description:
      "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP) hoặc PDF, dung lượng tối đa 5MB.",
  },
  USER_AVATAR: {
    allowedMimes: [...MIME_TYPES.IMAGE],
    maxSizeMB: 2,
    description:
      "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP), dung lượng tối đa 2MB.",
  },
  AI_ASSISTANT_ATTACHMENT: {
    allowedMimes: [...MIME_TYPES.IMAGE, ...MIME_TYPES.DOCUMENT],
    maxSizeMB: 10,
    description:
      "Chỉ chấp nhận file Ảnh hoặc Tài liệu (PDF, DOC, DOCX), dung lượng tối đa 10MB.",
  },
  CLASS_COVER: {
    allowedMimes: [...MIME_TYPES.IMAGE],
    maxSizeMB: 20,
    description:
      "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP), dung lượng tối đa 20MB.",
  },
  COURSE_VIDEO: {
    allowedMimes: [...MIME_TYPES.VIDEO],
    maxSizeMB: 2048,
    description: "Chỉ chấp nhận file Video (MP4, WEBM), dung lượng tối đa 2GB.",
  },
} as const;

export type UploadContext = keyof typeof FILE_UPLOAD_RULES;
