import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else {
        setError("Unable to access camera. Please make sure your device has a camera.");
      }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);

    // Stop the stream while reviewing
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera(facingMode);
  };

  const handleFlip = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    startCamera(next);
  };

  const handleConfirm = () => {
    if (!captured) return;
    // Convert data URL to File
    fetch(captured)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      });
  };

  if (error) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <Camera className="size-12 text-muted-foreground mx-auto" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="ghost" onClick={onCancel}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative glass-card overflow-hidden rounded-2xl">
        {!captured ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-[3/4] object-cover bg-muted"
          />
        ) : (
          <img src={captured} alt="Captured receipt" className="w-full aspect-[3/4] object-cover" />
        )}

        {/* Viewfinder overlay */}
        {!captured && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-accent/30 rounded-xl" />
            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-accent-foreground/70 bg-background/50 mx-auto w-fit px-3 py-1 rounded-full">
              Position receipt within the frame
            </p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-center gap-3">
        {!captured ? (
          <>
            <Button variant="ghost" onClick={onCancel} size="icon" className="size-12 rounded-full">
              <X className="size-5" />
            </Button>
            <Button onClick={handleCapture} size="icon" className="size-16 rounded-full bg-accent hover:bg-accent/90">
              <Camera className="size-6" />
            </Button>
            <Button variant="ghost" onClick={handleFlip} size="icon" className="size-12 rounded-full">
              <RotateCcw className="size-5" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={handleRetake}>
              <RotateCcw className="size-4" /> Retake
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="size-4" /> Use this photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
