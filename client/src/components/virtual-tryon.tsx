import { useEffect, useState } from "react";
import { Download, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { compressImage, dataURLtoBlob } from "@/utils/imageCompression";

interface VirtualTryOnProps {
  clothingImage?: string | null;
  personImage?: string | null;
  onDownload?: (dataUrl: string) => void;
  shouldProcess?: boolean;
  onProcessingComplete?: () => void;
}

interface Generation {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  resultUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function VirtualTryOn({ 
  clothingImage, 
  personImage, 
  onDownload, 
  shouldProcess = false,
  onProcessingComplete 
}: VirtualTryOnProps) {
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Query para buscar o status da geração
  const { data: generation } = useQuery<Generation>({
    queryKey: ['/api/generations', generationId],
    enabled: !!generationId,
    refetchInterval: 2000, // Refazer a cada 2 segundos
  });

  useEffect(() => {
    if (generation?.status === 'completed' || generation?.status === 'failed') {
      console.log('Generation completed:', generation);
      onProcessingComplete?.();
    }
  }, [generation?.status, onProcessingComplete]);

  useEffect(() => {
    if (shouldProcess && clothingImage && personImage) {
      handleGenerate();
    }
  }, [shouldProcess, clothingImage, personImage]);

  const handleGenerate = async () => {
    if (!clothingImage || !personImage) return;

    setIsUploading(true);
    
    try {
      // Upload das imagens
      const formData = new FormData();
      
      // Converter data URLs para blobs e comprimir
      const personBlob = await dataURLtoBlob(personImage);
      const clothingBlob = await dataURLtoBlob(clothingImage);
      
      // Comprimir imagens antes do upload
      const personFile = new File([personBlob], 'person.jpg', { type: 'image/jpeg' });
      const clothingFile = new File([clothingBlob], 'clothing.jpg', { type: 'image/jpeg' });
      
      const compressedPersonFile = await compressImage(personFile, 1024, 0.8);
      const compressedClothingFile = await compressImage(clothingFile, 1024, 0.8);
      
      console.log('Tamanhos originais:', personFile.size, clothingFile.size);
      console.log('Tamanhos comprimidos:', compressedPersonFile.size, compressedClothingFile.size);
      
      formData.append('images', compressedPersonFile, 'person.jpg');
      formData.append('images', compressedClothingFile, 'clothing.jpg');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro no upload das imagens');
      }

      const { urls } = await uploadResponse.json();

      // Criar geração com prompt fixo
      const generationResponse = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: "Coloque de forma realista a roupa da segunda imagem na pessoa da primeira imagem. O caimento deve ser natural. Não mude o rosto ou o fundo da pessoa.",
          imageUrls: urls,
        }),
      });

      if (!generationResponse.ok) {
        throw new Error('Erro ao criar geração');
      }

      const newGeneration = await generationResponse.json();
      setGenerationId(newGeneration.id);
      
    } catch (error) {
      console.error('Erro na geração:', error);
      onProcessingComplete?.();
    } finally {
      setIsUploading(false);
    }
  };


  const handleDownload = () => {
    if (generation?.resultUrl && onDownload) {
      // Para URLs do Replicate, criar link direto
      const link = document.createElement('a');
      link.download = 'provador-virtual-resultado.png';
      link.href = generation.resultUrl;
      link.target = '_blank';
      link.click();
    }
  };

  const handleReset = () => {
    setGenerationId(null);
  };

  const hasImages = clothingImage && personImage;
  const isProcessing = isUploading || generation?.status === 'processing' || generation?.status === 'pending';
  const hasResult = generation?.status === 'completed' && generation.resultUrl;
  const hasError = generation?.status === 'failed';

  return (
    <div className="w-full">
      <div className="fashion-card p-6">
        <h3 className="text-xl font-semibold text-center mb-6">
          Pré-visualização do Provador Virtual
        </h3>
        
        <div className="preview-container mx-auto relative" style={{ minHeight: 400 }}>
          {hasResult && generation.resultUrl && (
            <img
              src={generation.resultUrl}
              alt="Resultado do Provador Virtual"
              className="image-preview w-full h-full rounded-lg"
              data-testid="result-image"
              onLoad={() => console.log('Imagem carregada com sucesso')}
              onError={(e) => console.error('Erro ao carregar imagem:', e, generation.resultUrl)}
            />
          )}

          {isProcessing && (
            <div className="processing-overlay">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">
                  {isUploading ? 'Enviando imagens...' : 'Criando seu provador virtual...'}
                </p>
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Isso levará alguns segundos' : 'A IA está processando suas imagens'}
                </p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">❌</div>
                <p className="text-lg font-medium text-red-600">
                  Erro na geração
                </p>
                <p className="text-sm text-gray-500">
                  {generation.error || 'Tente novamente'}
                </p>
              </div>
            </div>
          )}

          {!hasImages && !isProcessing && !hasResult && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="text-6xl mb-4">👗</div>
                <p className="text-lg font-medium text-gray-600">
                  Faça upload das duas imagens para ver a mágica
                </p>
                <p className="text-sm text-gray-500">
                  Seu provador virtual aparecerá aqui
                </p>
              </div>
            </div>
          )}
        </div>

        {(hasResult || hasError) && (
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
            
            {hasResult && (
              <Button
                onClick={handleDownload}
                className="fashion-button"
                data-testid="button-download"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}