import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Info, Sparkles, Heart, Palette, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showHoverPopup, setShowHoverPopup] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Ensure we have fallback values
  const productData = {
    id: product.id || product.artworkName || 'unknown',
    name: product.name || product.productName || product.artworkName || 'Anuschka Bag',
    artworkName: product.artworkName || product.name || 'Anuschka Artwork',
    productName: product.productName || product.name || 'Anuschka Bag',
    image: product.image || 'https://via.placeholder.com/400x300/f3f4f6/6b7280?text=No+Image',
    link: product.link || '#',
    price: product.price || '$150',
    description: product.description || product.personaDescription || 'Beautiful handcrafted bag with unique artwork design.',
    productType: product.productType || 'Bag'
  };

  // Debug logging - commented out to reduce console spam
  // console.log('ProductCard data:', {
  //   name: productData.artworkName,
  //   image: productData.image,
  //   description: productData.description.substring(0, 100) + '...'
  // });



  // Generate personality insights for the hover popup
  const getPersonalityInsights = () => {
    const insights = [];

    if (product.artworkPersonality) {
      insights.push({
        icon: <Sparkles className="w-4 h-4 text-purple-500" />,
        title: "Artwork Personality",
        content: product.artworkPersonality
      });
    }

    if (product.psychologicalAppeal) {
      insights.push({
        icon: <Heart className="w-4 h-4 text-pink-500" />,
        title: "Psychological Appeal",
        content: product.psychologicalAppeal
      });
    }

    if (product.personaDescription) {
      insights.push({
        icon: <Star className="w-4 h-4 text-yellow-500" />,
        title: "Persona Match",
        content: product.personaDescription
      });
    }

    if (product.description) {
      insights.push({
        icon: <Palette className="w-4 h-4 text-blue-500" />,
        title: "Style Characteristics",
        content: product.description
      });
    }

    // Add artwork-specific insights
    if (product.artworkName && product.artworkName !== product.name) {
      insights.push({
        icon: <Palette className="w-4 h-4 text-indigo-500" />,
        title: "Artwork Collection",
        content: `Part of the "${product.artworkName}" collection`
      });
    }

    return insights;
  };

  const personalityInsights = getPersonalityInsights();

  return (
    <div
      className="relative flex-shrink-0 w-full md:w-80 bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col min-h-96"
      onMouseEnter={() => setShowHoverPopup(true)}
      onMouseLeave={() => setShowHoverPopup(false)}
      onTouchStart={() => setShowHoverPopup(prev => !prev)} // Mobile toggle
    >
      {/* Hover Popup */}
      {showHoverPopup && personalityInsights.length > 0 && (
        <div className="absolute top-0 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 transform transition-all duration-200 opacity-100 scale-100
          md:left-full md:ml-4 
          left-1/2 -translate-x-1/2 md:translate-x-0
          max-w-[calc(100vw-2rem)] md:max-w-none">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-gray-800">Why This Bag Suits You</h4>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {personalityInsights.map((insight, index) => (
              <div key={index} className="border-l-4 border-primary/20 pl-3">
                <div className="flex items-center space-x-2 mb-1">
                  {insight.icon}
                  <span className="text-sm font-medium text-gray-700">{insight.title}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{insight.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              ✨ Perfect match for your personality and style preferences
            </p>
          </div>

          {/* Mobile close button */}
          <button
            className="md:hidden absolute top-2 right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowHoverPopup(false);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Product Image Container - Dynamic height to show actual image size */}
      <div className="relative w-full bg-gray-50 overflow-hidden">
        {!imageError ? (
          <img
            src={productData.image}
            alt={productData.name}
            className={`w-full h-auto max-h-96 object-contain group-hover:scale-105 transition-all duration-300 ${imageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            loading="eager"
            decoding="async"
            crossOrigin="anonymous"
            style={{
              imageRendering: 'crisp-edges',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
                         onLoad={() => {
               // console.log(`✅ Image loaded successfully: ${productData.artworkName}`);
               setImageLoading(false);
               setImageError(false);
             }}
             onError={(e) => {
               // console.warn(`❌ Image failed to load: ${productData.artworkName}`, productData.image);
               setImageLoading(false);
               setImageError(true);
             }}
          />
        ) : (
          <div className="w-full min-h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">{productData.artworkName}</p>
              <p className="text-xs text-gray-500 mt-1">{productData.productType}</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center min-h-48">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-xs text-gray-500">Loading image...</p>
            </div>
          </div>
        )}

        {/* Hover indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Info className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col flex-1">
        <div className="flex-1">
          {/* Simple: Artwork Name + Description (no pricing) */}
          <div className="space-y-2 h-full flex flex-col">
            <h3 className="font-heading text-lg md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 flex-shrink-0">
              {productData.artworkName}
            </h3>
            {productData.description && (
              <div className="flex-1 flex flex-col">
                {(() => {
                  const description = productData.description;
                  // More reliable truncation - use character length instead of sentence splitting
                  const maxLength = 200; // About 3-4 lines
                  const shouldTruncate = description.length > maxLength;
                  const displayText = shouldTruncate && !showFullDescription
                    ? description.substring(0, maxLength) + '...'
                    : description;

                                     // console.log('Description logic:', {
                   //   originalLength: description.length,
                   //   shouldTruncate,
                   //   showFullDescription,
                   //   maxLength
                   // });

                  return (
                    <div className="flex flex-col">
                      <div className={`font-body text-sm text-muted-foreground leading-relaxed ${showFullDescription ? 'overflow-y-auto max-h-32 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                        <p>{displayText}</p>
                      </div>
                      {shouldTruncate && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullDescription(!showFullDescription);
                            }}
                            className="text-primary hover:text-primary/80 text-xs font-medium transition-colors flex-shrink-0"
                          >
                            {showFullDescription ? 'Show less' : 'More...'}
                          </button>
                          {showFullDescription && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowFullDescription(false);
                              }}
                              className="text-gray-400 hover:text-gray-600 text-xs transition-colors flex-shrink-0 ml-1"
                              title="Close"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Button section - always at bottom */}
        <div className="pt-4 mt-4 flex-shrink-0">
          <Button
            onClick={() => {
              // Directly open product link without any popup
              if (productData.link && productData.link !== '#') {
                if (productData.link.startsWith('http')) {
                  window.open(productData.link, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = productData.link;
                }
              }
            }}
            className="w-full bg-gold hover:bg-gold/90 text-gold-foreground font-semibold px-4 md:px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] text-sm md:text-base"
          >
            View Product Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;