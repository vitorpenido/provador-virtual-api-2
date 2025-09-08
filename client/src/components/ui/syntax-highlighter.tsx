import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./button";

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
}

export function SyntaxHighlighter({ code, language = "javascript" }: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const highlightCode = (code: string) => {
    return code
      .replace(/(import|export|const|let|var|await|async|function|class|if|else|for|while|return|try|catch|throw|new)/g, 
        '<span class="code-token-keyword">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g, 
        '<span class="code-token-string">$1</span>')
      .replace(/(\w+)(?=\()/g, 
        '<span class="code-token-function">$1</span>')
      .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, 
        '<span class="code-token-comment">$1</span>')
      .replace(/(\w+)(?=:)/g, 
        '<span class="code-token-property">$1</span>');
  };

  return (
    <div className="syntax-highlight rounded-lg p-4 overflow-x-auto relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0"
        onClick={handleCopy}
        data-testid="button-copy-code"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre className="text-sm font-mono">
        <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
      </pre>
    </div>
  );
}
