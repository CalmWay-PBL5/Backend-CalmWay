"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get FILE_UPLOAD_RULES () {
        return FILE_UPLOAD_RULES;
    },
    get MIME_TYPES () {
        return MIME_TYPES;
    }
});
const MIME_TYPES = {
    IMAGE: [
        "image/jpeg",
        "image/png",
        "image/webp"
    ],
    DOCUMENT: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ],
    VIDEO: [
        "video/mp4",
        "video/webm"
    ],
    AUDIO: [
        "audio/mpeg",
        "audio/wav"
    ]
};
const FILE_UPLOAD_RULES = {
    KYC_DOCUMENT: {
        allowedMimes: [
            ...MIME_TYPES.IMAGE,
            "application/pdf"
        ],
        maxSizeMB: 5,
        description: "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP) hoặc PDF, dung lượng tối đa 5MB."
    },
    USER_AVATAR: {
        allowedMimes: [
            ...MIME_TYPES.IMAGE
        ],
        maxSizeMB: 2,
        description: "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP), dung lượng tối đa 2MB."
    },
    AI_ASSISTANT_ATTACHMENT: {
        allowedMimes: [
            ...MIME_TYPES.IMAGE,
            ...MIME_TYPES.DOCUMENT
        ],
        maxSizeMB: 10,
        description: "Chỉ chấp nhận file Ảnh hoặc Tài liệu (PDF, DOC, DOCX), dung lượng tối đa 10MB."
    },
    CLASS_COVER: {
        allowedMimes: [
            ...MIME_TYPES.IMAGE
        ],
        maxSizeMB: 20,
        description: "Chỉ chấp nhận file Ảnh (JPG, PNG, WEBP), dung lượng tối đa 20MB."
    },
    COURSE_VIDEO: {
        allowedMimes: [
            ...MIME_TYPES.VIDEO
        ],
        maxSizeMB: 2048,
        description: "Chỉ chấp nhận file Video (MP4, WEBM), dung lượng tối đa 2GB."
    }
};

//# sourceMappingURL=file-whitelist.constant.js.map