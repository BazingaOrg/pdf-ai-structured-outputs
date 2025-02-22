# PDF Structured Data Extraction

A web application for extracting structured data from PDF files using Google's Gemini Pro AI model.

## 🌟 Features

- 📄 Extract structured data from PDF files
- 🎯 Customizable extraction configurations
- 🔄 Support for multiple file processing
- 📊 Export results in multiple formats (Excel, JSON, CSV)
- 🌓 Dark/Light theme support
- 📱 Responsive design
- 🚀 Real-time processing progress

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Google Gemini Pro](https://deepmind.google/technologies/gemini/) - AI Model
- [Framer Motion](https://www.framer.com/motion/) - Animation Library
- [Tanstack Table](https://tanstack.com/table) - Table Component
- [XLSX](https://www.npmjs.com/package/xlsx) - Excel Export

## 🚀 Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pdf-structured-extraction.git
```

2. Install dependencies:

```bash
npm install
or
yarn install
or
pnpm install
```

3. Create a `.env.local` file and add your Google API key:

```env:README.md
GOOGLE_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📝 Usage

1. Select or create an extraction configuration
2. Upload PDF files (drag & drop or click to upload)
3. Click "Process" to start extraction
4. View results in the table
5. Export results in your preferred format

## 🎯 Default Configurations

- Resume Parsing: Extract common resume fields like name, education, work experience
- Invoice Parsing: Extract invoice details like invoice number, date, amount, etc.

## 💡 Inspiration

This project is inspired by:

- [AI 日常-PDF OCR 结构化输出](https://www.bilibili.com/video/BV1gRAweREGM/)
- [Building PDF to Data Pipeline with Gemini](https://www.philschmid.de/gemini-pdf-to-data)

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🙏 Acknowledgments

- [Shadcn](https://twitter.com/shadcn) for the amazing UI components
- Google for providing the Gemini Pro API
- The Next.js team for the awesome framework
