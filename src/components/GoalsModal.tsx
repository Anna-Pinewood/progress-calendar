import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface GoalsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GoalsModal: React.FC<GoalsModalProps> = ({ isOpen, onClose }) => {
    const [goalsContent, setGoalsContent] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/data/goals.md')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(text => {
                    setGoalsContent(text || 'Цели пока не добавлены. Добавьте их в файл goals.md');
                    setError('');
                })
                .catch(err => {
                    console.error("Failed to load goals:", err);
                    setError("Не удалось загрузить цели");
                    setGoalsContent('');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(goalsContent)
            .then(() => console.log("Goals copied to clipboard!"))
            .catch(err => console.error("Failed to copy goals: ", err));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" aria-labelledby="goals-modal-title" role="dialog" aria-modal="true">
            <div className="relative p-8 bg-white w-full max-w-2xl mx-auto rounded-lg shadow-xl">
                <h2 id="goals-modal-title" className="text-xl font-semibold mb-4">Мои цели</h2>

                {isLoading ? (
                    <div className="bg-gray-100 p-4 rounded-md flex justify-center items-center h-32">
                        <div className="text-gray-500">Загрузка...</div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-4 rounded-md">
                        <div className="text-red-700">{error}</div>
                    </div>
                ) : (
                    <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
                        {goalsContent.trim() ? (
                            <div className="prose prose-sm max-w-none text-gray-800">
                                <ReactMarkdown>{goalsContent}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">Цели пока не добавлены. Добавьте их в файл goals.md</div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    {goalsContent.trim() && !error && (
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Копировать
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalsModal;
