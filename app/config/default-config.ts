import type { ParserConfig } from "../types";

export const defaultConfigs: ParserConfig[] = [
  {
    id: "resume",
    name: "默认配置-基础简历解析",
    fields: [
      {
        id: "name",
        name: "姓名",
        key: "name",
        type: "string",
        description: "候选人全名",
        required: true,
      },
      {
        id: "education",
        name: "教育经历",
        key: "education",
        type: "string[]",
        description: "教育背景列表",
        required: true,
      },
      {
        id: "companies",
        name: "工作经历",
        key: "companies",
        type: "string[]",
        description: "工作过的公司列表",
        required: true,
      },
    ],
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: "invoice",
    name: "默认配置-基础发票解析",
    fields: [
      {
        id: "invoiceCode",
        name: "发票代码",
        key: "invoiceCode",
        type: "string",
        description: "发票唯一代码",
        required: true,
      },
      {
        id: "invoiceNumber",
        name: "发票号码",
        key: "invoiceNumber",
        type: "string",
        description: "发票编号",
        required: true,
      },
      {
        id: "date",
        name: "开票日期",
        key: "date",
        type: "date",
        description: "发票开具日期",
        required: true,
      },
      {
        id: "amount",
        name: "金额",
        key: "amount",
        type: "number",
        description: "发票金额",
        required: true,
      },
      {
        id: "seller",
        name: "销售方",
        key: "seller",
        type: "string",
        description: "销售方名称",
        required: true,
      },
      {
        id: "buyer",
        name: "购买方",
        key: "buyer",
        type: "string",
        description: "购买方名称",
        required: true,
      },
      {
        id: "items",
        name: "商品列表",
        key: "items",
        type: "string[]",
        description: "发票商品或服务项目列表",
        required: true,
      },
    ],
    createdAt: new Date(),
    isDefault: true,
  },
];

export const defaultConfig = defaultConfigs[0];
