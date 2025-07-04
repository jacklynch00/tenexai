'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Trash2, Clock } from 'lucide-react';
import { SavedAnalysis, getAnalysisHistory, clearHistory, deleteAnalysis } from '@/lib/history';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HistorySidebarProps {
	currentAnalysisId?: string;
}

export default function HistorySidebar({ currentAnalysisId }: HistorySidebarProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [history, setHistory] = useState<SavedAnalysis[]>([]);
	const router = useRouter();

	useEffect(() => {
		const loadHistory = () => {
			setHistory(getAnalysisHistory());
		};

		loadHistory();

		// Listen for storage events
		const handleStorageChange = () => {
			loadHistory();
		};

		window.addEventListener('storage', handleStorageChange);

		// Custom event for same-window updates
		window.addEventListener('analysisHistoryUpdated', loadHistory);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('analysisHistoryUpdated', loadHistory);
		};
	}, []);

	const handleSelectAnalysis = (id: string) => {
		router.push(`/analysis/${id}`);
	};

	const handleDelete = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (confirm('Are you sure you want to delete this analysis?')) {
			deleteAnalysis(id);
			setHistory(getAnalysisHistory());
			window.dispatchEvent(new Event('analysisHistoryUpdated'));

			if (currentAnalysisId === id) {
				router.push('/');
			}
		}
	};

	const handleClearAll = () => {
		if (confirm('Are you sure you want to clear all saved analyses?')) {
			clearHistory();
			setHistory([]);
			window.dispatchEvent(new Event('analysisHistoryUpdated'));
			router.push('/');
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor(diffInHours * 60);
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	return (
		<div className={cn('bg-white border-r border-gray-200 transition-all duration-300 flex flex-col min-h-screen sticky top-0', isOpen ? 'w-80' : 'w-12')}>
			{isOpen ? (
				<>
					{/* Header */}
					<div className='p-4 border-b flex items-center justify-between'>
						<h2 className='text-lg font-semibold'>Analysis History</h2>
						<button onClick={() => setIsOpen(false)} className='p-1 hover:bg-gray-100 rounded'>
							<ChevronRight className='h-5 w-5' />
						</button>
					</div>

					{/* History List */}
					<div className='flex-1 overflow-y-auto'>
						{history.length === 0 ? (
							<div className='p-4 text-center text-gray-500'>
								<Clock className='h-12 w-12 mx-auto mb-2 text-gray-300' />
								<p>No analyses yet</p>
								<p className='text-sm mt-1'>Your analysis history will appear here</p>
							</div>
						) : (
							<div className='p-2'>
								<div className='flex justify-end mb-2'>
									<button onClick={handleClearAll} className='px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors'>
										Clear All
									</button>
								</div>
								{history.map((item) => (
									<div
										key={item.id}
										onClick={() => handleSelectAnalysis(item.id)}
										className={cn(
											'p-3 mb-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border',
											currentAnalysisId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
										)}>
										<div className='flex items-start justify-between'>
											<div className='flex-1 min-w-0'>
												<h3 className='font-medium text-gray-900 truncate'>{item.title}</h3>
												<p className='text-sm text-gray-500 mt-1'>{item.industry}</p>
												<p className='text-xs text-gray-400 mt-1'>{formatDate(item.createdAt)}</p>
											</div>
											<button onClick={(e) => handleDelete(e, item.id)} className='ml-2 p-1 hover:bg-gray-200 rounded'>
												<Trash2 className='h-4 w-4 text-gray-500' />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			) : (
				/* Collapsed state - only expand button */
				<div className='p-2'>
					<button onClick={() => setIsOpen(true)} className='w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded' aria-label='Open history sidebar'>
						<ChevronRight className='h-4 w-4 rotate-180' />
					</button>
				</div>
			)}
		</div>
	);
}
