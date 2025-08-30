import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Upload, Camera, Image, RotateCcw, CameraOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
// import LoadingSpinner from "./LoadingSpinner"; // Removed - no longer needed
import SharedHeader from "./SharedHeader";

const ImageUploadPage = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMethod, setUploadMethod] = useState<'upload' | 'camera' | null>(null);
    // const [isLoading, setIsLoading] = useState(false); // Removed - no longer needed
    
    // Camera states
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [videoReady, setVideoReady] = useState(false);
    
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Questions data - moved to separate page
    // const questions = [ ... ]; // Removed

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setUploadMethod('upload');
            // Don't show questions immediately - wait for user to click "Find Match"
            // setShowQuestions(false); // Removed
            // Reset camera if it was active
            if (cameraActive) {
                stopCamera();
            }
        }
    };

    const startCamera = async () => {
        try {
            setCameraError(null);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user', // Use front camera for selfies
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 }
                } 
            });
            
            setCameraStream(stream);
            setCameraActive(true);
            
            // Wait a bit for the stream to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                // Ensure video loads properly
                videoRef.current.onloadedmetadata = () => {
                    setVideoReady(true);
                    if (videoRef.current) {
                        videoRef.current.play().then(() => {
                            // Video playing successfully
                        }).catch(e => {
                            console.error('Video play error:', e);
                        });
                    }
                };
                
                // Fallback if onloadedmetadata doesn't fire
                videoRef.current.oncanplay = () => {
                    setVideoReady(true);
                    if (videoRef.current && videoRef.current.paused) {
                        videoRef.current.play().catch(e => console.error('Video play error:', e));
                    }
                };
                
                // Force play after a short delay
                setTimeout(() => {
                    if (videoRef.current && videoRef.current.paused) {
                        videoRef.current.play().catch(e => console.error('Video play error:', e));
                    }
                }, 500);
            }
        } catch (error) {
            console.error('🎥 Camera access error:', error);
            let errorMessage = 'Camera access denied. Please allow camera permissions.';
            
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No camera found on your device.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'Camera is already in use by another application.';
                }
            }
            
            setCameraError(errorMessage);
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setCameraActive(false);
        setCapturedImage(null);
        setVideoReady(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Create file from blob
                        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                        setSelectedFile(file);
                        
                        // Get data URL for preview
                        const dataUrl = canvas.toDataURL('image/jpeg');
                        setCapturedImage(dataUrl);
                        
                        // Don't show questions immediately - wait for user to click "Find Match"
                        // setShowQuestions(false); // Removed
                        
                        // Stop camera after capture
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    const handleCameraCapture = async () => {
        setUploadMethod('camera');
        setSelectedFile(null);
        setCapturedImage(null);
        
        // Automatically start camera when camera option is selected
        await startCamera();
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setSelectedFile(null);
        startCamera();
    };

    const handleUpload = async () => {
        // This function is no longer needed here since questions are on separate page
        // The actual upload logic will be handled on the questions page
    };

    // Reset function to upload new image
    const resetUpload = () => {
        setSelectedFile(null);
        setUploadMethod(null);
        setCapturedImage(null);
        setVideoReady(false);
        if (cameraActive) {
            stopCamera();
        }
    };

    // These functions are no longer needed here - moved to questions page
    // const handleOptionSelect = (questionId: number, optionValue: string) => { ... }; // Removed
    // const handleQuestionsSubmit = () => { ... }; // Removed
    // const canProceed = () => { ... }; // Removed

    // Removed isLoading check and LoadingSpinner
        return (
        <div className="min-h-screen bg-background">
            <SharedHeader />
            
            {/* Hero Banner */}
            <div className="w-full relative overflow-hidden h-[40vh] min-h-[300px] max-h-[600px] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] xl:h-[60vh] 2xl:h-[65vh]">
                {/* Background image */}
                <img
                    src="/Untitled (Graph) (2) copy.png"
                    alt="Two stylish young women posing outdoors with city skyline background"
                    className="w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center xl:object-center 2xl:object-center"
                    loading="eager"
                    style={{
                        objectPosition: 'center 25%'
                    }}
                />
                {/* Subtle gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10"></div>
            </div>

            <div id="upload-section" className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center">
                            <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl font-bold text-palo-primary mb-4">Quick Match</h2>
                        <p className="text-muted-foreground text-lg">Share your style with our expert stylist for a personalized handbag recommendation.</p>
                            </div>
                    
                    <Card className="w-full max-w-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Choose Your Style</CardTitle>
                            <CardDescription>
                                Select how you'd like to share your style with our expert stylist
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Upload Method Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Upload Image Option */}
                                <div 
                                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        uploadMethod === 'upload' 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                                    }`}
                                    onClick={() => {
                                        setUploadMethod('upload');
                                        setSelectedFile(null);
                                        if (cameraActive) {
                                            stopCamera();
                                        }
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Image className="w-8 h-8 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Upload Image</h3>
                                        <p className="text-sm text-gray-600">Choose an existing photo from your device</p>
                                    </div>
                                </div>

                                {/* Take Selfie/Photo Option */}
                                <div 
                                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        uploadMethod === 'camera' 
                                            ? 'border-purple-500 bg-purple-50' 
                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                                    }`}
                                    onClick={handleCameraCapture}
                                >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Camera className="w-8 h-8 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">Take Selfie/Photo</h3>
                                            <p className="text-sm text-gray-600">Capture a new photo with your camera</p>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Input - Only show when upload method is selected */}
                            {uploadMethod === 'upload' && (
                                <div className="space-y-3">
                                    <Label htmlFor="picture" className="text-sm font-medium">Select Image</Label>
                                    <Input 
                                        id="picture" 
                                        type="file" 
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                        className="cursor-pointer"
                                    />
                        </div>
                            )}

                            {/* Camera Preview and Capture */}
                            {uploadMethod === 'camera' && !capturedImage && (
                                <div className="space-y-4">
                                    {cameraError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                            {cameraError}
                    </div>
                                    )}
                                    
                                    {!cameraActive && !cameraError && (
                                        <div className="text-center p-8 bg-purple-50 rounded-lg border-2 border-dashed border-purple-200">
                                            <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                            <p className="text-purple-700 font-medium">Camera ready</p>
                                            <p className="text-sm text-purple-600 mt-2">Click to activate camera</p>
                                            <Button
                                                onClick={startCamera}
                                                className="mt-4 bg-purple-600 hover:bg-purple-700"
                                                size="sm"
                                            >
                                                <Camera className="w-4 h-4 mr-2" />
                                                Activate Camera
                                            </Button>
                </div>
                                    )}
                                    
                                    {cameraActive && (
                                        <div className="space-y-4">
                                            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full h-80 object-cover"
                                                    style={{ transform: 'scaleX(-1)' }} // Mirror the video for selfie view
                                                />
                                                {/* Loading overlay while video initializes */}
                                                {!videoReady && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                                        <div className="text-center text-white">
                                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                                            <p className="text-sm">Initializing camera...</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Camera overlay with capture guide */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="border-2 border-white/50 rounded-full w-48 h-48 flex items-center justify-center">
                                                        <div className="border-2 border-white/30 rounded-full w-40 h-40"></div>
            </div>
                        </div>
                                                {/* Camera status indicator */}
                                                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                    ● LIVE
                        </div>
                    </div>

                                            <div className="flex gap-3 justify-center">
                                                <Button
                                                    onClick={stopCamera}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <CameraOff className="w-4 h-4 mr-2" />
                                                    Stop Camera
                                                </Button>
                                                <Button
                                                    onClick={capturePhoto}
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                    size="lg"
                                                    disabled={!videoReady}
                                                >
                                                    <Camera className="w-5 h-5 mr-2" />
                                                    Take Photo
                                                </Button>
                                            </div>
                                            
                                            <div className="text-center text-sm text-gray-600">
                                                <p>Position yourself in the center circle for the best photo</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                </div>
                            )}

                            {/* File Preview - Shows after file selection, before questions */}
                    {selectedFile && (
                                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-foreground mb-3">
                                            {uploadMethod === 'camera' ? 'Photo captured!' : `Selected: ${selectedFile.name}`}
                                        </p>
                                        {uploadMethod === 'upload' && (
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                                className="rounded-md max-h-48 mx-auto border border-border shadow-sm"
                                            />
                                        )}
                                        {uploadMethod === 'camera' && capturedImage && (
                                            <div className="relative inline-block">
                                                <img
                                                    src={capturedImage}
                                                    alt="Captured photo"
                                                    className="rounded-md max-h-48 mx-auto border border-border shadow-sm"
                                                />
                                                <Button
                                                    onClick={retakePhoto}
                                                    variant="outline"
                                                    size="sm"
                                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-3">
                                            Click "Find Match" below to get personalized recommendations
                                        </p>
                                    </div>
                        </div>
                    )}

                            {/* Questions Interface - Now shows after clicking "Find Match" */}
                            {/* Removed */}
                </CardContent>
                        <CardFooter className="flex flex-col space-y-3">
                            {/* Show different buttons based on state */}
                            {!selectedFile && (
                                <div className="text-center text-sm text-muted-foreground">
                                    <p>Please select an image or take a photo to continue</p>
                                </div>
                            )}
                            
                            {selectedFile && (
                            <div className="flex gap-3 w-full">
                                <Button
                                    onClick={resetUpload}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Reset
                                </Button>
                    <Button
                                        onClick={() => {
                                            // Navigate to questions page with file data
                                            navigate('/upload/questions', {
                                                state: {
                                                    selectedFile,
                                                    uploadMethod,
                                                    capturedImage
                                                }
                                            });
                                        }}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    >
                                        Find Match ✨
                    </Button>
                            </div>
                            )}
                            
                            {/* Removed */}
                </CardFooter>
            </Card>
                </div>
            </div>
            
            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default ImageUploadPage;
