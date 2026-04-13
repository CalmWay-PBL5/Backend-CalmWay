"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "toCsv", {
    enumerable: true,
    get: function() {
        return toCsv;
    }
});
function toCsv(rows) {
    return rows.map((row)=>row.map((cell)=>{
            const raw = String(cell ?? "");
            const escaped = raw.replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(",")).join("\n");
}

//# sourceMappingURL=class-export.util.js.map