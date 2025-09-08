import { Bot, Settings, Lightbulb, History, Clock, CheckCircle } from "lucide-react";
import { Generation } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  isOpen: boolean;
  onExampleClick: (prompt: string) => void;
}

export function Sidebar({ isOpen, onExampleClick }: SidebarProps) {
  const { data: recentGenerations = [] } = useQuery<Generation[]>({
    queryKey: ['/api/generations'],
  });

  const examples = [
    { 
      prompt: "Make the sheets look elegant and modern", 
      icon: "✨", 
      label: "Elegant & Modern" 
    },
    { 
      prompt: "Create a natural outdoor scene", 
      icon: "🌿", 
      label: "Natural Scene" 
    },
    { 
      prompt: "Apply artistic style transformation", 
      icon: "🎨", 
      label: "Artistic Style" 
    },
  ];

  return (
    <aside className={`sidebar w-80 bg-card border-r border-border fixed md:relative md:translate-x-0 h-full z-40 overflow-y-auto ${isOpen ? 'open' : ''}`}>
      <div className="p-6">
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="glass-effect rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2 text-primary h-5 w-5" />
              API Configuration
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  Model
                </label>
                <div className="bg-muted rounded-md px-3 py-2 text-sm font-mono">
                  google/nano-banana
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm text-accent-foreground">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="glass-effect rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Lightbulb className="mr-2 text-accent h-5 w-5" />
              Quick Examples
            </h3>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-md transition-colors text-sm"
                  onClick={() => onExampleClick(example.prompt)}
                  data-testid={`button-example-${index}`}
                >
                  <span className="mr-2">{example.icon}</span>
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="glass-effect rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <History className="mr-2 text-secondary h-5 w-5" />
              Recent Results
            </h3>
            <div className="space-y-3">
              {recentGenerations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent generations</p>
              ) : (
                recentGenerations.slice(0, 3).map((generation) => (
                  <div key={generation.id} className="flex items-center space-x-3 p-2 bg-muted/30 rounded-md">
                    <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                      {generation.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-generation-${generation.id}`}>
                        {generation.prompt.slice(0, 20)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {generation.createdAt ? new Date(generation.createdAt).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
