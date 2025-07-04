'use client';

import { useState, useEffect } from 'react';
import { Clock, Trash2, History, Menu } from 'lucide-react';
import { SavedAnalysis, getAnalysisHistory, clearHistory, deleteAnalysis } from '@/lib/history';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
		setIsOpen(false); // Close the sheet after navigation
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
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="fixed top-4 left-4 z-40 lg:top-6 lg:left-6 bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white/95"
				>
					<History className="h-4 w-4" />
					<span className="sr-only">Open analysis history</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[350px] sm:w-[400px] p-0">
				<SheetHeader className="p-6 pb-4">
					<SheetTitle className="flex items-center gap-2">
						<History className="h-5 w-5" />
						Analysis History
					</SheetTitle>
				</SheetHeader>
				
				<div className="flex-1 overflow-y-auto px-6 pb-6">
					{history.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
							<p className="font-medium">No analyses yet</p>
							<p className="text-sm mt-1">Your analysis history will appear here</p>
						</div>
					) : (
						<div className="space-y-3">
							<div className="flex justify-end">
								<Button 
									variant="ghost" 
									size="sm" 
									onClick={handleClearAll}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									Clear All
								</Button>
							</div>
							{history.map((item) => (
								<div
									key={item.id}
									onClick={() => handleSelectAnalysis(item.id)}
									className={cn(
										'p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border group',
										currentAnalysisId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
									)}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
											<p className="text-sm text-gray-500 mt-1">{item.industry}</p>
											<p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => handleDelete(e, item.id)}
											className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}