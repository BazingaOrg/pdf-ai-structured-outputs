"use client";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { CandidateInfo } from "@/app/types";

export const columns: ColumnDef<CandidateInfo>[] = [
  {
    accessorKey: "fileName",
    header: "上传文件名",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("fileName")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "姓名",
  },
  {
    accessorKey: "companies",
    header: "工作经历",
    cell: ({ row }) => {
      const companies = row.getValue("companies") as string[];
      return <div>{companies.join("、")}</div>;
    },
  },
  {
    accessorKey: "education",
    header: "教育经历",
    cell: ({ row }) => {
      const education = row.getValue("education") as string[];
      return <div>{education.join("、")}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const candidate = row.original;
      const { toast } = useToast();

      const copyToClipboard = (text: string, description: string) => {
        navigator.clipboard.writeText(text);
        toast({
          title: "已复制",
          description,
        });
      };

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
            <DropdownMenuItem
              onClick={() =>
                copyToClipboard(candidate.self_summary, "已复制个人简介")
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              复制简介
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(candidate.name, "已复制姓名")}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制姓名
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
