"use client";

import { useState } from "react";
import { Plus, Save, X, Settings2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ConfigField, FieldType, ParserConfig } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

interface ConfigDialogProps {
  existingConfig?: ParserConfig;
  onSave: (config: ParserConfig) => void;
  children?: React.ReactNode;
}

export function ConfigDialog({
  existingConfig,
  onSave,
  children,
}: ConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existingConfig?.name ?? "");
  const [fields, setFields] = useState<ConfigField[]>(
    existingConfig?.fields ?? []
  );
  const { toast } = useToast();

  const handleAddField = () => {
    const newField: ConfigField = {
      id: crypto.randomUUID(),
      name: "",
      key: "",
      type: "string",
      description: "",
      required: false,
    };
    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (id: string, updates: Partial<ConfigField>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "配置名称不能为空",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请至少添加一个解析字段",
      });
      return;
    }

    const newConfig: ParserConfig = {
      id: existingConfig?.id ?? crypto.randomUUID(),
      name,
      description: "",
      fields,
      createdAt: existingConfig?.createdAt ?? new Date(),
    };

    onSave(newConfig);
    setOpen(false);
    toast({
      title: "成功",
      description: "配置已保存",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Settings2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle>{existingConfig ? "编辑配置" : "新建配置"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">配置名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入配置名称"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>解析字段</Label>
              <Button
                onClick={handleAddField}
                size="sm"
                variant="outline"
                className="bg-background hover:bg-success hover:text-success-foreground transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加字段
              </Button>
            </div>

            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid gap-4 p-4 border rounded-lg relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => handleRemoveField(field.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>字段名称</Label>
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            handleFieldChange(field.id, {
                              name: e.target.value,
                            })
                          }
                          placeholder="例如：姓名"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>字段键名</Label>
                        <Input
                          value={field.key}
                          onChange={(e) =>
                            handleFieldChange(field.id, { key: e.target.value })
                          }
                          placeholder="例如：name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>数据类型</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: FieldType) =>
                            handleFieldChange(field.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">文本</SelectItem>
                            <SelectItem value="string[]">文本列表</SelectItem>
                            <SelectItem value="number">数字</SelectItem>
                            <SelectItem value="boolean">是/否</SelectItem>
                            <SelectItem value="date">日期</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>是否必需</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) =>
                              handleFieldChange(field.id, { required: checked })
                            }
                          />
                          <Label>{field.required ? "必需" : "可选"}</Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>字段描述</Label>
                      <Input
                        value={field.description}
                        onChange={(e) =>
                          handleFieldChange(field.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="描述这个字段的用途"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            className="bg-secondary hover:bg-secondary/90 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
