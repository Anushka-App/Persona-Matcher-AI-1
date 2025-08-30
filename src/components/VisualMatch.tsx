import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";
import ProductCarousel from "./ProductCarousel";
import { Product } from "@/types/product";
import { useNavigate } from 'react-router-dom';

const VisualMatch = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsLoading(true);
    try {
      const response = await fetch("/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "" }),
      });
      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }
      const data = await response.json();
      // Navigate to image results page with recommendations
      navigate('/results/image', { state: data.recommendations || [] });
      return;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      // On error, navigate with fallback mock data
      navigate('/results/image', {
        state: [
          { id: "1", name: "Style-Matched Crossbody", price: "$189", image: "/api/placeholder/300/300", link: "https://anuschkaleather.com" },
          { id: "2", name: "Complementary Tote", price: "$229", image: "/api/placeholder/300/300", link: "https://anuschkaleather.com" }
        ]
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (uploadedImage) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">
            Visual Style Matches
          </h2>
          <p className="font-body text-muted-foreground">
            Bags that complement your uploaded image
          </p>
        </div>

        {uploadedImage && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={uploadedImage}
                alt="Your uploaded style"
                className="w-48 h-48 object-cover rounded-lg border border-border"
              />
              <Button
                onClick={resetUpload}
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 bg-background border border-border rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <ProductCarousel products={[]} />

        <div className="text-center">
          <Button onClick={resetUpload} variant="outline">
            Try Another Image
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-heading text-3xl font-bold text-foreground">
          Upload Your Style Image
        </h2>
        <p className="font-body text-lg text-muted-foreground">
          Share a photo of your outfit, mood, or inspiration and we'll find matching handbags
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="text-6xl">📸</div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              Drop your image here or click to upload
            </h3>
            <p className="font-body text-muted-foreground">
              Supports JPG, PNG, and other image formats
            </p>
          </div>
          <Button variant="outline" className="mt-4">
            Choose File
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="font-body text-sm text-muted-foreground">
          💡 <strong>Pro tip:</strong> Upload photos of your outfits, color palettes, or mood boards for the best matches
        </p>
      </div>
    </div>
  );
};

export default VisualMatch;