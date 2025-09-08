import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CloudUpload, X, Image, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GenerationRequest } from "@shared/schema";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenerationFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

interface UploadedImage {
  url: string;
  name: string;
}

export function GenerationForm({ prompt, onPromptChange }: GenerationFormProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      const newImages = data.urls.map((url: string, index: number) => ({
        url,
        name: `image_${uploadedImages.length + index + 1}.jpg`
      }));
      setUploadedImages(prev => [...prev, ...newImages]);
      toast({
        title: "Images uploaded successfully",
        description: `${data.urls.length} image(s) added to your generation.`
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (request: GenerationRequest) => {
      const response = await apiRequest('POST', '/api/generations', request);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/generations'] });
      toast({
        title: "Generation started",
        description: "Your image is being generated. This may take 30-60 seconds."
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt describing the transformation you want.",
        variant: "destructive"
      });
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image for the generation.",
        variant: "destructive"
      });
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      imageUrls: uploadedImages.map(img => img.url)
    });
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Image className="mr-3 text-primary h-6 w-6" />
        Image Generation Interface
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-generation">
        {/* Prompt Input */}
        <div>
          <Label htmlFor="prompt" className="text-sm font-medium mb-2 block">
            Prompt
            <span className="text-muted-foreground ml-1">(Describe the transformation you want)</span>
          </Label>
          <Textarea
            id="prompt"
            rows={4}
            className="w-full resize-none"
            placeholder="Make the sheets in the style of the logo. Make the scene natural."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            data-testid="textarea-prompt"
          />
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Be specific about style, mood, and visual elements you want to achieve
          </p>
        </div>

        {/* Image Upload Area */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Input Images
            <span className="text-muted-foreground ml-1">(Upload or drop images here)</span>
          </Label>
          <div
            className="file-upload-area rounded-lg p-8 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="area-file-upload"
          >
            <div className="space-y-4">
              <CloudUpload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Drop images here or click to browse</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP up to 10MB each</p>
              </div>
              <Input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                data-testid="input-file"
              />
            </div>
          </div>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Uploaded ${image.name}`}
                    className="w-full h-32 object-cover rounded-lg"
                    data-testid={`img-preview-${index}`}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    data-testid={`button-remove-image-${index}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-background/80 text-xs px-2 py-1 rounded">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="w-full bg-muted/30 rounded-lg p-4 text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-medium">Advanced Options</span>
              <span className="text-muted-foreground">
                {isAdvancedOpen ? '−' : '+'}
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Quality</Label>
                <Select defaultValue="standard">
                  <SelectTrigger data-testid="select-quality">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Output Format</Label>
                <Select defaultValue="jpg">
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-4 text-lg font-semibold"
          disabled={generateMutation.isPending || uploadMutation.isPending}
          data-testid="button-generate"
        >
          {generateMutation.isPending ? (
            <>
              <div className="loading-spinner w-4 h-4 mr-2 rounded-full" />
              Generating...
            </>
          ) : (
            <>
              ✨ Generate Image
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
