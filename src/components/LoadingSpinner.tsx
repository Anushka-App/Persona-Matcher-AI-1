import { useState, useEffect } from 'react';

interface BagImage {
  url: string;
  name: string;
}

const LoadingSpinner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bagImages, setBagImages] = useState<BagImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real bag images from the API
  useEffect(() => {
    const fetchBagImages = async () => {
      try {
        const response = await fetch('/loading-images');
        if (response.ok) {
          const data = await response.json();
          if (data.images && data.images.length > 0) {
            setBagImages(data.images);
            setIsLoading(false);
          } else {
            // Fallback to static images if API returns empty
            setFallbackImages();
          }
        } else {
          console.warn('Failed to fetch loading images, using fallback');
          setFallbackImages();
        }
      } catch (err) {
        console.warn('Error fetching loading images, using fallback:', err);
        setFallbackImages();
      }
    };

    const setFallbackImages = () => {
      setBagImages([
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNhNDFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Dcm9zc2JvZHkgQmFnPC90ZXh0Pjwvc3ZnPg==', name: 'Crossbody Bag' },
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM2I4MmZkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ub3RlIEJhZzwvdGV4dD48L3N2Zz4=', name: 'Tote Bag' },
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjZWM0ODk5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbHV0Y2ggQmFnPC90ZXh0Pjwvc3ZnPg==', name: 'Clutch Bag' },
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjODk0N2U2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TYXRjaGVsIEJhZzwvdGV4dD48L3N2Zz4=', name: 'Satchel Bag' },
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjZjU5NzNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ib2JvIEJhZzwvdGV4dD48L3N2Zz4=', name: 'Hobo Bag' },
        { url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjMWE5OTNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYWNrcGFjayBCYWc8L3RleHQ+PC9zdmc+', name: 'Backpack Bag' }
      ]);
      setIsLoading(false);
    };

    fetchBagImages();
  }, []);

  // Rotate through images - slower rotation
  useEffect(() => {
    if (bagImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bagImages.length);
    }, 1200); // Slower: Change image every 1.2 seconds

    return () => clearInterval(interval);
  }, [bagImages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border rounded-full animate-spin border-t-primary"></div>
        </div>
        <div className="text-center">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            Loading...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="text-center">
          <h3 className="font-heading text-xl font-semibold text-foreground">
            Loading Images...
          </h3>
          <p className="text-muted-foreground">Please wait while we prepare your personalized experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      {/* Animated Bag Carousel */}
      <div className="relative w-48 h-48">
        {bagImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentImageIndex
              ? 'opacity-100 scale-100 z-10'
              : index === (currentImageIndex + 1) % bagImages.length
                ? 'opacity-60 scale-90 z-5 -translate-x-4'
                : index === (currentImageIndex - 1 + bagImages.length) % bagImages.length
                  ? 'opacity-60 scale-90 z-5 translate-x-4'
                  : 'opacity-30 scale-80 z-0'
              }`}
          >
            <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
                style={{
                  filter: index === currentImageIndex ? 'none' : 'blur(2px)',
                }}
                onError={(e) => {
                  // Fallback to a simple colored div if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">${image.name}</div>`;
                  }
                }}
              />
            </div>
          </div>
        ))}

        {/* Glowing effect around current bag */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse -z-10"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-3">
        <h3 className="font-heading text-2xl font-semibold text-foreground">
          🎨 Anuschka Matchmaker
        </h3>
        <p className="font-body text-muted-foreground max-w-md">
          Our AI stylist is analyzing your preferences and finding the perfect bags for your unique personality...
        </p>
        
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {bagImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-primary scale-125'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Loading animation */}
      <div className="flex items-center space-x-2 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
        <span className="text-sm">Processing your style profile...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;