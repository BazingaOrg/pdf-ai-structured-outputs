# PDF 结构化数据提取

一个使用 Google Gemini Pro AI 模型从 PDF 文件中提取结构化数据的 Web 应用程序。

## 🌟 功能特点

- 📄 从 PDF 文件中提取结构化数据
- 🎯 可自定义的提取配置
- 🔄 支持多文件批量处理
- 📊 支持多种格式导出结果（Excel、JSON、CSV）
- 🌓 深色/浅色主题支持
- 📱 响应式设计，适配移动设备
- 🚀 实时处理进度显示
- 🌐 完整的中文界面支持

## 🛠️ 技术栈

- [Next.js 14](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Google Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/) - AI 模型
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Tanstack Table](https://tanstack.com/table) - 表格组件
- [XLSX](https://www.npmjs.com/package/xlsx) - Excel 导出

## 🚀 快速开始

1. 克隆仓库:

```bash
git clone https://github.com/yourusername/pdf-ai-structured-outputs.git
```

2. 安装依赖:

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 创建`.env.local`文件并添加你的 Google API 密钥:

```env
GOOGLE_API_KEY=your_api_key_here
```

4. 运行开发服务器:

```bash
npm run dev
```

5. 在浏览器中打开[http://localhost:3000](http://localhost:3000)。

## 📝 使用方法

1. 选择或创建提取配置
2. 上传 PDF 文件（拖放或点击上传）
3. 点击"处理"开始提取
4. 在表格中查看结果
5. 以您喜欢的格式导出结果

## 🎯 默认配置

- 简历解析：提取常见简历字段，如姓名、教育经历、工作经验等
- 发票解析：提取发票详细信息，如发票号码、日期、金额等

## 💡 灵感来源

本项目的灵感来自:

- [AI 日常-PDF OCR 结构化输出](https://www.bilibili.com/video/BV1gRAweREGM/)
- [Building PDF to Data Pipeline with Gemini](https://www.philschmid.de/gemini-pdf-to-data)

## 📄 许可证

MIT 许可证 - 您可以自由使用此项目用于您自己的目的。

## 🤝 贡献

欢迎贡献、问题和功能请求！

## 🙏 致谢

- [Shadcn](https://twitter.com/shadcn) 提供的优秀 UI 组件
- Google 提供的 Gemini Pro API
- Next.js 团队提供的出色框架
