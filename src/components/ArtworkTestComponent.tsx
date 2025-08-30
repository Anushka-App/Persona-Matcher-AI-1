import React, { useEffect, useState } from 'react';
import { artworkDataService, ArtworkTheme, ProductType } from '@/services/artworkDataService';
import { Product } from '@/types/product';

const ArtworkTestComponent: React.FC = () => {
  const [themes, setThemes] = useState<ArtworkTheme[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    // Test the artwork service
    const testService = () => {
      console.log('🧪 Testing Artwork Service...');
      
      // Get themes
      const artworkThemes = artworkDataService.getArtworkThemes();
      console.log('🎨 Artwork Themes:', artworkThemes);
      setThemes(artworkThemes);
      
      // Get product types
      const types = artworkDataService.getProductTypes();
      console.log('👜 Product Types:', types);
      setProductTypes(types);
      
      // Get recommendations
      const recs = artworkDataService.getPersonalizedRecommendations(
        'Animal',
        'Bag',
        'Adventurous',
        'Positive',
        5
      );
      console.log('🎯 Recommendations:', recs);
      setRecommendations(recs);
    };

    testService();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Artwork Service Test</h1>
      
      {/* Themes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🎨 Available Artwork Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div key={theme.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="text-2xl mb-2">{theme.icon}</div>
              <h3 className="font-semibold">{theme.label}</h3>
              <p className="text-sm text-gray-600">{theme.description}</p>
              <p className="text-xs text-gray-500 mt-2">Count: {theme.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Types */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">👜 Available Product Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productTypes.map((type) => (
            <div key={type.id} className="p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl mb-2">{type.icon}</div>
              <h3 className="font-semibold">{type.label}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🎯 Sample Recommendations (Adventurous + Animal + Bag)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((product) => (
            <div key={product.id} className="p-4 border rounded-lg bg-green-50">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.productName}</p>
              <p className="text-sm text-gray-500">{product.price}</p>
              {product.description && (
                <p className="text-xs text-gray-600 mt-2">{product.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        Check the console for detailed service logs
      </div>
    </div>
  );
};

export default ArtworkTestComponent;
