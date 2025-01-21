"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, LoaderPinwheel } from "lucide-react";
import { useConfigStore } from "@/store/config-store";
import { ModelInfo, modelInfoMap } from "@/types";
import { pipeline } from "@xenova/transformers";

const InfoAboutModel = () => {
  const { usedApi } = useConfigStore();
  const model: ModelInfo = modelInfoMap[usedApi] || modelInfoMap.canary;
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const loadModel = async () => {
    setIsLoading(true);
    setLoadingProgress(0);

    try {
      const generate = await pipeline(
        "text-generation",
        "Xenova/Phi-3-mini-4k-instruct",
        {
          quantized: false,
          progress_callback: (progress: number) => {
            setLoadingProgress(Math.round(progress * 100));
          },
        }
      );

      setModelLoaded(true);
      setGeneratedText("Model loaded successfully! Try generating some text.");
    } catch (error) {
      console.error("Error loading model:", error);
      setGeneratedText("Error loading model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateText = async () => {
    if (!modelLoaded) return;

    setGeneratedText("Generating...");
    try {
      // const result = await pipeline("Hello, how are you?", {
      //   max_new_tokens: 50,
      //   temperature: 0.7,
      // });
      // setGeneratedText(result[0].generated_text);
    } catch (error) {
      console.error("Error generating text:", error);
      setGeneratedText("Error generating text. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Brain className="w-6 h-6 mr-2" />
          <h2 className="text-xl font-bold">{model.longModelName}</h2>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{model.modelInstruction}</p>
        {model.modelName === "phi_35" && (
          <div className="mt-4">
            <p className="mb-2">
              We need to load the Phi-3 model using WebGPU. This may take a
              moment.
            </p>
            <Button
              onClick={loadModel}
              disabled={isLoading || modelLoaded}
              className="w-full mb-2"
            >
              {isLoading ? (
                <>
                  <LoaderPinwheel className="animate-spin" />
                  Loading... {loadingProgress}%
                </>
              ) : modelLoaded ? (
                "Model Loaded"
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Load Model
                </>
              )}
            </Button>
            {isLoading && (
              <div className="mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            )}
            {modelLoaded && (
              <Button onClick={generateText} className="w-full mt-2">
                Generate Text
              </Button>
            )}
            {generatedText && (
              <div className="mt-4 p-2 bg-gray-100 rounded">
                <p>{generatedText}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoAboutModel;
