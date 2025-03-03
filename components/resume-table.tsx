"use client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";
import { Loader2, FileText, Trash2, Download } from "lucide-react";
import { columns as defaultColumns } from "@/app/components/columns";

interface ResumeTableProps<TData extends Record<string, any>, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  progress?: number;
  uploadedFiles?: { id: string; file: File }[];
  onProcess?: () => void;
  onClear?: () => void;
}

export default function ResumeTable<TData extends Record<string, any>, TValue>({
  columns,
  data,
  loading = false,
  progress = 0,
  uploadedFiles = [],
  onProcess,
  onClear,
}: ResumeTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getExportFileName = () => {
    const now = new Date();
    const timestamp = now
      .toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/[/\s:]/g, "");
    return `简历解析结果_${timestamp}`;
  };

  const exportData = (format: "xlsx" | "json" | "csv") => {
    if (data.length === 0) return;

    switch (format) {
      case "xlsx": {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "简历解析结果");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${getExportFileName()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
      }
      case "json": {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${getExportFileName()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
      }
      case "csv": {
        const csvString = [
          Object.keys(data[0]).join(","),
          ...data.map((item) =>
            Object.values(item)
              .map((value) =>
                Array.isArray(value) ? `"${value.join("、")}"` : `"${value}"`
              )
              .join(",")
          ),
        ].join("\n");
        const blob = new Blob(["\uFEFF" + csvString], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${getExportFileName()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          disabled={loading || uploadedFiles?.length === 0}
          onClick={onProcess}
          className="bg-background hover:bg-primary hover:text-primary-foreground transition-colors w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              处理中 {Math.round(progress)}%
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              开始处理
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || data.length === 0}
          onClick={onClear}
          className="bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          清空结果
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || data.length === 0}
              className="w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              导出数据
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>选择导出格式</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => exportData("xlsx")}>
              导出为 Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("json")}>
              导出为 JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("csv")}>
              导出为 CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无解析结果
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
