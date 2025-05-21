import React from 'react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportText: string;
    onCopy: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportText, onCopy }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" aria-labelledby="report-modal-title" role="dialog" aria-modal="true">
            <div className="relative p-8 bg-white w-full max-w-2xl mx-auto rounded-lg shadow-xl">
                <h2 id="report-modal-title" className="text-xl font-semibold mb-4">Generated Report</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap max-h-96 overflow-y-auto text-sm">
                    {reportText}
                </pre>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onCopy}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Copy Report
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal; 