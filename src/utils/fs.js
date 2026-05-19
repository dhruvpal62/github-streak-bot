import { mkdir, readFile, writeFile, appendFile, access } from "node:fs/promises";
import path from "node:path";

export const ensureDirectory = async (filePath) => {
  await mkdir(path.dirname(filePath), { recursive: true });
};

export const readJson = async (filePath, fallback) => {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
};

export const writeJson = async (filePath, data) => {
  await ensureDirectory(filePath);
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

export const writeText = async (filePath, content) => {
  await ensureDirectory(filePath);
  await writeFile(filePath, content, "utf8");
};

export const appendText = async (filePath, content) => {
  await ensureDirectory(filePath);
  await appendFile(filePath, content, "utf8");
};

export const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};
