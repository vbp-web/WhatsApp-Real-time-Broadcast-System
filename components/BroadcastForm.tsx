import React, { useState, useRef, useEffect } from 'react';
import type { ApiConfig, MessageContent } from '../types';
import { InfoIcon, KeyIcon, PhoneIcon, ImageIcon, XCircleIcon } from './icons';

interface BroadcastFormProps {
  onStart: (numbers: string[], content: MessageContent) => void;
  isBroadcasting: boolean;
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
}

export const BroadcastForm: React.FC<BroadcastFormProps> = ({ onStart, isBroadcasting, apiConfig, setApiConfig }) => {
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreview(null);
  }, [image]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 150 * 1024 * 1024) { // 150MB limit
        setError('Image size cannot exceed 150MB.');
        return;
      }
      setImage(file);
      setError(null);
    }
  };
  
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!apiConfig.accessToken || !apiConfig.phoneNumberId) {
      setError('Access Token and Phone Number ID are required.');
      return;
    }

    const numberList = numbers.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean);
    if (numberList.length === 0) {
      setError('Please enter at least one phone number.');
      return;
    }

    if (!message && !image) {
      setError('A message or an image is required.');
      return;
    }

    onStart(numberList, { text: message, image });
  };

  const numberCount = numbers.split(/[\n,;]+/).map(n => n.trim()).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-green-400">1. API Configuration</h3>
        <p className="text-sm text-gray-400 mb-4">Enter your WhatsApp Cloud API credentials.</p>
        <div className="space-y-4">
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Access Token"
              value={apiConfig.accessToken}
              onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isBroadcasting}
            />
          </div>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Phone Number ID"
              value={apiConfig.phoneNumberId}
              onChange={(e) => setApiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isBroadcasting}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-green-400">2. Recipients</h3>
        <p className="text-sm text-gray-400 mb-2">Paste numbers separated by new lines, commas, or semicolons.</p>
        <div className="relative">
           <textarea
            placeholder="e.g., 15551234567&#10;15557654321"
            value={numbers}
            onChange={(e) => setNumbers(e.target.value)}
            className="w-full h-48 bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            disabled={isBroadcasting}
           />
           <span className="absolute bottom-2 right-2 text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
             {numberCount} numbers
           </span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-green-400">3. Message Content</h3>
        <p className="text-sm text-gray-400 mb-2">Enter your message and optionally upload an image.</p>
        <div className="space-y-4">
          <textarea
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-24 bg-gray-700 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
            disabled={isBroadcasting}
          />
          
          {imagePreview ? (
            <div className="relative group">
              <img src={imagePreview} alt="Image preview" className="rounded-lg max-h-48 w-auto mx-auto" />
              <button 
                type="button" 
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="image-upload" className="cursor-pointer w-full flex items-center justify-center gap-2 bg-gray-700 border border-dashed border-gray-600 rounded-md py-3 px-4 hover:bg-gray-600/50 transition-colors">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300 font-medium">Upload Image (Optional)</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
                className="hidden"
                disabled={isBroadcasting}
                ref={fileInputRef}
              />
              <p className="text-xs text-gray-500 mt-1">Max file size: 150MB. PNG, JPG, WEBP.</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center bg-red-900/50 text-red-300 p-3 rounded-md text-sm">
          <InfoIcon className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isBroadcasting || numberCount === 0}
        className="w-full flex justify-center items-center bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
      >
        {isBroadcasting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Broadcasting...
          </>
        ) : `Send Broadcast to ${numberCount} Numbers`}
      </button>
    </form>
  );
};