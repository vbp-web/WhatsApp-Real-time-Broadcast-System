
import React, { memo } from 'react';
import type { MessageStatus, SendStatus, DeliveryStatus, ReadStatus } from '../types';
import { CheckCircleIcon, ClockIcon, ExclamationIcon, PaperAirplaneIcon, ReadIcon, RetryIcon, DeliveredIcon } from './icons';

const getSendStatusIcon = (status: SendStatus) => {
  switch (status) {
    case 'pending': return <ClockIcon className="w-5 h-5 text-gray-500" />;
    case 'attempting': return <PaperAirplaneIcon className="w-5 h-5 text-blue-400 animate-pulse" />;
    case 'sent': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case 'failed': return <ExclamationIcon className="w-5 h-5 text-red-400" />;
    case 'retrying': return <RetryIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
    default: return null;
  }
};

const getDeliveryStatusIcon = (status: DeliveryStatus) => {
  switch (status) {
    case 'pending': return <ClockIcon className="w-5 h-5 text-gray-500" />;
    case 'delivered': return <DeliveredIcon className="w-5 h-5 text-green-400" />;
    default: return null;
  }
};

const getReadStatusIcon = (status: ReadStatus) => {
  switch (status) {
    case 'pending': return <ClockIcon className="w-5 h-5 text-gray-500" />;
    case 'read': return <ReadIcon className="w-5 h-5 text-blue-400" />;
    default: return null;
  }
};

const StatusCell: React.FC<{ status: SendStatus | DeliveryStatus | ReadStatus, type: 'send' | 'delivery' | 'read' }> = ({ status, type }) => {
    const icon = type === 'send' ? getSendStatusIcon(status as SendStatus) : type === 'delivery' ? getDeliveryStatusIcon(status as DeliveryStatus) : getReadStatusIcon(status as ReadStatus);
    const colorClasses: { [key: string]: string } = {
        pending: 'bg-gray-700 text-gray-300',
        attempting: 'bg-blue-900/50 text-blue-300',
        sent: 'bg-green-900/50 text-green-300',
        failed: 'bg-red-900/50 text-red-300',
        retrying: 'bg-yellow-900/50 text-yellow-300',
        delivered: 'bg-green-900/50 text-green-300',
        read: 'bg-blue-900/50 text-blue-300'
    };
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colorClasses[status]}`}>
            {icon}
            {status}
        </span>
    );
};


const TableRow: React.FC<{ status: MessageStatus }> = memo(({ status }) => {
  return (
    <tr className="bg-gray-800 hover:bg-gray-700/50 transition-colors duration-200">
      <td className="px-4 py-3 text-sm font-mono text-gray-300 whitespace-nowrap">{status.phoneNumber}</td>
      <td className="px-4 py-3 whitespace-nowrap"><StatusCell status={status.sendStatus} type="send" /></td>
      <td className="px-4 py-3 whitespace-nowrap"><StatusCell status={status.deliveryStatus} type="delivery" /></td>
      <td className="px-4 py-3 whitespace-nowrap"><StatusCell status={status.readStatus} type="read" /></td>
      <td className="px-4 py-3 text-sm font-mono text-gray-400 truncate max-w-xs">{status.messageId || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{status.timestamp}</td>
    </tr>
  );
});

export const StatusTable: React.FC<{ statuses: MessageStatus[] }> = ({ statuses }) => {
  return (
    <div className="overflow-x-auto mt-6 rounded-lg border border-gray-700 max-h-[calc(100vh-20rem)] overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700/50 sticky top-0 backdrop-blur-sm">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone Number</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Send Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Delivery Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Read Status</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Message ID</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {statuses.map(status => (
            <TableRow key={status.id} status={status} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
