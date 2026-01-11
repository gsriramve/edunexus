'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoUploadProps {
  currentPhoto?: string | null;
  name?: string;
  onUpload: (formData: FormData) => Promise<{ photoUrl: string }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};

const buttonSizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function PhotoUpload({
  currentPhoto,
  name = 'User',
  onUpload,
  size = 'lg',
  className = '',
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate initials from name
  const getInitials = useCallback((name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const result = await onUpload(formData);
      setPreview(result.photoUrl);
      toast.success('Photo updated successfully!');
    } catch (error) {
      // Revert preview on error
      setPreview(currentPhoto || null);
      toast.error('Failed to upload photo. Please try again.');
      console.error('Photo upload error:', error);
    } finally {
      setIsUploading(false);
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={preview || undefined} alt={name} />
        <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <Button
        type="button"
        size="icon"
        variant="secondary"
        className={`absolute -bottom-1 -right-1 rounded-full shadow-md border-2 border-background ${buttonSizeClasses[size]}`}
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className={`${iconSizeClasses[size]} animate-spin`} />
        ) : (
          <Camera className={iconSizeClasses[size]} />
        )}
      </Button>
    </div>
  );
}

export default PhotoUpload;
