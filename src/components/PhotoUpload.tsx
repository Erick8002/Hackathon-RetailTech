import { Camera, X, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface PhotoUploadProps {
  onPhotoCapture: (base64: string) => void;
  hasPhoto: boolean;
  photoPreview?: string;
}

export function PhotoUpload({ onPhotoCapture, hasPhoto, photoPreview }: PhotoUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(photoPreview);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      alert("Não foi possível acessar a câmera. Tente outra forma de upload.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL("image/jpeg");
        setPreview(base64);
        onPhotoCapture(base64);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreview(base64);
        onPhotoCapture(base64);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor, selecione uma imagem PNG ou JPG válida.");
    }
  };

  const clearPhoto = () => {
    setPreview(undefined);
    onPhotoCapture("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl border-2 border-ledger-green bg-gray-100">
          <img
            src={preview}
            alt="Foto do produto"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute right-2 top-2 rounded-lg bg-ledger-red p-1.5 text-white hover:bg-ledger-red/90"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-center font-mono text-sm font-bold text-ledger-green">
          ✓ Foto capturada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isCameraActive ? (
        <div className="space-y-2 rounded-2xl border-4 border-dashed border-ledger-blue bg-ledger-blue/5 p-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-40 w-full rounded-lg bg-black object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ledger-green py-2 font-bold text-white"
            >
              <Camera className="size-5" />
              Capturar Foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-ink/20 bg-white py-2 font-bold"
            >
              <X className="size-5" />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-ink/20 bg-white hover:border-ledger-blue hover:bg-ledger-blue/5 transition-colors"
          >
            <Camera className="size-8" strokeWidth={2} />
            <span className="font-black uppercase tracking-tight">Tirar Foto</span>
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink/10 bg-white font-bold uppercase hover:bg-ink/5 transition-colors"
            >
              <Upload className="size-5" />
              Upload PNG/JPG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}