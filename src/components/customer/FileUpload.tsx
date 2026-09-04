'use client';

import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function FileUpload({
  value,
  onChange,
  label = 'Attach Photo of the Issue (Optional)',
  hint = 'Upload an image of the pipe leak, damaged furniture, or broken appliance to help the worker prepare the right tools.',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(value || '');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setPreview(sampleUrl);
    onChange(sampleUrl);
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 block">{label}</label>
        {preview && (
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
          </span>
        )}
      </div>

      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-emerald-300 max-w-sm bg-gray-50">
          <img
            src={preview}
            alt="Issue preview"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 transition-all duration-200 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 hover:underline">
                Click to upload photo
              </span>
              <span className="text-xs text-gray-500"> or drag & drop</span>
            </div>
            <span className="text-[10px] text-gray-400">PNG, JPG, JPEG up to 5MB</span>
          </div>

          {/* Quick Demo Sample Photos */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-gray-400 font-medium">Or try sample:</span>
            <button
              type="button"
              onClick={() =>
                handleSampleClick(
                  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80'
                )
              }
              className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60 transition-colors"
            >
              Pipe Leak Sample
            </button>
            <button
              type="button"
              onClick={() =>
                handleSampleClick(
                  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
                )
              }
              className="text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200/60 transition-colors"
            >
              Switchboard Sample
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
