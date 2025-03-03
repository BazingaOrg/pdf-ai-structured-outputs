import type { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ParserConfig } from "@/app/types";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;
    const configJson = formData.get("config") as string;
    const config: ParserConfig = JSON.parse(configJson);

    if (!pdfFile) {
      return new Response("No PDF file provided", { status: 400 });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 生成字段描述
    const fieldsDescription = config.fields
      .map((field) => {
        const typeDesc = field.type === "string[]" ? "数组" : "文本";
        return `"${field.key}": ${field.description} (${typeDesc})`;
      })
      .join("\n");

    // 准备提示词
    const prompt = `请分析这份简历并提取以下信息，以JSON格式返回：

字段说明：
${fieldsDescription}

请确保返回的JSON格式正确，且包含所有必需字段。对于数组类型，请使用数组格式返回。
重要：请只返回JSON格式的数据，不要添加任何额外的解释或分析。`;

    // 准备PDF文件数据
    const fileBytes = await pdfFile.arrayBuffer();
    const fileData = {
      inlineData: {
        data: Buffer.from(fileBytes).toString("base64"),
        mimeType: pdfFile.type,
      },
    };

    // 创建响应模式
    const responseSchema: {
      type: string;
      properties: Record<string, any>;
    } = {
      type: "object",
      properties: {},
    };

    // 根据配置字段动态构建响应模式
    for (const field of config.fields) {
      if (field.type === "string[]") {
        responseSchema.properties[field.key] = {
          type: "array",
          items: { type: "string" },
          description: field.description,
        };
      } else {
        responseSchema.properties[field.key] = {
          type: "string",
          description: field.description,
        };
      }
    }

    // 发送请求到Gemini
    try {
      // 使用基本的API调用方式
      const result = await model.generateContent([{ text: prompt }, fileData]);

      const response = await result.response;
      const text = response.text();

      // 尝试解析JSON响应
      try {
        // 如果响应已经是JSON格式，直接解析
        const jsonResponse = JSON.parse(text);
        return new Response(JSON.stringify(jsonResponse), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);

        // 尝试从响应中提取JSON部分
        try {
          // 首先尝试查找```json和```之间的内容
          let jsonContent = text;
          const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

          if (jsonBlockMatch && jsonBlockMatch[1]) {
            // 如果找到了代码块，使用代码块中的内容
            jsonContent = jsonBlockMatch[1].trim();
          } else {
            // 否则尝试查找第一个有效的JSON对象
            const possibleJsonMatch = text.match(/(\{[\s\S]*\})/);
            if (possibleJsonMatch && possibleJsonMatch[1]) {
              jsonContent = possibleJsonMatch[1].trim();
            }
          }

          // 尝试解析JSON
          const jsonResponse = JSON.parse(jsonContent);
          return new Response(JSON.stringify(jsonResponse), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (extractError) {
          // 如果无法提取JSON，返回原始错误
          return new Response(
            JSON.stringify({
              error: "Invalid response format",
              details: "The AI response could not be parsed correctly",
              rawResponse: text,
            }),
            {
              status: 422,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
    } catch (modelError: any) {
      console.error("Gemini model error:", modelError);
      return new Response(
        JSON.stringify({
          error: "Model processing error",
          details: modelError.message || "Error processing with Gemini model",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("API Error:", {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    return new Response(
      JSON.stringify({
        error: "Error processing PDF",
        details: error.message,
        status: error.status,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
