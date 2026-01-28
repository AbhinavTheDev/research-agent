import { googleAI } from "@genkit-ai/google-genai";
import { z } from "@genkit-ai/core";
import { genkit } from "genkit";
import { createServerFn } from "@tanstack/react-start";

// logger.setLogLevel("debug");

const ytRequestSchema = z.object({
  prompt: z.string(),
  url: z.string(),
});

export const youtubeStreamFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (data instanceof FormData) {
      return {
        prompt: data.get("prompt")?.toString() || "",
        url: data.get("url")?.toString() || "",
      };
    }
    return ytRequestSchema.parse(data);
  })
  .handler(async function* ({ data }) {
    const ai = genkit({
      plugins: [
        googleAI({
          apiKey: process.env.GOOGLE_API_KEY,
        }),
        // groq({
        //   apiKey: process.env.GROQ_API_KEY,
        // }),
      ],
      model: googleAI.model("gemini-2.5-flash-lite"),
    });

    // const youtubeFlow = ai.defineFlow(
    //   {
    //     name: "youtube flow",
    //     inputSchema: z.object({
    //       prompt: z.string(),
    //       ytUrl: z.string(),
    //     }),
    //     outputSchema: z.string(),
    //   },
    //   async ({ prompt, ytUrl }, { sendChunk }) => {
    //     return await ai.run("call-llm", async () => {
    //       const llmResponse = await ai.generate({
    //         prompt: [
    //           {
    //             text: prompt,
    //           },
    //           {
    //             media: {
    //               url: ytUrl,
    //               contentType: "video/mp4",
    //             },
    //           },
    //         ],
    //         // model: groqModel("llama-3.1-8b-instant"),
    //         config: {
    //           temperature: 0.5,
    //         },
    //         onChunk: (c) => sendChunk(c.text),
    //       });
    //       // console.log("LLM RESPONSE:", llmResponse);
    //       return llmResponse.text;
    //     });
    //   },
    // );

    // const { stream } = ai.generateStream(
    //   await youtubeFlow({
    //     prompt: data.prompt,
    //     ytUrl: data.url,
    //   }),
    // );
    try {
      const { stream } = await ai.generateStream({
        prompt: [
          {
            text: data.prompt,
          },
          {
            media: {
              url: data.url,
              contentType: "video/mp4",
            },
          },
        ],
        config: {
          temperature: 0.5,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      yield "Error: Failed to process the video. Please try again.";
    }
  });
