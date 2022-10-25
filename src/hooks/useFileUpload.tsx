import { useRef, useState } from 'react';
import { PresignedPost } from 'aws-sdk/clients/s3';

export const useFileUpload = ({ onFileUploaded, getUploadUrl }: { onFileUploaded: () => void; getUploadUrl: (id: string) => Promise<PresignedPost> }) => {
  const [file, setFile] = useState<File>();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.FormEvent<HTMLInputElement>) => {
    setFile(e.currentTarget.files?.[0]);
  };

  const uploadFile = async (id: string) => {
    if (!file) return;

    const { url, fields } = await getUploadUrl(id);

    const formData = new FormData();
    formData.append('Content-Type', file.type);
    Object.entries(fields).forEach(([k, v]) => {
      formData.append(k, v);
    });
    formData.append('file', file);

    await fetch(url, {
      method: 'POST',
      body: formData,
    });

    setFile(undefined);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
    onFileUploaded();
  };

  return { fileRef, file, handleFileChange, uploadFile };
};
