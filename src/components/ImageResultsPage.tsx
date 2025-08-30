import { useLocation, useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import ProductCarousel from './ProductCarousel';
import { Button } from '@/components/ui/button';

const ImageResultsPage = () => {
    const navigate = useNavigate();
    // Extract navigation state: products array and explanation text
    // Extract navigation state: products array and explanation text
    const locationState = useLocation().state as { products?: Product[]; explanation?: string };
    const products = locationState.products || [];
    const explanation = locationState.explanation || '';

    return (
        <div className="min-h-screen bg-background pt-8">
            <div className="container mx-auto px-4">

                {products.length > 0 ? (
                    <>
                        <ProductCarousel products={products} />

                        {/* Detailed explanation of matches */}
                        {explanation && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <h2 className="font-heading text-2xl font-bold mb-4 text-blue-800">
                                    Why These Products Suit You
                                </h2>
                                <div className="prose prose-blue max-w-none">
                                    <p className="font-body text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                                        {explanation}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-center text-muted-foreground">No recommendations found.</p>
                )}
                <div className="flex justify-center mt-8">
                    <Button onClick={() => navigate('/upload')} size="lg">
                        Upload Another Image
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImageResultsPage;
