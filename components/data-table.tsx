"use client"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const DataTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const exportData = (format: "xlsx" | "json" | "csv") => {
    if (data.length === 0) return

    switch (format) {
      case "xlsx":
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "简历解析结果")
        XLSX.writeFile(wb, "简历解析结果.xlsx")
        break
      case "json":
        const jsonString = JSON.stringify(data, null, 2)
        const jsonBlob = new Blob([jsonString], { type: "application/json" })
        const jsonUrl = URL.createObjectURL(jsonBlob)
        const jsonLink = document.createElement("a")
        jsonLink.href = jsonUrl
        jsonLink.download = "简历解析结果.json"
        jsonLink.click()
        URL.revokeObjectURL(jsonUrl)
        break
      case "csv":
        const csvString = [
          Object.keys(data[0]).join(","),
          ...data.map((item) =>
            Object.values(item)
              .map((value) => (Array.isArray(value) ? `"${value.join("、")}"` : `"${value}"`))
              .join(","),
          ),
        ].join("\n")
        const csvBlob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvLink = document.createElement("a")
        csvLink.href = csvUrl
        csvLink.download = "简历解析结果.csv"
        csvLink.click()
        URL.revokeObjectURL(csvUrl)
        break
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={data.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              导出数据
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>选择导出格式</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => exportData("xlsx")}>导出为 Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("json")}>导出为 JSON</DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData("csv")}>导出为 CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无解析结果
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default DataTable

