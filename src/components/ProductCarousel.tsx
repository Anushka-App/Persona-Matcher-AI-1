import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  products: Product[];
}

const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Show ALL products from LLM backend - no duplicate filtering
  // The backend already provides carefully selected and randomized products
  const uniqueProducts = products;

  // Debug logging to track products - commented out to reduce console spam
  // console.log(`🔍 ProductCarousel Debug:`, {
  //   originalCount: products.length,
  //   displaying: products.length,
  //   sampleProducts: products.slice(0, 3).map(p => ({
  //     id: p.id,
  //     name: p.name,
  //     productName: p.productName,
  //     artworkName: p.artworkName
  //   }))
  // });

  // Display all products from backend (should be 12)
  const displayProducts = uniqueProducts;

  // console.log(`📊 Final display products count: ${displayProducts.length}`);

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Check initial state
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
      }
    };
  }, [displayProducts.length]);

  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-body text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Desktop: Horizontal scrolling with arrow navigation */}
      <div className="hidden md:block">
        <div className="relative w-full">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide w-full"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex gap-6 pb-4 px-2 w-max">
              {displayProducts.map((product, index) => (
                <div key={`${product.id || product.name || ''}-${index}`} className="flex-shrink-0 w-80">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Instructions */}
        {displayProducts.length > 4 && (
          <div className="text-center font-body text-sm text-muted-foreground mt-4">
            <p className="text-xs text-gray-500">
              Use arrow buttons to scroll through all {displayProducts.length} recommendations
            </p>
          </div>
        )}
      </div>

      {/* Mobile: Vertical scrolling */}
      <div className="md:hidden">
        <div className="grid grid-cols-1 gap-6">
          {displayProducts.map((product, index) => (
            <div key={`mobile-${product.id || product.name || ''}-${index}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {displayProducts.length > 4 && (
          <p className="text-center font-body text-sm text-muted-foreground mt-4">
            Scroll down to see all {displayProducts.length} recommendations ↓
          </p>
        )}
      </div>

    </div>
  );
};

export default ProductCarousel;