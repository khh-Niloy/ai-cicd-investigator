import { Injectable } from '@nestjs/common';
import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  GenerateContentConfig,
} from '@google/genai';
import { systemInstruction } from './helper/systemInstruction';
import { githubTools } from './tools/github.tools';
import { ToolExecutorService } from './tools/tool-executor.service';
import { userQuery } from './helper/userQuery';
import type { Content } from '@google/genai';

@Injectable()
export class AiService {
  constructor(private readonly toolExecutorService: ToolExecutorService) {}

  async aiInvestigator(owner: string, repo: string, run_id: string) {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const intiContent = userQuery(owner, repo, run_id);

    const contents: Content[] = [
      {
        role: 'user',
        parts: [{ text: intiContent }],
      },
    ];

    const config: GenerateContentConfig = {
      // responseMimeType: 'application/json',
      // responseJsonSchema: responseJsonSchema,
      systemInstruction: systemInstruction,
      tools: [
        {
          functionDeclarations: githubTools,
        },
      ],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
      temperature: 0.1,
    };

    const model = 'gemini-3.5-flash-lite';

    let result = await client.models.generateContent({
      model,
      config,
      contents,
    });
    // console.log('Gemini function calls:', result.functionCalls); // array
    while (result.functionCalls?.length) {
      console.log('Gemini requested a tool!');

      contents.push({
        role: 'model',
        parts: result.candidates?.[0]?.content?.parts ?? [],
      });

      for (const call of result.functionCalls) {
        if (!call.name) continue;

        const toolResult = await this.toolExecutorService.executeTool(
          call.name,
          (call.args ?? {}) as Record<string, any>,
        );

        console.log('Tool result:', toolResult);

        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: {
                  result: toolResult,
                },
              },
            },
          ],
        });
      }
      result = await client.models.generateContent({
        model,
        config,
        contents,
      });
    }
    if (!result.text) {
      throw new Error('No response text returned from Gemini');
    }

    console.log('Final response:', result.text);

    // Clean any markdown fences or surrounding text to safely parse JSON
    const cleanedText = result.text.replace(/```(?:json)?\s*|\s*```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;

    const jsonResult = JSON.parse(jsonString);
    console.log(jsonResult);
    return jsonResult;
  }
}
