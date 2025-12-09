"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, Save, Cpu, Terminal } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const DEFAULT_ARDUINO_CODE = `void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Configure LED pin
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.println("ESP32 Initialized");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // Turn LED on
  delay(1000);                      // Wait for a second
  digitalWrite(LED_BUILTIN, LOW);   // Turn LED off
  delay(1000);                      // Wait for a second
  
  Serial.println("Tick...");
}`;

const DEFAULT_MICROPYTHON_CODE = `import machine
import time

led = machine.Pin(2, machine.Pin.OUT)

print("ESP32 Initialized (MicroPython)")

while True:
    led.value(1)
    time.sleep(1)
    led.value(0)
    time.sleep(1)
    print("Tick...")
`;

export default function FirmwareEditor() {
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(DEFAULT_ARDUINO_CODE);
    const [isFlashing, setIsFlashing] = useState(false);
    const [logs, setLogs] = useState<string[]>(["System ready."]);

    const handleLanguageChange = (value: string) => {
        setLanguage(value);
        setCode(value === "cpp" ? DEFAULT_ARDUINO_CODE : DEFAULT_MICROPYTHON_CODE);
        setLogs(prev => [...prev, `Switched to ${value === "cpp" ? "C++ (Arduino)" : "MicroPython"}`]);
    };

    const handleFlash = () => {
        setIsFlashing(true);
        setLogs(prev => [...prev, "Compiling firmware...", "Connecting to board...", "Erasing flash...", "Writing firmware..."]);

        setTimeout(() => {
            setIsFlashing(false);
            setLogs(prev => [...prev, "✅ Flash complete! Board resetting."]);
        }, 2000);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cpp">C++ (Arduino)</SelectItem>
                            <SelectItem value="python">MicroPython</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={handleFlash}
                        disabled={isFlashing}
                        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    >
                        {isFlashing ? <Cpu className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {isFlashing ? "Flashing..." : "Flash Firmware"}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" title="Save">
                        <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Download .bin">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="flex-1 border-r border-border">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Serial Monitor */}
                <div className="w-full md:w-80 bg-black text-green-500 font-mono text-xs flex flex-col border-t md:border-t-0">
                    <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-white/5">
                        <Terminal className="w-3 h-3" />
                        <span>Serial Monitor (115200 baud)</span>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className="break-all">
                                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                {log}
                            </div>
                        ))}
                    </div>
                    <div className="p-2 border-t border-white/10">
                        <input
                            type="text"
                            placeholder="Send command..."
                            className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
