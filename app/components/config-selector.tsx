"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ParserConfig } from "../types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigDialog } from "./config-dialog";
import { defaultConfigs } from "../config/default-config";
import { Settings2, Plus, Calendar } from "lucide-react";

interface ConfigSelectorProps {
  selectedConfig: ParserConfig;
  onSelectConfig: (config: ParserConfig) => void;
}

export function ConfigSelector({
  selectedConfig,
  onSelectConfig,
}: ConfigSelectorProps) {
  const [configs, setConfigs] = useState<ParserConfig[]>(defaultConfigs);

  const handleSaveConfig = (config: ParserConfig) => {
    const existingIndex = configs.findIndex((c) => c.id === config.id);
    if (existingIndex >= 0) {
      setConfigs(configs.map((c, i) => (i === existingIndex ? config : c)));
    } else {
      setConfigs([...configs, config]);
    }
    onSelectConfig(config);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <CardTitle>解析配置</CardTitle>
          </div>
          <ConfigDialog onSave={handleSaveConfig}>
            <Button
              variant="outline"
              className="bg-background hover:bg-primary hover:text-primary-foreground transition-colors w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              新建配置
            </Button>
          </ConfigDialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {configs.map((config) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`p-4 rounded-lg border-2 transition-colors cursor-pointer hover:bg-accent ${
                    selectedConfig.id === config.id
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  onClick={() => onSelectConfig(config)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {config.isDefault ? (
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      <h3 className="font-medium">{config.name}</h3>
                    </div>
                    {!config.isDefault && (
                      <ConfigDialog
                        existingConfig={config}
                        onSave={handleSaveConfig}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background hover:bg-secondary hover:text-secondary-foreground transition-colors"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </ConfigDialog>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {config.fields.map((field) => (
                      <span
                        key={field.id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
                      >
                        {field.name}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
