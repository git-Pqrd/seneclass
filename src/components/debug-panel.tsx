import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DebugMessage {
  timestamp: string;
  message: string;
}

interface DebugPanelProps {
  messages: DebugMessage[];
}

const DebugPanel: React.FC<DebugPanelProps> = ({ messages }) => {
  return (
    <Card className="rounded-none h-full dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100%-2rem)]">
          {messages.map((msg, index) => (
            <div key={index} className="text-sm mb-1 dark:text-gray-300">
              <span className="text-gray-500 dark:text-gray-400">
                [{msg.timestamp}]
              </span>{" "}
              {msg.message}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
