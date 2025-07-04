'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAnalysisById, SavedAnalysis } from '@/lib/history';
import ResultsDashboard from '@/components/ResultsDashboard';
import HistorySidebar from '@/components/HistorySidebar';
import Header from '@/components/Header';
import { ArrowLeft, FileText } from 'lucide-react';

export default function AnalysisPage() {
	const params = useParams();
	const router = useRouter();
	const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
	const [loading, setLoading] = useState(true);
	const [showJobDescription, setShowJobDescription] = useState(false);
	const [historyOpen, setHistoryOpen] = useState(false);

	useEffect(() => {
		const id = params.id as string;
		if (id) {
			const savedAnalysis = getAnalysisById(id);
			setAnalysis(savedAnalysis);
		}
		setLoading(false);
	}, [params.id]);

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600 text-sm sm:text-base'>Loading analysis...</p>
				</div>
			</div>
		);
	}

	if (!analysis) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
				<Header onHistoryClick={handleHistoryClick} />
				<HistorySidebar isOpen={historyOpen} onOpenChange={setHistoryOpen} />
				<main className='w-full'>
					<div className='flex items-center justify-center min-h-screen pt-20 sm:pt-28 px-4'>
						<div className='text-center max-w-md mx-auto'>
							<h1 className='text-xl sm:text-2xl font-bold text-gray-900 mb-4'>Analysis Not Found</h1>
							<p className='text-sm sm:text-base text-gray-600 mb-6'>The analysis you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
							<button 
								onClick={() => router.push('/')} 
								className='bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base'
							>
								Go Home
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	const handleStartOver = () => {
		router.push('/');
	};

	const handleHistoryClick = () => {
		setHistoryOpen(true);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
			<Header onHistoryClick={handleHistoryClick} />
			<HistorySidebar 
				currentAnalysisId={analysis.id} 
				isOpen={historyOpen} 
				onOpenChange={setHistoryOpen} 
			/>

			<main className='w-full'>
				<div className='max-w-7xl mx-auto px-4 pt-20 sm:pt-28 pb-8'>
					{/* Header */}
					<div className='mb-6 sm:mb-8'>
						<button onClick={() => router.push('/')} className='inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 text-sm sm:text-base'>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Home
						</button>

						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
							<div className='min-w-0 flex-1'>
								<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words'>{analysis.title}</h1>
								<p className='text-sm sm:text-base text-gray-600 mt-1'>
									{analysis.industry} • {new Date(analysis.createdAt).toLocaleDateString()}
								</p>
							</div>

							<button
								onClick={() => setShowJobDescription(!showJobDescription)}
								className='inline-flex items-center px-3 sm:px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base whitespace-nowrap'>
								<FileText className='h-4 w-4 mr-2' />
								<span className='hidden sm:inline'>{showJobDescription ? 'Hide' : 'View'} Job Description</span>
								<span className='sm:hidden'>{showJobDescription ? 'Hide' : 'View'}</span>
							</button>
						</div>
					</div>

					{/* Job Description Modal/Panel */}
					{showJobDescription && (
						<div className='mb-6 sm:mb-8'>
							<div className='bg-white rounded-lg shadow-lg p-4 sm:p-6'>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='text-lg sm:text-xl font-semibold text-gray-900'>Job Description</h2>
									<button 
										onClick={() => setShowJobDescription(false)} 
										className='text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded text-xl sm:text-2xl w-8 h-8 flex items-center justify-center'
									>
										×
									</button>
								</div>
								<div className='prose max-w-none'>
									<pre className='whitespace-pre-wrap text-xs sm:text-sm text-gray-700 bg-gray-50 p-3 sm:p-4 rounded border overflow-x-auto'>{analysis.jobDescription}</pre>
								</div>
							</div>
						</div>
					)}

					{/* Analysis Results */}
					<ResultsDashboard analysis={analysis.analysis} onStartOver={handleStartOver} />
				</div>
			</main>
		</div>
	);
}
