import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, X, RotateCcw, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeMaterialImage, type MaterialDetectionResult } from "@/services/aiMaterialDetection";

interface CameraScannerProps {
    onCapture: (imageData: string, aiResult?: MaterialDetectionResult) => void;
    onCancel?: () => void;
}

const CameraScanner = ({ onCapture, onCancel }: CameraScannerProps) => {
    const [mode, setMode] = useState<"select" | "camera" | "upload">("select");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<MaterialDetectionResult | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize camera
    const startCamera = async () => {
        setIsLoading(true);
        setError("");
        try {
            console.log("🎥 Requesting camera access...");

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false,
            });

            console.log("✅ Camera stream obtained:", mediaStream);
            console.log("📹 Video tracks:", mediaStream.getVideoTracks().length);

            setStream(mediaStream);
            setMode("camera"); // Set mode FIRST to render video element

            // Wait for video element to be mounted in DOM
            setTimeout(() => {
                if (videoRef.current) {
                    console.log("🎬 Assigning stream to video element...");
                    videoRef.current.srcObject = mediaStream;

                    // Try to play immediately
                    videoRef.current.muted = true;
                    videoRef.current.playsInline = true;

                    // Attempt 1: Try playing right away
                    videoRef.current.play().catch(err => {
                        console.warn("⚠️ Immediate play failed, waiting for metadata:", err);
                    });

                    // Attempt 2: Wait for metadata and play
                    videoRef.current.onloadedmetadata = () => {
                        console.log("📊 Video metadata loaded");
                        if (videoRef.current) {
                            videoRef.current.play()
                                .then(() => {
                                    console.log("✅ Video playing successfully!");
                                })
                                .catch((err) => {
                                    console.error("❌ Video play error:", err);
                                    setError("Unable to start video playback. Please try again.");
                                });
                        }
                    };
                } else {
                    console.error("❌ Video element not found after timeout!");
                }
            }, 200); // Wait 200ms for React to render video element
        } catch (err) {
            console.error("❌ Camera error:", err);
            if (err instanceof Error) {
                if (err.name === "NotAllowedError") {
                    setError("Camera permission denied. Please allow camera access or use file upload.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found. Please use file upload instead.");
                } else if (err.name === "NotReadableError") {
                    setError("Camera is already in use by another application.");
                } else {
                    setError(`Unable to access camera: ${err.message}. Please try file upload instead.`);
                }
            }
            setMode("select");
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup camera stream
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    // Capture photo from video stream
    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL("image/jpeg", 0.8);
                setCapturedImage(imageData);
                stopCamera();

                // Trigger AI analysis
                await analyzeImage(imageData);
            }
        }
    };

    // AI Analysis function
    const analyzeImage = async (imageData: string) => {
        setIsAnalyzing(true);
        setError("");

        try {
            console.log("🤖 Starting YOLOv5 analysis...");
            const result = await analyzeMaterialImage(imageData);
            setAiResult(result);
            console.log("✅ Analysis complete:", result);
        } catch (err) {
            console.error("AI analysis failed:", err);
            const errorMsg = err instanceof Error ? err.message : "Unknown error";
            setError(`AI detection failed: ${errorMsg}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Please select a valid image file (JPG, PNG, WebP)");
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError("Image size must be less than 10MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const result = event.target?.result as string;
                setCapturedImage(result);
                setMode("upload");

                // Trigger AI analysis
                await analyzeImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Confirm and send image to parent
    const confirmImage = () => {
        if (capturedImage) {
            onCapture(capturedImage, aiResult || undefined);
        }
    };

    // Retake/change photo
    const retake = () => {
        setCapturedImage(null);
        setAiResult(null);
        setError("");
        setMode("select");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">
                Scan Your Material
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
                Take a photo or upload an image of the material you're {" "}
                {window.location.pathname.includes("offering") ? "offering" : "listing"}
            </p>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode Selection */}
            {mode === "select" && !capturedImage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <button
                        onClick={startCamera}
                        disabled={isLoading}
                        className="p-8 rounded-2xl border-2 border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-semibold text-foreground mb-2">Use Camera</div>
                        <div className="text-sm text-muted-foreground">
                            {isLoading ? "Starting camera..." : "Take a photo now"}
                        </div>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-8 rounded-2xl border-2 border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-info to-violet-bloom flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-semibold text-foreground mb-2">Upload Image</div>
                        <div className="text-sm text-muted-foreground">
                            Choose from your device
                        </div>
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </motion.div>
            )}

            {/* Camera View */}
            {mode === "camera" && !capturedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Scan Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-8 border-2 border-primary/50 rounded-2xl">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary"></div>
                            </div>
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <p className="text-white text-sm bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                                    Position material within frame
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => { stopCamera(); setMode("select"); }}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button variant="hero" onClick={capturePhoto} className="flex-1 max-w-xs">
                            <Camera className="w-4 h-4 mr-2" />
                            Capture Photo
                        </Button>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />
                </motion.div>
            )}

            {/* Image Preview */}
            {capturedImage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                >
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-primary/20">
                        <img
                            src={capturedImage}
                            alt="Captured material"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                            <div className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis - Loading */}
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3"
                        >
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <div>
                                <p className="font-medium text-sm">Analyzing with YOLOv5...</p>
                                <p className="text-xs text-muted-foreground">Detecting objects and materials</p>
                            </div>
                        </motion.div>
                    )}

                    {/* AI Analysis - Results */}
                    {aiResult && !isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold">AI Detection Results</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground text-xs">Material:</p>
                                    <p className="font-medium">{aiResult.materialType}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Category:</p>
                                    <p className="font-medium capitalize">{aiResult.suggestedCategory}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Recyclable:</p>
                                    <p className={`font-medium ${aiResult.isRecyclable ? 'text-green-500' : 'text-orange-500'}`}>
                                        {aiResult.isRecyclable ? '✓ Yes' : '○ Reusable'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Confidence:</p>
                                    <p className="font-medium">{(aiResult.confidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                            {aiResult.estimatedWeight && (
                                <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
                                    📦 Est. Weight: {aiResult.estimatedWeight}
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={retake} className="flex-1">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake
                        </Button>
                        <Button variant="eco" onClick={confirmImage} className="flex-1">
                            <Check className="w-4 h-4 mr-2" />
                            Use This Photo
                        </Button>
                    </div>
                </motion.div>
            )}

            {onCancel && mode === "select" && (
                <div className="text-center">
                    <Button variant="ghost" onClick={onCancel}>
                        Skip for Now
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CameraScanner;
