"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Upload, FileText, Trash2, MoreHorizontal } from "lucide-react";
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

            // 处理不同类型的值
            if (value === null || value === undefined) {
              return <div className="text-muted-foreground">-</div>;
            }

            // 处理数组类型
            if (Array.isArray(value)) {
              // 检查数组元素是否为对象
              if (value.length > 0 && typeof value[0] === "object") {
                // 对于商品列表等复杂对象数组，显示更友好的格式
                return (
                  <div className="max-w-full">
                    {value.map((item, index) => (
                      <div key={index} className="mb-1 text-sm truncate">
                        {Object.entries(item).map(([key, val], i) => (
                          <span key={key} className="mr-1">
                            <span className="font-medium">{key}:</span>
                            <span>{String(val)}</span>
                            {i < Object.entries(item).length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }
              // 普通字符串数组
              return <div className="truncate">{value.join("、")}</div>;
            }

            // 处理日期类型
            if (field.type === "date" && value) {
              try {
                const date = new Date(value as string | number);
                if (!isNaN(date.getTime())) {
                  return (
                    <div className="truncate">
                      {date.toLocaleDateString("zh-CN")}
                    </div>
                  );
                }
              } catch (e) {
                // 如果日期解析失败，回退到显示原始值
              }
            }

            // 处理数字类型
            if (field.type === "number" && typeof value === "number") {
              return (
                <div className="truncate">{value.toLocaleString("zh-CN")}</div>
              );
            }

            // 默认情况：显示为字符串
            return <div className="truncate">{String(value)}</div>;
          },
        })
      ),
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

    // 检查文件名重复
    const existingFileNames = uploadedFiles.map((item) => item.file.name);
    const duplicateFiles = pdfFiles.filter((file) =>
      existingFileNames.includes(file.name)
    );

    // 如果有重复文件名，提示用户
    if (duplicateFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "文件名重复",
        description: `以下文件名已存在：${duplicateFiles
          .map((f) => f.name)
          .join(", ")}`,
      });

      // 过滤掉重复文件名的文件
      const uniqueFiles = pdfFiles.filter(
        (file) => !existingFileNames.includes(file.name)
      );

      // 如果没有唯一文件，直接返回
      if (uniqueFiles.length === 0) {
        return;
      }

      // 更新pdfFiles为唯一文件列表
      const newFiles = uniqueFiles.map((file) => ({
        file,
        id: crypto.randomUUID(),
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      toast({
        title: "文件已添加",
        description: `成功添加 ${uniqueFiles.length} 个文件，已跳过 ${duplicateFiles.length} 个重复文件`,
      });
      return;
    }

    // 如果没有重复文件名，正常添加所有文件
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

  const handleSelectConfig = (
    config: ParserConfig,
    showToast: boolean = true
  ) => {
    // 清空上传的文件列表和解析结果
    setUploadedFiles([]);
    setCandidates([]);

    // 更新选中的配置和列
    setSelectedConfig(config);
    setCurrentColumns(generateColumns(config));

    // 重置文件输入框，确保用户可以再次上传相同的文件
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    // 根据参数决定是否显示提示
    if (showToast) {
      toast({
        title: "配置已切换",
        description: `已切换到：${config.name}`,
      });
    }
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
          console.error("API错误详情:", errorData);

          // 提取更详细的错误信息
          let errorMessage = errorData.details || "处理 PDF 失败";

          // 如果有原始响应，检查是否包含有用信息
          if (errorData.rawResponse) {
            // 尝试从原始响应中提取有用信息
            const usefulInfo = errorData.rawResponse.includes("扫描版PDF")
              ? "这可能是扫描版PDF，无法直接提取文本。请使用包含可提取文本的PDF文件。"
              : errorData.rawResponse.includes("二进制数据")
              ? "PDF内容无法正确解析，请确保上传的是文本PDF而非扫描版。"
              : null;

            if (usefulInfo) {
              errorMessage = usefulInfo;
            }
          }

          throw new Error(errorMessage);
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
