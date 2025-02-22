import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "string",
  "string[]",
  "number",
  "boolean",
  "date",
]);
export type FieldType = z.infer<typeof fieldTypeSchema>;

export interface ConfigField {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  description: string;
  required: boolean;
}

export interface ParserConfig {
  id: string;
  name: string;
  fields: ConfigField[];
  createdAt: Date;
  isDefault?: boolean;
}

export interface CandidateInfo {
  id: string;
  fileName: string;
  [key: string]: any;
}
