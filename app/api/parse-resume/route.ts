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

    // Initialize Gemini API with environment variable and proxy settings
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!, {
      proxy:
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:7890"
          : undefined,
    });
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Convert File to Uint8Array
    const buffer = await pdfFile.arrayBuffer();
    const pdfText = await extractTextFromPDF(buffer);

    // Generate prompt based on config fields
    const fieldsDescription = config.fields
      .map((field) => {
        const typeDesc = field.type === "string[]" ? "数组" : "文本";
        return `"${field.key}": ${field.description} (${typeDesc})`;
      })
      .join("\n");

    const prompt = `请分析这份简历并提取以下信息，以JSON格式返回：

字段说明：
${fieldsDescription}

简历内容：
${pdfText}

请确保返回的JSON格式正确，且包含所有必需字段。对于数组类型，请使用数组格式返回。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse and validate the response
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
      const jsonResponse = JSON.parse(cleanedText);

      return new Response(JSON.stringify(jsonResponse), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
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
  } catch (error: any) {
    console.error("Gemini API Error:", {
      message: error.message,
      status: error.status,
      details: error.details,
      response: error.response,
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

// 添加 PDF 文本提取函数
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // 这里需要实现 PDF 文本提取逻辑
  // 可以使用 pdf-parse 或其他 PDF 处理库
  return "示例简历文本"; // 临时返回
}
