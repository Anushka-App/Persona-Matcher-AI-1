import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { RotateCcw } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import SharedHeader from "./SharedHeader";
import httpClient from "@/lib/http";

const UploadQuestionsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedFile, uploadMethod, capturedImage } = location.state || {};
    
    const [isLoading, setIsLoading] = useState(false);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    


    // Questions data
    const questions = [
        {
            id: 1,
            text: "If you had to choose one forever bag, which would you pick? What type of bag would be your perfect companion?",
            options: [
                { value: "everyday", label: "Everyday bag (versatile for anything)", description: "→ Bag" },
                { value: "tote", label: "Tote bag (big carry-all)", description: "→ Tote" },
                { value: "crossbody", label: "Crossbody (hands-free)", description: "→ Crossbody" },
                { value: "pouch", label: "Pouch (small essentials)", description: "→ Pouch" },
                { value: "techcase", label: "Tech case (protects devices)", description: "→ Case" },
                { value: "hobo", label: "Hobo bag (soft & slouchy)", description: "→ Hobo" }
            ]
        },
        {
            id: 2,
            text: "What's the occasion you're preparing for today?",
            options: [
                {
                    value: "romantic",
                    label: "Romantic Date",
                    description: "A cozy dinner or outing with someone special"
                },
                {
                    value: "wedding",
                    label: "Wedding/Elegant Event",
                    description: "A formal celebration like a wedding or gala"
                },
                {
                    value: "special",
                    label: "Special Night Out",
                    description: "Dinners, parties, or an artistic evening"
                },
                {
                    value: "casual",
                    label: "Casual Day Out",
                    description: "Coffee runs, errands, or a relaxed day with friends"
                },
                {
                    value: "professional",
                    label: "Professional Engagement",
                    description: "Business meetings or conferences"
                },
                {
                    value: "creative",
                    label: "Creative Event",
                    description: "Artistic exhibitions or events to showcase your style"
                }
            ]
        }
    ];

    const handleOptionSelect = (questionId: number, optionValue: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionValue
        }));
        
        // Automatically move to next question after a short delay
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
            } else {
                // All questions answered, proceed to upload
                handleUpload();
            }
        }, 500); // 500ms delay for smooth transition
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // All questions answered, proceed to upload
            handleUpload();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const canProceed = () => {
        const currentQ = questions[currentQuestion];
        return answers[currentQ.id];
    };

    const calculateProgress = () => {
        return ((currentQuestion + 1) / questions.length) * 100;
    };

    const handleUpload = async () => {
        if (selectedFile) {
            setIsLoading(true);
            try {
                // Add a minimum loading time to ensure the animation is visible
                const startTime = Date.now();
                const minLoadingTime = 2000; // 2 seconds minimum

                // Get user preferences for recommendations
                const bagType = answers[1];
                const occasion = answers[2];
                
                // Create a proper user description for the backend
                const userDescription = `Style-conscious individual looking for ${bagType} bag for ${occasion || 'everyday'} use`;
                
                // Log payload for debugging
                console.log('🎯 Sending recommendations request with payload:', {
                    bagType: bagType,
                    occasion: occasion,
                    description: userDescription
                });
                
                const response = await httpClient.post('/recommendations', {
                    description: userDescription,
                    bagType: bagType,
                    occasion: occasion
                });

                if (response.error) {
                    throw new Error(response.error);
                }

                const data = response.data as {
                    recommendations?: Array<Record<string, unknown>>;
                    explanation?: string;
                    userProfile?: {
                        personality?: string;
                        sentiment?: string;
                    };
                    markdownReport?: string;
                };

                // Ensure minimum loading time has passed
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < minLoadingTime) {
                    await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
                }

                // Create personality report data
                const personalityReport = {
                    bagType: bagType,
                    occasion: occasion,
                    answers: answers,
                    timestamp: new Date().toISOString(),
                    imageFile: selectedFile.name,
                    uploadMethod: uploadMethod
                };

                // Navigate to results page with recommendations and personality report
                navigate('/results/text', {
                    state: {
                        products: data.recommendations || [],
                        explanation: data.explanation || 'These handbag selections are carefully chosen to complement your style preferences.',
                        userProfile: {
                            personality: data.userProfile?.personality || 'Style-conscious individual',
                            sentiment: data.userProfile?.sentiment || 'Confident and stylish'
                        },
                        personalityReport: personalityReport,
                        markdownReport: data.markdownReport || null,
                        fromUpload: true
                    }
                });
            } catch (err) {
                console.error(err);
                // Mock data for demo - navigate to results page
                const personalityReport = {
                    bagType: answers[1],
                    occasion: answers[2],
                    answers: answers,
                    timestamp: new Date().toISOString(),
                    imageFile: selectedFile.name,
                    uploadMethod: uploadMethod
                };

                navigate('/results/text', {
                    state: {
                        products: [
                            { id: '1', name: 'Artisan Floral Crossbody', price: '$199', image: '/api/placeholder/300/300', link: 'https://anuschkaleather.com' },
                            { id: '2', name: 'Elegant Evening Clutch', price: '$159', image: '/api/placeholder/300/300', link: 'https://anuschkaleather.com' }
                        ],
                        explanation: 'These handbag selections are carefully chosen to complement your style preferences.',
                        userProfile: {
                            personality: 'Style-conscious individual',
                            sentiment: 'Confident and stylish'
                        },
                        personalityReport: personalityReport,
                        markdownReport: null,
                        fromUpload: true
                    }
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const goBack = () => {
        navigate('/upload');
    };

    if (!selectedFile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No File Selected</h2>
                    <p className="text-muted-foreground mb-4">Please go back and select an image first.</p>
                    <Button onClick={goBack}>Go Back to Upload</Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <LoadingSpinner />
                <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">Our stylist is analyzing your style...</p>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    const isAnswered = answers[currentQ.id];
    const canProceedToNext = isAnswered;
    const isLastQuestion = currentQuestion === questions.length - 1;

    // Render question options in the same style as personality quiz
    const renderOptions = () => {
        return currentQ.options.map((option, index) => (
            <button
                key={index}
                onClick={() => handleOptionSelect(currentQ.id, option.value)}
                disabled={isLoading}
                className="w-full p-4 md:p-6 mb-3 md:mb-4 text-left bg-card border-2 border-border rounded-xl hover:bg-accent hover:border-palo-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-body transform hover:scale-105 hover:shadow-lg animate-fade-in group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-palo-accent/5 to-palo-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Floating particles */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-palo-accent rounded-full opacity-0 group-hover:opacity-60 animate-ping" />
                <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-palo-secondary rounded-full opacity-0 group-hover:opacity-60 animate-ping" style={{ animationDelay: '0.5s' }} />
                
                <div className="relative z-10">
                    <div className="text-base md:text-lg font-medium text-foreground group-hover:text-palo-primary transition-colors duration-300">
                        {option.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 group-hover:text-palo-secondary transition-colors duration-300">
                        {option.description}
                    </div>
                </div>
            </button>
        ));
    };

    return (
        <div className="min-h-screen bg-background">
            <SharedHeader />
            
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl font-bold text-palo-primary mb-4">Find Your Perfect Match</h2>
                        <p className="text-muted-foreground text-lg">Help us understand your preferences for the best recommendations.</p>
                    </div>
                    
                    {/* Questions Interface - Matching Personality Quiz Style */}
                    <div className="w-full max-w-2xl relative">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 overflow-hidden -z-10">
                            <div className="absolute top-10 left-5 w-48 h-48 bg-palo-accent/8 rounded-full blur-2xl animate-pulse" />
                            <div className="absolute bottom-10 right-5 w-64 h-64 bg-palo-secondary/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-palo-primary/6 rounded-full blur-xl animate-bounce" style={{ animationDelay: '0.5s' }} />
                        </div>

                        <Card className="w-full border-2 border-border shadow-xl relative z-10 animate-fade-in">
                            {/* Floating decorative elements on card */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-palo-accent to-palo-secondary rounded-full opacity-30 animate-float" />
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-palo-secondary to-palo-accent rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
                            
                            <CardHeader className="text-center p-6 md:p-8">
                                <h3 className="font-heading text-xl md:text-2xl font-bold text-palo-primary mb-4 animate-fade-in">
                                    Style Preferences Quiz
                                </h3>
                                <div className="mb-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-palo-accent to-palo-secondary h-2 md:h-3 rounded-full transition-all duration-700 ease-out animate-pulse"
                                            style={{ width: `${calculateProgress()}%` }}
                                        />
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground mt-2 animate-fade-in">
                                        Question {currentQuestion + 1} of {questions.length} • {Math.round(calculateProgress())}% Complete
                                    </p>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6 md:p-8">
                                <h2 className="font-heading text-lg md:text-2xl font-bold text-center mb-6 md:mb-8 text-palo-primary animate-fade-in">
                                    {currentQ.text}
                                </h2>
                                
                                <div className="space-y-3 md:space-y-4">
                                    {renderOptions()}
                                </div>
                            </CardContent>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center p-6 border-t">
                                <Button
                                    onClick={goBack}
                                    variant="outline"
                                    className="px-6"
                                >
                                    ← Back to Upload
                                </Button>
                                
                                <div className="text-sm text-gray-500">
                                    {currentQuestion + 1} of {questions.length}
                                </div>
                            </div>
                        </Card>
                    </div>
                    

                </div>
            </div>
        </div>
    );
};

export default UploadQuestionsPage;
