import { useEffect, useState } from 'react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface CloudinaryWidgetOptions {
  resourceType: 'image' | 'raw' | 'auto';
  folder: string;
  onSuccess: (secureUrl: string) => void;
  onError?: (error: any) => void;
  clientAllowedFormats?: string[];
  maxFileSize?: number;
}

export function useCloudinaryWidget({
  resourceType,
  folder,
  onSuccess,
  onError,
  clientAllowedFormats,
  maxFileSize = 50 * 1024 * 1024, // 50MB default
}: CloudinaryWidgetOptions) {
  const [widget, setWidget] = useState<any>(null);

  useEffect(() => {
    // If window.cloudinary is not yet available, we retry initialization shortly or wait for the script to load.
    // Assuming the script is loaded via index.html synchronous or module.
    
    const initWidget = () => {
      if (!window.cloudinary) {
        setTimeout(initWidget, 500);
        return;
      }
      
      const uploadWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
          folder,
          resourceType,
          clientAllowedFormats,
          maxFileSize,
          multiple: false,
          sources: ['local', 'url'],
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            onSuccess(result.info.secure_url);
          } else if (error) {
            console.error('Cloudinary upload error:', error);
            if (onError) onError(error);
          }
        }
      );
      setWidget(uploadWidget);
    };

    initWidget();
  }, [resourceType, folder, onSuccess, onError, clientAllowedFormats, maxFileSize]);

  const openWidget = () => {
    if (widget) {
      widget.open();
    } else {
      console.error('Cloudinary widget is not initialized yet.');
    }
  };

  return { openWidget, isReady: !!widget };
}
