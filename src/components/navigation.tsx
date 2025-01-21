"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigStore } from "@/store/config-store";
import ToggleTheme from "@/components/toggle-theme";
import {
  FlipHorizontal,
  FlipVertical,
  Settings,
  Speech,
  BicepsFlexed,
} from "lucide-react";
import { Message, MODEL } from "@/types";
import useDeviceDetect from "@/hooks/isMobile";

interface NavigationProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
}

const Navigation = ({
  messages,
  setMessages,
  apiKey,
  setApiKey,
}: NavigationProps) => {
  const {
    direction,
    usedApi,
    rate,
    difficulty,
    setDirection,
    setUsedApi,
    setRate,
    setDifficulty,
  } = useConfigStore();

  const { isMobile } = useDeviceDetect();
  useEffect(() => setDirection(isMobile ? "vertical":  "horizontal"), [isMobile]);

  return (
    <div className="mb-3 w-full flex justify-between items-center flex-col">
      <div className="flex items-start">
        <h1 className="text-2xl font-bold mb-4">SeneClass</h1>
        <Avatar className="ml-2 h-auto">
          <AvatarImage className="h-auto" src="/seneclass.png" alt="@shadcn" />
          <AvatarFallback className="text-lg">SC</AvatarFallback>
        </Avatar>
      </div>
      <div className="w-auto flex items-center flex-wrap md:flex-nowrap justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Settings className="mx-4 min-w-6 min-h-6 h-6 w-6 cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Adjust your SeneClass settings here
              </DialogDescription>
              <div className="flex flex-col space-y-4">
                <div className="flex mb-2 items-center">
                  <Speech className="mr-2" />
                  <label htmlFor="speed-tts" className="mr-2">
                    Speed of text to speech (*{rate})
                  </label>
                  <Slider
                    id="speed-tts"
                    defaultValue={[rate]}
                    onValueChange={(nums: number[]) => setRate(nums[0])}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="flex-grow"
                  />
                </div>
                <div className="flex items-center">
                  <BicepsFlexed className="mr-2" />
                  <label htmlFor="difficulty" className="mr-2">
                    Difficulty ({difficulty}/10)
                  </label>
                  <Slider
                    id="difficulty"
                    defaultValue={[difficulty]}
                    onValueChange={(nums: number[]) => setDifficulty(nums[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-grow"
                  />
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Switch
          checked={direction === "vertical"}
          onCheckedChange={() =>
            setDirection(direction === "vertical" ? "horizontal" : "vertical")
          }
          id="change-direction"
        />
        <label
          htmlFor="change-direction"
          className="whitespace-nowrap mx-2 mr-8 w-auto flex flex-row"
        >
          {direction === "vertical" ? <FlipVertical /> : <FlipHorizontal />}
        </label>
        <Select
          value={usedApi}
          onValueChange={(value: MODEL) => setUsedApi(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="canary">Chrome Canary</SelectItem>
            <SelectItem value="chatgpt">ChatGPT</SelectItem>
            { /** <SelectItem value="phi_35">Phi-3 (WebGPU)</SelectItem> */ }
          </SelectContent>
        </Select>
        {usedApi === "chatgpt" && (
          <Input
            type="password"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="ml-2"
          />
        )}
        {messages.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setMessages([])}
            className="ml-2"
          >
            Restart
          </Button>
        )}
        <ToggleTheme />
      </div>
    </div>
  );
};

export default Navigation;
