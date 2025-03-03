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
import { useMemo } from "react";

// 定义自定义列元数据类型
interface CustomColumnMeta {
  fixed?: boolean;
  fixedIndex?: number;
}

// 扩展ColumnDef类型
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue>
    extends CustomColumnMeta {}
}

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
  // 处理列冻结
  const processedColumns = useMemo(() => {
    if (columns.length <= 3) return columns;

    // 前三列设置为固定列
    const fixedColumns = columns.slice(0, 3).map((col, index) => ({
      ...col,
      meta: {
        ...col.meta,
        fixed: true,
        fixedIndex: index,
      },
    }));

    // 其余列正常显示
    const scrollColumns = columns.slice(3).map((col) => ({
      ...col,
      meta: {
        ...col.meta,
        fixed: false,
      },
    }));

    return [...fixedColumns, ...scrollColumns];
  }, [columns]);

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 检查是否为发票解析结果
  const isInvoice = useMemo(() => {
    if (data.length === 0) return false;
    // 检查第一条数据是否包含发票特有字段
    const firstItem = data[0];
    return "invoiceCode" in firstItem || "invoiceNumber" in firstItem;
  }, [data]);

  const getExportFileName = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    const timestamp = `${year}年${month}月${day}日${hour}时${minute}分${second}秒`;
    const prefix = isInvoice ? "发票解析结果" : "简历解析结果";
    return `${prefix}_${timestamp}`;
  };

  const exportData = (format: "xlsx" | "json" | "csv") => {
    if (data.length === 0) return;

    switch (format) {
      case "xlsx": {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        const sheetName = isInvoice ? "发票解析结果" : "简历解析结果";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
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

      <div className="relative overflow-hidden border rounded-md">
        <div
          className="overflow-x-auto"
          style={{ maxHeight: "70vh", position: "relative" }}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isFixed = header.column.columnDef.meta?.fixed;
                    const fixedIndex = header.column.columnDef.meta
                      ?.fixedIndex as number;

                    return (
                      <TableHead
                        key={header.id}
                        className={`${
                          isFixed ? "sticky z-10 bg-background" : ""
                        } max-w-[300px]`}
                        style={{
                          ...(isFixed
                            ? {
                                left:
                                  fixedIndex === 0
                                    ? 0
                                    : fixedIndex === 1
                                    ? "200px"
                                    : "400px",
                                boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                              }
                            : {}),
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          position: isFixed ? "sticky" : "relative",
                        }}
                        title={
                          typeof header.column.columnDef.header === "string"
                            ? header.column.columnDef.header
                            : ""
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
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
                    {row.getVisibleCells().map((cell) => {
                      const isFixed = cell.column.columnDef.meta?.fixed;
                      const fixedIndex = cell.column.columnDef.meta
                        ?.fixedIndex as number;

                      return (
                        <TableCell
                          key={cell.id}
                          className={`${
                            isFixed ? "sticky z-10 bg-background" : ""
                          } max-w-[300px]`}
                          style={{
                            ...(isFixed
                              ? {
                                  left:
                                    fixedIndex === 0
                                      ? 0
                                      : fixedIndex === 1
                                      ? "200px"
                                      : "400px",
                                  boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                                }
                              : {}),
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            position: isFixed ? "sticky" : "relative",
                          }}
                          title={
                            // 获取单元格内容的文本表示，用于tooltip
                            (() => {
                              const value = cell.getValue();
                              if (value === null || value === undefined)
                                return "";
                              if (Array.isArray(value)) {
                                if (
                                  value.length > 0 &&
                                  typeof value[0] === "object"
                                ) {
                                  return value
                                    .map((item) =>
                                      Object.entries(item)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(", ")
                                    )
                                    .join("\n");
                                }
                                return value.join("、");
                              }
                              return String(value);
                            })()
                          }
                        >
                          {cell.getValue() === null ||
                          cell.getValue() === undefined ? (
                            <span className="text-muted-foreground">-</span>
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          )}
                        </TableCell>
                      );
                    })}
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
    </div>
  );
}
