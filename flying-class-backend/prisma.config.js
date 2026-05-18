const fs = require("fs");
const path = require("path");
const { defineConfig, env } = require("@prisma/config");

function loadDotEnv(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        if (!line || line.trim().startsWith("#")) {
            continue;
        }

        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) {
            continue;
        }

        const key = match[1];
        let value = match[2];
        if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
        }

        if (!(key in process.env)) {
            process.env[key] = value;
        }
    }
}

loadDotEnv(path.join(__dirname, ".env"));

module.exports = defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        seed: "node --import tsx prisma/seed/main.ts",
    },
    datasource: {
        url: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
        shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
    },
});
