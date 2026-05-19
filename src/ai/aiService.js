import axios from "axios";

export class AiService {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
  }

  async generateDailyNote(context) {
    if (this.config.provider === "openai") return this.generateWithOpenAI(context);
    if (this.config.provider === "gemini") return this.generateWithGemini(context);
    return this.generateFallback(context);
  }

  async generateWithOpenAI(context) {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: this.config.openaiModel,
        messages: [
          {
            role: "system",
            content: "Write concise, practical developer journal notes. Avoid pretending manual work happened; describe scheduled maintenance and learning reflections honestly."
          },
          {
            role: "user",
            content: `Create a markdown daily note for ${context.date}. Topics: ${context.topics.join(", ")}.`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.openaiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    await this.logger.info("Generated daily note with OpenAI.", { model: this.config.openaiModel });
    return response.data.choices?.[0]?.message?.content?.trim() || this.generateFallback(context);
  }

  async generateWithGemini(context) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.geminiModel}:generateContent?key=${this.config.geminiKey}`;
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `Create a concise markdown developer journal note for ${context.date}. Topics: ${context.topics.join(", ")}. Be transparent that this is scheduled automation output.`
            }
          ]
        }
      ]
    });

    await this.logger.info("Generated daily note with Gemini.", { model: this.config.geminiModel });
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || this.generateFallback(context);
  }

  generateFallback(context) {
    const [primary, secondary] = context.topics;
    return `# Daily Development Note - ${context.date}

## Focus

Today the scheduled maintenance bot refreshed project artifacts around ${primary} and ${secondary}. The run updated local notes, statistics, reports, and execution logs so the repository keeps a useful history of automation health.

## Maintenance Notes

- Reviewed generated activity metadata for consistency.
- Recorded the current streak and execution counters.
- Refreshed documentation markers with the latest run status.
- Preserved a low-noise update pattern suitable for long-term maintenance.

## Learning Summary

Small, regular maintenance is easiest to trust when every update leaves behind readable context. This run favors clear notes, machine-readable reports, and transparent logs over empty placeholder commits.
`;
  }
}
