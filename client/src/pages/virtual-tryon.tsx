import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { UploadArea } from "@/components/upload-area";
import { VirtualTryOn } from "@/components/virtual-tryon";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function VirtualTryOnPage() {
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const { toast } = useToast();

  const handleClothingUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setClothingImage(result);
      if (result && personImage) {
        setShowGenerate(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePersonUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPersonImage(result);
      if (result && clothingImage) {
        setShowGenerate(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: "Sua imagem do provador virtual está sendo baixada."
    });
  };

  const handleGenerate = () => {
    setShowGenerate(false);
    setIsProcessing(true);
    // O processamento será feito automaticamente pelo VirtualTryOn quando as props mudarem
  };

  const progress = (clothingImage ? 1 : 0) + (personImage ? 1 : 0);
  const isComplete = progress === 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <h1 className="hero-title">
                Provador Virtual
              </h1>
            </div>
            <p className="hero-subtitle max-w-2xl mx-auto">
              Veja como as roupas ficam em você instantaneamente. Faça upload de uma peça de roupa e sua foto para criar uma prévia realista.
            </p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${progress >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className={`w-3 h-3 rounded-full transition-colors ${progress >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
          </div>
          <p className="text-center text-sm text-gray-600">
            Passo {progress} de 2: {progress === 0 ? 'Faça upload das suas imagens' : progress === 1 ? 'Faça upload da segunda imagem' : 'Pronto para gerar'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Areas */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="fade-in-up">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Escolha a Peça de Roupa
                  </h3>
                  <UploadArea
                    type="clothing"
                    onImageUpload={handleClothingUpload}
                    uploadedImage={clothingImage}
                    isProcessing={isProcessing}
                  />
                </div>

                <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Envie Sua Foto
                  </h3>
                  <UploadArea
                    type="person"
                    onImageUpload={handlePersonUpload}
                    uploadedImage={personImage}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              {/* Tips */}
              <div className="fashion-card p-6 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h4 className="font-semibold mb-3">💡 Dicas para melhores resultados:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use fotos claras e bem iluminadas</li>
                  <li>• Fotos de corpo inteiro funcionam melhor para pessoas</li>
                  <li>• Peças de roupa com fundos simples são ideais</li>
                  <li>• Certifique-se de que a pessoa está de frente</li>
                </ul>
              </div>
            </div>

            {/* Preview Area */}
            <div className="fade-in-up" style={{ animationDelay: '0.6s' }}>
              <VirtualTryOn
                clothingImage={clothingImage}
                personImage={personImage}
                onDownload={handleDownload}
                shouldProcess={!showGenerate}
                onProcessingComplete={() => setIsProcessing(false)}
              />
              
              {/* Botão de Gerar */}
              {showGenerate && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={handleGenerate}
                    className="fashion-button text-lg px-8 py-4"
                    data-testid="button-generate"
                  >
                    <Wand2 className="w-5 h-5 mr-3" />
                    Gerar Provador Virtual
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          {isComplete && !showGenerate && !isProcessing && (
            <div className="text-center mt-12 fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="fashion-card p-8 max-w-md mx-auto">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">Perfeito!</h3>
                <p className="text-gray-600 mb-6">
                  Seu provador virtual está pronto. Ajuste a posição se necessário e baixe quando estiver satisfeito com o resultado.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button 
                    className="fashion-button-secondary"
                    onClick={() => {
                      setClothingImage(null);
                      setPersonImage(null);
                      setShowGenerate(false);
                    }}
                    data-testid="button-try-another"
                  >
                    Tentar Outra
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Todo o processamento acontece no seu navegador. Suas imagens nunca são enviadas para nossos servidores.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}