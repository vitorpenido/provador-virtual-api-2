import { useState, useRef } from "react";
import { Upload, Image, User, Check } from "lucide-react";

interface UploadAreaProps {
  type: "clothing" | "person";
  onImageUpload: (file: File) => void;
  uploadedImage?: string | null;
  isProcessing?: boolean;
}

export function UploadArea({ type, onImageUpload, uploadedImage, isProcessing }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isClothing = type === "clothing";
  const title = isClothing ? "Enviar Roupa" : "Enviar Sua Foto";
  const subtitle = isClothing 
    ? "Adicione a peça que você quer experimentar" 
    : "Foto de corpo inteiro funciona melhor";
  const icon = isClothing ? <Image className="w-8 h-8" /> : <User className="w-8 h-8" />;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`upload-area cursor-pointer ${isDragOver ? 'dragover' : ''} ${uploadedImage ? 'has-image' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid={`upload-area-${type}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          data-testid={`file-input-${type}`}
        />

        {uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt={`Uploaded ${type}`}
              className="image-preview max-h-48 mx-auto"
              data-testid={`preview-${type}`}
            />
            {isProcessing && (
              <div className="processing-overlay">
                <div className="text-center">
                  <div className="loading-dots">
                    <div style={{ "--i": 0 } as React.CSSProperties}></div>
                    <div style={{ "--i": 1 } as React.CSSProperties}></div>
                    <div style={{ "--i": 2 } as React.CSSProperties}></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Processando...</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {subtitle}
            </p>
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">
                Clique ou arraste para enviar
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG até 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}