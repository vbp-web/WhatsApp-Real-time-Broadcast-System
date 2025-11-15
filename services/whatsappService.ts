import type { ApiConfig, MessageContent } from '../types';

// This is a mock service to simulate sending messages via WhatsApp Cloud API.
// In a real application, this would use `fetch` to make HTTP requests to the Meta Graph API.
// It randomly succeeds or fails to simulate real-world conditions.

interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendMessage = async (
  phoneNumber: string,
  content: MessageContent,
  apiConfig: ApiConfig
): Promise<SendMessageResponse> => {

  console.log(`Simulating send to ${phoneNumber} with message "${content.text}" and image: ${content.image ? content.image.name : 'none'} using config:`, apiConfig);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Simulate API call validation
  if (!apiConfig.accessToken || !apiConfig.phoneNumberId) {
    return {
      success: false,
      error: 'Missing API credentials.',
    };
  }

  // Simulate random success/failure. 90% success rate.
  const isSuccess = Math.random() < 0.9;

  if (isSuccess) {
    return {
      success: true,
      // Generate a fake WhatsApp message ID
      messageId: `wamid.${Date.now()}${Math.floor(Math.random() * 1000)}`,
    };
  } else {
    // Simulate a common API error
    return {
      success: false,
      error: 'Error: Invalid phone number format or API limit reached.',
    };
  }
};
