// src/components/ImageUpload.tsx
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Maximize, Minimize } from 'lucide-react';
import { Card } from './ui/Card';

interface ImageUploadProps {
  onImageSelect: (file: File, imageUrl: string) => void;
  onRemove?: () => void;
  currentImage?: string | null;
  loading?: boolean;
  maxSizeMB?: number;
}

const DEFAULT_MAX_MB = 10;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onRemove,
  currentImage = null,
  loading = false,
  maxSizeMB = DEFAULT_MAX_MB
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [useCover, setUseCover] = useState(false); // toggle between contain and cover

  useEffect(() => {
    setPreviewUrl(currentImage ?? null);
  }, [currentImage]);

  const readAsDataUrl = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => { r.abort(); reject(new Error('Failed to read file')); };
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setWarning(null);
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setWarning(`File too large (${sizeMB.toFixed(1)} MB). Max ${maxSizeMB} MB.`);
      // still proceed — preview and pass file to parent
    }

    // prefer objectURL for speed / memory
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file, url);
      return;
    } catch {
      // fallback
    }

    try {
      const data = await readAsDataUrl(file);
      setPreviewUrl(data);
      onImageSelect(file, data);
    } catch (err) {
      console.error('Preview failed', err);
      setPreviewUrl(null);
      onImageSelect(file, '');
    }
  }, [maxSizeMB, onImageSelect, readAsDataUrl]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void handleFile(f);
    if (inputRef.current) inputRef.current.value = '';
  }, [handleFile]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  }, [handleFile]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleRemove = useCallback((ev?: React.MouseEvent) => {
    ev?.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      try { URL.revokeObjectURL(previewUrl); } catch {}
    }
    setPreviewUrl(null);
    setWarning(null);
    if (onRemove) onRemove();
  }, [previewUrl, onRemove]);

  return (
    <Card className={`relative p-0 overflow-hidden ${dragOver ? 'ring-2 ring-blue-300' : ''}`}>
      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-center p-2 bg-white cursor-pointer"
        style={{ minHeight: 520 }} // larger display area so image appears big
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* IMAGE PREVIEW */}
        {previewUrl ? (
          <div className="relative w-full flex justify-center items-center">
            {/* top-right controls: remove + toggle fit */}
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, display: 'flex', gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setUseCover(prev => !prev); }}
                title={useCover ? 'Switch to fit (contain)' : 'Switch to fill (cover)'}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center"
                aria-label="Toggle fit"
              >
                {useCover ? <Minimize className="w-4 h-4 text-gray-700" /> : <Maximize className="w-4 h-4 text-gray-700" />}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(e); }}
                title="Remove"
                className="w-10 h-10 rounded-full"
                aria-label="Remove image"
                style={{ background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* large image container */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '14px 18px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: 780,        // allow bigger than before so looks large on desktop
                  height: 'min(78vh, 760px)', // responsive height; use large viewport fraction
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  overflow: 'hidden',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
                }}
              >
                <img
                  src={previewUrl}
                  alt="Uploaded prescription"
                  style={{
                    width: useCover ? '100%' : 'auto',
                    height: useCover ? '100%' : '100%',
                    maxWidth: useCover ? 'none' : '100%',
                    maxHeight: '100%',
                    objectFit: useCover ? 'cover' : 'contain',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center select-none">
            <div className="mx-auto mb-4 p-4 rounded-full bg-gray-100 inline-flex">
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-lg font-medium text-gray-900">Upload Prescription Image</div>
            <div className="text-sm text-gray-500 mt-1">Drag and drop an image here, or click to select</div>
            <div className="text-xs text-gray-400 mt-1">Supports JPG, PNG, GIF up to {maxSizeMB}MB</div>

            <div className="mt-4 inline-flex">
              <div
                onClick={(e) => { e.stopPropagation(); openPicker(); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white text-sm cursor-pointer hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                Choose Image
              </div>
            </div>

            {warning && (
              <div className="mt-3 text-sm text-yellow-800 bg-yellow-50 inline-block px-3 py-2 rounded">
                {warning}
              </div>
            )}
          </div>
        )}

        {/* loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-30">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
              Processing...
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ImageUpload;
