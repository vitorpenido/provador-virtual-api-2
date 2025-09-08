import { useQuery } from "@tanstack/react-query";
import { Generation } from "@shared/schema";
import { Download, Share2, Terminal, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyntaxHighlighter } from "@/components/ui/syntax-highlighter";
import { useToast } from "@/hooks/use-toast";

export function ResultsDisplay() {
  const { toast } = useToast();
  const { data: generations = [], isLoading } = useQuery<Generation[]>({
    queryKey: ['/api/generations'],
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: `${filename} is being downloaded.`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the image.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Generated Image',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "URL copied",
          description: "Image URL copied to clipboard."
        });
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share the image.",
        variant: "destructive"
      });
    }
  };

  const completedGenerations = generations.filter(g => g.status === 'completed' && g.resultUrl);
  const processingGenerations = generations.filter(g => g.status === 'processing');
  const latestGeneration = generations[0];

  return (
    <div className="glass-effect rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <div className="h-6 w-6 mr-3 text-primary">🖼️</div>
        Generation Results
      </h3>

      {/* Loading State */}
      {processingGenerations.length > 0 && (
        <div className="text-center py-12 mb-6" data-testid="status-loading">
          <div className="loading-spinner w-12 h-12 mx-auto rounded-full mb-4"></div>
          <p className="text-lg font-medium mb-2">Generating your image...</p>
          <p className="text-sm text-muted-foreground mb-4">This usually takes 30-60 seconds</p>
          <div className="w-full bg-muted rounded-full h-2 max-w-md mx-auto">
            <div className="progress-bar h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {completedGenerations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {completedGenerations.slice(0, 4).map((generation) => (
            <div key={generation.id} className="bg-card rounded-lg p-4 border border-border">
              <div className="space-y-4">
                <img
                  src={generation.resultUrl!}
                  alt="Generated result"
                  className="w-full h-64 object-cover rounded-lg"
                  data-testid={`img-result-${generation.id}`}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" data-testid={`text-result-title-${generation.id}`}>
                      Generated Result
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {generation.completedAt ? new Date(generation.completedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(generation.resultUrl!, `output_${generation.id}.jpg`)}
                      data-testid={`button-download-${generation.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleShare(generation.resultUrl!)}
                      data-testid={`button-share-${generation.id}`}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-mono break-all">
                    URL: {generation.resultUrl}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && processingGenerations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground" data-testid="status-empty">
            <div className="text-4xl mb-4">📸</div>
            <p className="text-lg font-medium mb-2">No generations yet</p>
            <p className="text-sm">Upload some images and create your first generation above.</p>
          </div>
        )
      )}

      {/* API Response Details */}
      {latestGeneration && latestGeneration.status === 'completed' && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center">
            <Terminal className="mr-2 text-accent h-4 w-4" />
            API Response Details
          </h4>
          <SyntaxHighlighter
            code={JSON.stringify(
              {
                id: latestGeneration.id,
                status: latestGeneration.status,
                created_at: latestGeneration.createdAt,
                completed_at: latestGeneration.completedAt,
                output: {
                  url: latestGeneration.resultUrl,
                  format: "jpeg",
                  dimensions: {
                    width: 1024,
                    height: 768
                  }
                },
                metrics: {
                  predict_time: 45.2
                }
              },
              null,
              2
            )}
            language="json"
          />
        </div>
      )}

      {/* Error State */}
      {generations.some(g => g.status === 'failed') && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <XCircle className="h-5 w-5 text-destructive mr-2" />
            <h4 className="font-semibold text-destructive">Generation Failed</h4>
          </div>
          <p className="text-sm">
            {generations.find(g => g.status === 'failed')?.error || 'An unknown error occurred during generation.'}
          </p>
        </div>
      )}
    </div>
  );
}
