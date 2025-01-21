"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useConfigStore } from "@/store/config-store";
import LoadingBar from "@/components/loading-bar";
import DebugPanel from "@/components/debug-panel";
import ReactMarkdown from "react-markdown";
import { BookPlus, Volume2, VolumeX, Mic, MicOff, LoaderPinwheel } from "lucide-react";
import { Message, DebugMessage } from "@/types";
import Navigation from "@/components/navigation";
import InfoAboutModel from "@/components/info-about-model";
import Ideas from "@/components/ideas";
import { getStudentPrompt } from "@/prompt";

declare global {
  interface Window {
    ai: {
      createTextSession: () => Promise<{
        prompt: (text: string) => Promise<string>;
      }>;
    };
  }
}

const SeneClass: React.FC = () => {
  const { direction, usedApi, rate, difficulty } = useConfigStore();
  const [topic, setTopic] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [additionalInfo, setAdditionalInfo] = useState<string>("");

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setAnswer(transcript);
      };
      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      setRecognition(recognitionInstance);
    } else {
      console.log("Speech recognition not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const addDebugMessage = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugMessages((prev) => [...prev, { timestamp, message }]);
  }, []);

  const generateResponse = async (prompt: string): Promise<string> => {
    addDebugMessage(`Generating response based on: ${prompt.slice(0, 50)}...`);

    if (usedApi === "chatgpt") {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } else {
      const model = await window.ai.createTextSession();
      return await model.prompt(prompt);
    }
  };

  const getAdditionalInfo = async (msg: Message): Promise<string> => {
    if (msg.additionalInfo) {
      setAdditionalInfo(msg.additionalInfo);
      return msg.additionalInfo;
    }
    const additionalInfoPrompt = `Provide detailed information to help
        answer the following question about ${topic}: "${msg.content}".
        Include key concepts, explanations, and examples if applicable.`;
    const additionalInfo = await generateResponse(additionalInfoPrompt);
    msg.additionalInfo = additionalInfo;
    setAdditionalInfo(msg.additionalInfo);
    return additionalInfo;
  };

  const handleTopicSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addDebugMessage("Topic submitted: " + topic);
    setIsLoading(true);
    try {
      setAnswer("");
      const initialPrompt = `You are a student learning about "${topic}". Ask a concise question about this topic.
        Make it a question that has ${difficulty}/10. The higher the difficulty the more you assume the teacher know about the subject.`;
      const studentQuestion = await generateResponse(initialPrompt);
      setMessages([{ role: "student", content: studentQuestion }]);
    } catch (error: any) {
      addDebugMessage("Error generating question: " + (error as Error).message);
      setMessages([
        {
          role: "student",
          content: `I'm having trouble answering the question ${error.toString()}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    addDebugMessage("Answer submitted");
    setIsLoading(true);
    try {
      const newMessage: Message = { role: "me", content: answer };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const studentPrompt = getStudentPrompt(answer, difficulty, topic);
      const studentQuestion = await generateResponse(studentPrompt);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "student", content: studentQuestion },
      ]);
      setAnswer("");
      setIsSpeaking(false);
    } catch (error) {
      addDebugMessage("Error generating question: " + (error as Error).message);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "student",
          content:
            "It seems I made a mistake, could you check the debug panel?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported in this browser.");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container h-[100vh] w-[100vw] mx-auto md:p-4 relative">
      <Navigation
        messages={messages}
        setMessages={setMessages}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      {messages.length == 0 && <Ideas setTopic={setTopic} />}
      <ResizablePanelGroup direction="vertical" className="h-full w-full">
        <ResizablePanel defaultSize={70}>
          <ResizablePanelGroup direction={direction}>
            <ResizablePanel defaultSize={50}>
              <Card className="rounded-none h-full">
                <CardHeader>
                  <CardTitle>
                    {messages.length == 0 ? "Choose Your Topic" : "Your Answer"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {false && !topic && <InfoAboutModel />}
                  {messages.length == 0 ? (
                    <form onSubmit={handleTopicSubmit}>
                      <div className="mb-2">
                        <label
                          htmlFor="topic"
                          className="block text-sm font-medium text-gray-700"
                        >
                          <span className="text-foreground">Topic </span>- with
                          a difficulty of {difficulty}/10
                        </label>
                        <Input
                          id="topic"
                          type="search"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="Enter the topic you'd like to teach"
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          isLoading || (usedApi == "chatgpt" && !apiKey)
                        }
                      >
                        {isLoading ? "Loading..." : "Start Teaching"}
                      </Button>
                      {usedApi == "chatgpt" && !apiKey && (
                        <div className="mt-2 text-sm text-muted-background">
                          You need an API key to use ChatGPT
                        </div>
                      )}
                    </form>
                  ) : (
                    <form onSubmit={handleAnswerSubmit}>
                      <div className="flex items-center mb-2">
                        <Textarea
                          value={answer}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => setAnswer(e.target.value)}
                          placeholder="Provide your answer or explanation here"
                          className="flex-grow mr-2"
                        />
                        <Button
                          type="button"
                          onClick={toggleListening}
                          variant={isListening ? "destructive" : "secondary"}
                        >
                          {isListening ? <MicOff /> : <Mic />}
                        </Button>
                      </div>
                      <Button onClick={handleAnswerSubmit} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Submit Answer"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <Card className="rounded-none h-full">
                <CardHeader>
                  <CardTitle>Teaching Session</CardTitle>
                  <LoadingBar loading={isLoading} />
                </CardHeader>
                <CardContent className="h-full">
                  <ScrollArea className="h-[calc(100%-2rem)]" type="scroll">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`first:mt-4 mb-2 p-2 rounded relative ${
                          msg.role === "student" ? "bg-muted" : "bg-blue-600"
                        }`}
                      >
                        <strong>
                          {msg.role === "student" ? "Student" : "You (Teacher)"}
                          :
                        </strong>{" "}
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        <div className="flex space-x-2 overflow-auto absolute right-2 -top-4">
                          {msg.role === "student" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => getAdditionalInfo(msg)}
                                >
                                  <span className="mr-2">Learn More</span>
                                  <BookPlus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Additional Information
                                  </DialogTitle>
                                  <DialogDescription>
                                    Here&apos;s more context to help answer the
                                    question:
                                  </DialogDescription>
                                  {additionalInfo && (
                                    <>
                                      {isSpeaking ? (
                                        <Button onClick={stopSpeaking}>
                                          <VolumeX className="mr-2" /> Stop
                                          Read{" "}
                                        </Button>
                                      ) : (
                                        <Button
                                          onClick={() =>
                                            speak(msg.additionalInfo || "")
                                          }
                                        >
                                          <Volume2 className="mr-2" /> Read
                                          Additional Info
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </DialogHeader>
                                {additionalInfo ? (
                                  <ReactMarkdown>
                                    {additionalInfo}
                                  </ReactMarkdown>
                                ) : (
                                  <div className="flex w-full text-center">
                                    {" "}
                                    <LoaderPinwheel className="animate-spin" />
                                    Loading Additional Info
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => speak(msg.content)}
                            disabled={isSpeaking}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={30}>
          <DebugPanel messages={debugMessages} />
        </ResizablePanel>
      </ResizablePanelGroup>
      {isSpeaking && (
        <Button className="fixed bottom-4 right-4 z-50" onClick={stopSpeaking}>
          Stop Speaking
        </Button>
      )}
    </div>
  );
};

export default SeneClass;
