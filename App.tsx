import React, { useState } from 'react';
import { BroadcastForm } from './components/BroadcastForm';
import { StatusTable } from './components/StatusTable';
import { ProgressBar } from './components/ProgressBar';
import { useBroadcast } from './hooks/useBroadcast';
import type { BroadcastStatus, MessageStatus, ApiConfig, MessageContent } from './types';
import { GithubIcon } from './components/icons';

const App: React.FC = () => {
  const { 
    statuses, 
    progress, 
    isBroadcasting, 
    startBroadcast,
    cancelBroadcast,
    broadcastStatus
  } = useBroadcast();
  
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    accessToken: '',
    phoneNumberId: '',
  });

  const handleStartBroadcast = (numbers: string[], content: MessageContent) => {
    startBroadcast(numbers, content, apiConfig);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-green-400">WhatsApp Broadcast System</h1>
            <p className="text-gray-400 mt-1">Send messages to hundreds of users and monitor real-time status.</p>
          </div>
          <a href="https://github.com/wasp-broadcast/whatsapp-broadcaster" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <GithubIcon className="w-8 h-8" />
          </a>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg h-fit">
            <BroadcastForm 
              onStart={handleStartBroadcast} 
              isBroadcasting={isBroadcasting}
              apiConfig={apiConfig}
              setApiConfig={setApiConfig}
            />
          </div>

          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Live Broadcast Status</h2>
            {isBroadcasting || statuses.length > 0 ? (
              <>
                <ProgressBar progress={progress} status={broadcastStatus} onCancel={cancelBroadcast} isBroadcasting={isBroadcasting} />
                <StatusTable statuses={statuses} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg">
                <p className="text-gray-400">Your broadcast results will appear here in real-time.</p>
                <p className="text-sm text-gray-500 mt-2">Fill out the form and click "Send Broadcast" to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;