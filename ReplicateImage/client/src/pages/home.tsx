import { useState } from "react";
import { Menu, Book, Github, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { GenerationForm } from "@/components/generation-form";
import { ResultsDisplay } from "@/components/results-display";
import { SyntaxHighlighter } from "@/components/ui/syntax-highlighter";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState("Make the sheets in the style of the logo. Make the scene natural.");

  const replicateCode = `import { writeFile } from "fs/promises";
import Replicate from "replicate";

const replicate = new Replicate();

const input = {
    prompt: "Make the sheets in the style of the logo. Make the scene natural.",
    image_input: [
        "https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png",
        "https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"
    ]
};

const output = await replicate.run("google/nano-banana", { input });

// To access the file URL:
console.log(output.url());
//=> "https://replicate.delivery/.../output.jpg"

// To write the file to disk:
await writeFile("output.jpg", output);
//=> output.jpg written to disk`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Replicate API Interface</h1>
                <p className="text-sm text-muted-foreground">Image Generation with nano-banana</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="secondary" data-testid="button-documentation">
                <Book className="mr-2 h-4 w-4" />
                Documentation
              </Button>
              <Button data-testid="button-github">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex min-h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onExampleClick={(examplePrompt) => {
            setPrompt(examplePrompt);
            setIsSidebarOpen(false);
          }} 
        />

        {/* Main Content */}
        <main className="flex-1 p-6 md:ml-0 ml-0 w-full">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Generation Form */}
            <GenerationForm 
              prompt={prompt} 
              onPromptChange={setPrompt} 
            />

            {/* Code Example */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <div className="h-6 w-6 mr-3 text-accent">💻</div>
                Implementation Code
              </h3>
              
              <div className="space-y-4">
                <SyntaxHighlighter code={replicateCode} language="javascript" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Click the copy button above to copy the code snippet
                  </span>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <ResultsDisplay />

            {/* Usage Guide */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <div className="h-6 w-6 mr-3 text-accent">📖</div>
                Usage Guide & Tips
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Getting Started */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Getting Started</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Install Dependencies</p>
                        <p className="text-sm text-muted-foreground">npm install replicate fs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Set API Token</p>
                        <p className="text-sm text-muted-foreground">Configure your Replicate API key</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Upload Images</p>
                        <p className="text-sm text-muted-foreground">Provide reference images for style transfer</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Best Practices</h4>
                  <div className="space-y-3">
                    <div className="bg-accent/10 border border-accent/20 rounded-md p-3">
                      <span className="text-sm">💡 Use high-quality reference images for better results</span>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                      <span className="text-sm">ℹ️ Be specific in your prompt descriptions</span>
                    </div>
                    <div className="bg-secondary/10 border border-secondary/20 rounded-md p-3">
                      <span className="text-sm">⏱️ Processing typically takes 30-60 seconds</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Handling */}
              <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2">Common Issues & Solutions</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-destructive mt-0.5">⚠️</span>
                    <span><strong>API key not found:</strong> Ensure REPLICATE_API_TOKEN is set in environment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-destructive mt-0.5">⚠️</span>
                    <span><strong>Image too large:</strong> Resize images to under 10MB before upload</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-destructive mt-0.5">⚠️</span>
                    <span><strong>Generation failed:</strong> Check image formats and prompt clarity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
