import { useState, useRef, useCallback } from 'react';
import type { MessageStatus, ApiConfig, BroadcastStatus, MessageContent } from '../types';
import { sendMessage } from '../services/whatsappService';

const CONCURRENCY = 5; // Number of messages to send concurrently
const MAX_RETRIES = 2; // Max retries for failed messages

export const useBroadcast = () => {
  const [statuses, setStatuses] = useState<MessageStatus[]>([]);
  const [progress, setProgress] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<BroadcastStatus>('idle');
  
  const isCancelledRef = useRef(false);
  const statusRef = useRef<MessageStatus[]>([]);

  const updateStatus = useCallback((id: string, updates: Partial<MessageStatus>) => {
    statusRef.current = statusRef.current.map(s =>
      s.id === id ? { ...s, ...updates, timestamp: new Date().toLocaleTimeString() } : s
    );
    setStatuses([...statusRef.current]);
  }, []);

  const updateStatusByMessageId = useCallback((messageId: string, updates: Partial<MessageStatus>) => {
    statusRef.current = statusRef.current.map(s =>
      s.messageId === messageId ? { ...s, ...updates, timestamp: new Date().toLocaleTimeString() } : s
    );
    setStatuses([...statusRef.current]);
  }, []);

  const processNumber = async (status: MessageStatus, content: MessageContent, apiConfig: ApiConfig): Promise<void> => {
    if (isCancelledRef.current) return;
  
    updateStatus(status.id, { sendStatus: 'attempting' });
  
    const response = await sendMessage(status.phoneNumber, content, apiConfig);
  
    if (isCancelledRef.current) return;
  
    if (response.success && response.messageId) {
      updateStatus(status.id, { sendStatus: 'sent', messageId: response.messageId });
      // Simulate webhook events for 'delivered' and 'read'
      setTimeout(() => {
        if (!isCancelledRef.current) {
          updateStatusByMessageId(response.messageId!, { deliveryStatus: 'delivered' });
        }
      }, 5000 + Math.random() * 10000); // Delivered between 5-15s
      
      setTimeout(() => {
        if (!isCancelledRef.current) {
          updateStatusByMessageId(response.messageId!, { readStatus: 'read' });
        }
      }, 15000 + Math.random() * 20000); // Read between 15-35s
  
    } else {
      if (status.retries < MAX_RETRIES) {
        updateStatus(status.id, { sendStatus: 'retrying', error: response.error, retries: status.retries + 1 });
        // Add a small delay before retrying
        await new Promise(res => setTimeout(res, 2000));
        await processNumber({ ...status, retries: status.retries + 1 }, content, apiConfig);
      } else {
        updateStatus(status.id, { sendStatus: 'failed', error: response.error });
      }
    }
  };
  
  const startBroadcast = async (phoneNumbers: string[], content: MessageContent, apiConfig: ApiConfig) => {
    setIsBroadcasting(true);
    isCancelledRef.current = false;
    setBroadcastStatus('running');
    const initialStatuses: MessageStatus[] = phoneNumbers.map((num, index) => ({
      id: `${Date.now()}-${index}`,
      phoneNumber: num,
      sendStatus: 'pending',
      deliveryStatus: 'pending',
      readStatus: 'pending',
      messageId: null,
      timestamp: new Date().toLocaleTimeString(),
      retries: 0,
    }));
    statusRef.current = initialStatuses;
    setStatuses(initialStatuses);
    
    let processedCount = 0;
    
    const queue = [...initialStatuses];

    const processQueue = async () => {
        const batch = queue.splice(0, CONCURRENCY);
        if (batch.length === 0) return;

        await Promise.all(batch.map(async (status) => {
            if (isCancelledRef.current) return;
            await processNumber(status, content, apiConfig);
            processedCount++;
            setProgress((processedCount / phoneNumbers.length) * 100);
        }));

        if (!isCancelledRef.current) {
            await processQueue();
        }
    };
    
    await processQueue();

    if (isCancelledRef.current) {
      setBroadcastStatus('cancelled');
    } else {
      setBroadcastStatus('completed');
    }
    setIsBroadcasting(false);
  };
  
  const cancelBroadcast = () => {
    isCancelledRef.current = true;
    setIsBroadcasting(false);
    setBroadcastStatus('cancelled');
    // Update pending statuses to failed
    statusRef.current = statusRef.current.map(s => 
      s.sendStatus === 'pending' || s.sendStatus === 'attempting'
        ? { ...s, sendStatus: 'failed', error: 'Cancelled by user' }
        : s
    );
    setStatuses([...statusRef.current]);
  };

  return { statuses, progress, isBroadcasting, startBroadcast, cancelBroadcast, broadcastStatus };
};
