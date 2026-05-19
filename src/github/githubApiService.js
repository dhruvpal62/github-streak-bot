import axios from "axios";
import { withRetry } from "../utils/retry.js";
import { generateCommitMessage } from "../generators/commitMessageGenerator.js";

export class GitHubApiService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.client = axios.create({
      baseURL: "https://api.github.com",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
  }

  async publishFiles(target, files) {
    if (!this.config.token) return;

    const branch = target.branch ?? "main";
    const pathPrefix = target.pathPrefix ? `${target.pathPrefix.replace(/\/$/, "")}/` : "";

    for (const file of files) {
      const targetPath = `${pathPrefix}${file.path}`.replace(/\\/g, "/");
      await withRetry(async () => {
        await this.upsertFile({
          owner: target.owner,
          repo: target.repo,
          branch,
          path: targetPath,
          content: file.content,
          message: generateCommitMessage()
        });
      }, { retries: 3, delayMs: 1_500 });
    }

    await this.logger.success("Published files to target repository.", {
      repository: `${target.owner}/${target.repo}`,
      files: files.length
    });
  }

  async upsertFile({ owner, repo, branch, path, content, message }) {
    const sha = await this.getFileSha(owner, repo, path, branch);
    await this.client.put(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      sha
    });
  }

  async getFileSha(owner, repo, path, branch) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`, {
        params: { ref: branch }
      });
      return response.data.sha;
    } catch (error) {
      if (error.response?.status === 404) return undefined;
      throw error;
    }
  }

  async createIssue({ owner, repo, title, body, labels = [] }) {
    await this.client.post(`/repos/${owner}/${repo}/issues`, { title, body, labels });
  }
}
