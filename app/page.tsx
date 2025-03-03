"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useState, useCallback } from "react";
import { Upload, FileText, Trash2, MoreHorizontal, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import ResumeTable from "@/components/resume-table";
import { Progress } from "@/components/ui/progress";
import { ConfigSelector } from "./components/config-selector";
import { defaultConfig } from "./config/default-config";
import type { CandidateInfo, ParserConfig } from "./types";
import { useMediaQuery } from "./hooks/use-media-query";
import type { ColumnDef } from "@tanstack/react-table";
import { columns as defaultColumns } from "./components/columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

interface UploadedFile {
  file: File;
  id: string;
}

export default function Page() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [candidates, setCandidates] = useState<CandidateInfo[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedConfig, setSelectedConfig] =
    useState<ParserConfig>(defaultConfig);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const generateColumns = (
    config: ParserConfig
  ): ColumnDef<CandidateInfo>[] => {
    const fileNameColumn = defaultColumns.find(
      (col) => (col as any).accessorKey === "fileName"
    );

    return [
      fileNameColumn || {
        accessorKey: "fileName",
        header: "上传文件名",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{row.getValue("fileName")}</span>
          </div>
        ),
      },
      ...config.fields.map(
        (field): ColumnDef<CandidateInfo> => ({
          accessorKey: field.key,
          header: field.name,
          cell: ({ row }) => {
            const value = row.getValue(field.key);
            if (Array.isArray(value)) {
              return <div>{value.join("、")}</div>;
            }
            return <div>{String(value)}</div>;
          },
        })
      ),
      {
        id: "actions",
        cell: ({ row }) => {
          const candidate = row.original;

          const copyToClipboard = useCallback(
            (key: string) => {
              const value = candidate[key];
              const text = Array.isArray(value)
                ? value.join("、")
                : String(value);
              navigator.clipboard.writeText(text);
              toast({
                title: "已复制",
                description: `已复制${
                  selectedConfig.fields.find((f) => f.key === key)?.name
                }`,
              });
            },
            [candidate, toast, selectedConfig.fields]
          );

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">打开菜单</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                {selectedConfig.fields.map((field) => (
                  <DropdownMenuItem
                    key={field.key}
                    onClick={() => copyToClipboard(field.key)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制{field.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  };

  const [currentColumns, setCurrentColumns] = useState(() =>
    generateColumns(defaultConfig)
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const addFiles = (files: FileList) => {
    const pdfFiles = Array.from(files).filter((file) =>
      file.type.includes("pdf")
    );

    if (pdfFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "文件类型错误",
        description: "请上传 PDF 文件",
      });
      return;
    }

    // Check file size (10MB limit)
    const oversizedFiles = pdfFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (oversizedFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "文件过大",
        description: `以下文件超过10MB限制：${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`,
      });
      return;
    }

    const newFiles = pdfFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    toast({
      title: "文件已添加",
      description: `成功添加 ${pdfFiles.length} 个文件`,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSelectConfig = (config: ParserConfig) => {
    setSelectedConfig(config);
    setCurrentColumns(generateColumns(config));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "没有文件",
        description: "请先上传简历文件",
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    for (let i = 0; i < uploadedFiles.length; i++) {
      const { file, id } = uploadedFiles[i];
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("config", JSON.stringify(selectedConfig));

      try {
        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || "处理 PDF 失败");
        }

        const data = await response.json();
        setCandidates((prev) => [
          ...prev,
          {
            ...data,
            id,
            fileName: file.name,
          },
        ]);

        toast({
          title: "处理成功",
          description: `已完成解析：${file.name}`,
        });
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "处理失败",
          description:
            error instanceof Error
              ? error.message
              : `无法处理文件：${file.name}`,
        });
      }

      setProgress(((i + 1) / uploadedFiles.length) * 100);
    }

    setLoading(false);
    setUploadedFiles([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4 md:space-y-6 md:py-8">
        <motion.div
          className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                PDF 结构化提取
              </h1>
              <p className="text-sm text-muted-foreground">
                由 Gemini 2.0 Flash、v0 和 Cursor 提供支持
              </p>
            </div>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </motion.div>

        <ConfigSelector
          selectedConfig={selectedConfig}
          onSelectConfig={handleSelectConfig}
        />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Progress value={progress} />
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <CardContent className="pt-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 md:p-8 text-center transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-muted",
                loading && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={loading}
                multiple
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-base md:text-lg mb-2 font-medium">
                  {isMobile ? "点击上传文件" : "拖放文件到这里或点击上传"}
                </p>
                <p className="text-sm text-muted-foreground">
                  支持上传多个 PDF 文件（每个文件大小不超过 10MB）
                </p>
              </label>
            </div>

            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2"
                >
                  {uploadedFiles.map(({ file, id }) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden"
        >
          <ResumeTable
            columns={currentColumns}
            data={candidates}
            loading={loading}
            progress={progress}
            uploadedFiles={uploadedFiles}
            onProcess={processFiles}
            onClear={() => setCandidates([])}
          />
        </motion.div>
      </div>
    </div>
  );
}
