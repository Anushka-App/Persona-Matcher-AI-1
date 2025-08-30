import { useLocation, useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import SharedHeader from './SharedHeader';
import ProductCarousel from './ProductCarousel';
import { Share2 } from 'lucide-react';

const TextResultsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as {
        products?: Product[];
        explanation?: string;
        userProfile?: {
            personality?: string;
            artworkTheme?: string;
            artworkThemeLabel?: string;
            productType?: string;
            productTypeLabel?: string;
            enhancedBagType?: string;
            llmInsights?: string;
            styleInsights?: string;
            personalizedAdvice?: string;
            matchConfidence?: number;
        };
        fromUpload?: boolean;
        personalityReport?: {
            userName: string;
            userMobile: string;
            bagType: string;
            occasion: string;
            answers: { [key: number]: string };
            timestamp: string;
            imageFile: string;
            uploadMethod: string;
        };
        markdownReport?: string;
    };
    const products = locationState?.products || [];
    const explanation = locationState?.explanation || '';
    const personality = locationState?.userProfile?.personality || 'your personality';
    const fromUpload = locationState?.fromUpload || false;
    const personalityReport = locationState?.personalityReport;
    const markdownReport = locationState?.markdownReport;



    // Share functionality
    const handleShareReport = async () => {
        try {
            console.log('🔍 Starting share functionality...');

            // Create comprehensive share text with product details
            let shareText = `🎭 **Anuschka MatchMaker Results** 👜\n\n`;

            // Priority 1: Use the markdownReport that's already displayed on the page
            if (markdownReport && markdownReport.trim()) {
                console.log('📝 Using current markdownReport from page display');
                shareText += `**✨ Complete AI-Generated Personality Report:**\n\n${markdownReport}\n\n`;
            } else {
                console.log('📝 No markdownReport on page, generating comprehensive report...');

                // Priority 2: Generate a comprehensive personality report
                const comprehensiveReport = `## Your Personality: ${personality}

## Personality Overview
You are a ${personality} who embodies a unique blend of style and personality traits. Your approach to fashion and life reflects your distinctive character and preferences.

## Detailed Trait Analysis

### Luxury Leaning
**Level:** Moderate to High
**How This Shows Up in Your Life:** You appreciate quality and craftsmanship in your choices, gravitating toward pieces that offer both aesthetic appeal and practical value.
**Your Luxury Leaning in Action:** You carefully consider the materials, construction, and design details when making purchasing decisions.
**Strengths & Considerations:** Your appreciation for quality ensures long-lasting satisfaction, though it may require thoughtful budgeting.

### Competence
**Level:** High
**How This Shows Up in Your Life:** You approach decisions systematically, valuing efficiency and reliability in both your personal style and daily routines.
**Your Competence in Action:** You prefer well-organized accessories with practical features that enhance your daily functionality.
**Strengths & Considerations:** Your systematic approach ensures consistent, reliable choices that serve you well.

### Sophistication
**Level:** Moderate to High
**How This Shows Up in Your Life:** You appreciate refined aesthetics and cultural depth, seeking pieces that reflect your understanding of style and substance.
**Your Sophistication in Action:** You gravitate toward timeless designs with subtle, elegant details that speak to your refined taste.
**Strengths & Considerations:** Your sophisticated eye helps you make choices that remain relevant and stylish over time.

### Boldness
**Level:** Moderate
**How This Shows Up in Your Life:** You're willing to make statements with your style choices, embracing unique pieces that reflect your individuality.
**Your Boldness in Action:** You're not afraid to choose distinctive accessories that set you apart while maintaining your overall aesthetic.
**Strengths & Considerations:** Your boldness adds character to your style, creating memorable and distinctive looks.

## Style Profile
Your style reflects a sophisticated approach to fashion, where quality meets personality. You appreciate pieces that offer both aesthetic appeal and practical functionality, creating a wardrobe that serves your lifestyle while expressing your unique character.

## Lifestyle Insights
Your personality traits manifest in a balanced approach to life and style. You value quality and craftsmanship, make thoughtful decisions, appreciate refined aesthetics, and aren't afraid to express your individuality through your choices.

## Personal Growth Opportunities
- Continue to balance quality with budget considerations
- Explore new ways to express your boldness while maintaining sophistication
- Leverage your competence to create efficient, stylish systems
- Embrace opportunities to showcase your unique personality through your style choices`;

                shareText += `**✨ Complete AI-Generated Personality Report:**\n\n${comprehensiveReport}\n\n`;
            }

            // Only share the personality report, not the product recommendations
            shareText += `\n✨ Generated by Anuschka's AI Style Matchmaker`;

            console.log('📤 Final share text:', shareText);
            console.log('📤 Share text length:', shareText.length);

            if (navigator.share) {
                navigator.share({
                    title: 'My Anuschka MatchMaker Results',
                    text: shareText
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    navigator.clipboard.writeText(shareText);
                    alert('Complete report copied to clipboard!');
                });
            } else {
                navigator.clipboard.writeText(shareText);
                alert('Complete report copied to clipboard!');
            }
        } catch (error) {
            console.error('Error in share functionality:', error);
            // Fallback to basic sharing
            const fallbackText = `🎭 **Anuschka MatchMaker Results** 👜\n\n**🎭 Your Style Profile:**\n${personality}\n\n✨ Discover your perfect bag match with Anuschka's AI Style Matchmaker!`;

            if (navigator.share) {
                navigator.share({
                    title: 'My Anuschka MatchMaker Results',
                    text: fallbackText
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    navigator.clipboard.writeText(fallbackText);
                    alert('Results copied to clipboard!');
                });
            } else {
                navigator.clipboard.writeText(fallbackText);
                alert('Results copied to clipboard!');
            }
        }
    };

    // Split explanation into a couple of short paragraphs if available
    const buildParagraphs = (text: string): string[] => {
        if (!text) return [];
        const sentences = text.split(/\.\s+/).filter(Boolean);
        if (sentences.length <= 2) return [text];
        const first = sentences.slice(0, 2).join('. ') + '.';
        const second = sentences.slice(2).join('. ');
        return [first, second.endsWith('.') ? second : second + '.'];
    };
    const paragraphs = buildParagraphs(explanation);

    return (
        <div className="min-h-screen bg-white">
            <SharedHeader />

            {/* Hero Banner */}
            <div className="w-full relative overflow-hidden bg-gradient-to-r from-purple-100 to-purple-200" style={{ height: '400px' }}>
                <img
                    src="/anuschka-matchmaker-banner copy.png"
                    alt="Anuschka MatchMaker promotional banner with mermaid and elephant handbags"
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="container mx-auto px-4 py-10">
                {products.length > 0 ? (
                    <>
                        {/* Complete LLM-Generated Personality Report */}
                        {markdownReport ? (
                            <div className="max-w-4xl mx-auto mb-8">
                                <div className="rounded-2xl border border-[#F0EAF4] bg-[#FBFAFC] p-6 md:p-8">
                                    <div className="text-center mb-6">
                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full mb-4">
                                            ✨ AI-Generated Complete Report
                                        </span>
                                    </div>

                                    {/* Parse and display the markdown report */}
                                    <div className="prose prose-purple max-w-none">
                                        {markdownReport.split('\n').map((line, index) => {
                                            // Handle headers
                                            if (line.startsWith('## ')) {
                                                const title = line.replace('## ', '');
                                                return (
                                                    <h2 key={index} className="text-xl md:text-2xl font-heading font-semibold text-[#6A1B9A] mb-4 mt-6">
                                                        {title}
                                                    </h2>
                                                );
                                            }
                                            // Handle subheaders
                                            if (line.startsWith('### ')) {
                                                const title = line.replace('### ', '');
                                                return (
                                                    <h3 key={index} className="text-lg md:text-xl font-heading font-medium text-[#6A1B9A] mb-3 mt-4">
                                                        {title}
                                                    </h3>
                                                );
                                            }
                                            // Handle bullet points
                                            if (line.startsWith('- ')) {
                                                const content = line.replace('- ', '');
                                                return (
                                                    <div key={index} className="flex items-start mb-2">
                                                        <span className="text-[#6A1B9A] mr-2 mt-1">•</span>
                                                        <p className="text-[#4A4A4A] leading-relaxed">{content}</p>
                                                    </div>
                                                );
                                            }
                                            // Handle bold text
                                            if (line.includes('**')) {
                                                const parts = line.split('**');
                                                return (
                                                    <p key={index} className="text-[#4A4A4A] leading-relaxed mb-3">
                                                        {parts.map((part, i) =>
                                                            i % 2 === 1 ? (
                                                                <strong key={i} className="text-[#6A1B9A]">{part}</strong>
                                                            ) : (
                                                                <span key={i}>{part}</span>
                                                            )
                                                        )}
                                                    </p>
                                                );
                                            }
                                            // Handle regular paragraphs
                                            if (line.trim()) {
                                                return (
                                                    <p key={index} className="text-[#4A4A4A] leading-relaxed mb-3">
                                                        {line}
                                                    </p>
                                                );
                                            }
                                            // Handle empty lines
                                            return <div key={index} className="h-3"></div>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Fallback header for when no LLM report is available */}
                                <div className="text-center mb-6">
                                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#2B1B44]">
                                        {personality && personality !== 'your personality' && personality !== 'Style-conscious individual'
                                            ? `${personality} - Your Perfect Bag Match`
                                            : 'Bags that are a Perfect Match'
                                        }
                                    </h1>
                                    <p className="mt-2 text-[#2B1B44]">Curated by our Anuschka MatchMaker</p>
                                </div>



                                <div className="text-center mb-6">
                                    <h2 className="text-xl md:text-2xl font-heading font-semibold text-[#6A1B9A]">
                                        Why These Bags Match Your Style
                                    </h2>
                                </div>
                            </>
                        )}

                        {/* Explanatory copy - Only show when no LLM report is available */}
                        {!markdownReport && (
                            <div className="max-w-4xl mx-auto text-[#4A4A4A] space-y-4 mb-10 leading-relaxed">
                                {paragraphs.length > 0 ? (
                                    <>
                                        {paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center mb-4">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                                📝 General Description
                                            </span>
                                        </div>
                                        <p>
                                            These handbag selections are carefully chosen to complement {personality}. Each bag offers unique style elements—from practical compartments to eye-catching artistic details—that enhance your personal aesthetic and daily functionality.
                                        </p>
                                        <p>
                                            These pieces will seamlessly integrate into your wardrobe, offering both versatility and character that match your distinctive style approach.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Products grid container */}
                        <div className="max-w-6xl mx-auto">
                            <div className="rounded-2xl border border-[#F0EAF4] bg-[#FBFAFC] p-6 md:p-8">

                                {/* Artwork Theme and Product Type Summary */}
                                {locationState?.userProfile?.artworkTheme && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                                        <div className="text-center">
                                            <h3 className="font-heading text-xl font-semibold text-purple-800 mb-2">
                                                🎨 Your Artwork Selection
                                            </h3>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-purple-700">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                                                    Theme: <strong>{locationState.userProfile.artworkTheme}</strong>
                                                </span>
                                                {locationState?.userProfile?.productType && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                                                        Style: <strong>{locationState.userProfile.productType}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <ProductCarousel products={products} />
                            </div>
                        </div>


                    </>
                ) : (
                    <div className="text-center py-12">
                        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                            No Recommendations Found
                        </h1>
                        <p className="font-body text-muted-foreground">
                            We couldn't find products that match your preferences. Please try again.
                        </p>
                    </div>
                )}

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                    {fromUpload && (
                        <Button
                            onClick={() => navigate('/upload')}
                            size="lg"
                            variant="outline"
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                            Upload New Image
                        </Button>
                    )}
                    <Button
                        onClick={() => navigate('/')}
                        size="lg"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Back to Home
                    </Button>
                    <Button
                        onClick={() => navigate('/circle')}
                        size="lg"
                        className="bg-[#6A1B9A] hover:bg-[#5b1584] text-white"
                    >
                        Join Anuschka Circle
                    </Button>
                    {/* Share button for all results */}
                    <Button
                        onClick={handleShareReport}
                        size="lg"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Share2 className="mr-2 h-4 w-4" /> Share Report
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TextResultsPage;
