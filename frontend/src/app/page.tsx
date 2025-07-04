'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { analyzeJobDescription } from '@/lib/api';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ResultsDashboard from '@/components/ResultsDashboard';
import HistorySidebar from '@/components/HistorySidebar';
import Header from '@/components/Header';
import { generateId } from '@/lib/history';

type AppState = 'input' | 'email' | 'loading' | 'results' | 'error';

interface AnalysisData {
	id: number;
	analysis: any;
}

export default function Home() {
	const router = useRouter();
	const [appState, setAppState] = useState<AppState>('input');
	const [jobDescription, setJobDescription] = useState('');
	const [industry, setIndustry] = useState('');
	const [title, setTitle] = useState('');
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [sessionId, setSessionId] = useState<string>('');
	const [historyOpen, setHistoryOpen] = useState(false);

	const analyzeMutation = useMutation({
		mutationFn: analyzeJobDescription,
		onMutate: () => {
			setAppState('loading');
		},
		onSuccess: (data) => {
			setAnalysisData(data);

			// Save to session storage with pre-generated ID
			const savedAnalysis = {
				id: sessionId,
				title,
				jobDescription,
				industry,
				analysis: data.analysis,
				createdAt: new Date().toISOString(),
			};

			// Save using existing function but with custom ID
			const history = JSON.parse(sessionStorage.getItem('ai-opportunity-scanner-history') || '[]');
			history.unshift(savedAnalysis);
			if (history.length > 20) history.pop();
			sessionStorage.setItem('ai-opportunity-scanner-history', JSON.stringify(history));

			// Dispatch event to update sidebar
			window.dispatchEvent(new Event('analysisHistoryUpdated'));

			// Navigate to the saved analysis page
			router.push(`/analysis/${sessionId}`);
		},
		onError: (error: Error) => {
			console.error('Analysis error:', error);
			setErrorMessage(error.message || 'Analysis failed. Please try again.');
			setAppState('error');
		},
	});

	const handleJobDescriptionSubmit = (description: string, selectedIndustry: string, jobTitle: string) => {
		setJobDescription(description);
		setIndustry(selectedIndustry);
		setTitle(jobTitle);
		setSessionId(generateId()); // Generate session ID upfront
		setAppState('email');
	};

	const handleEmailSubmit = async (userEmail?: string) => {
		const requestData = {
			job_description: jobDescription,
			industry: industry,
			user_email: userEmail || undefined,
			session_id: sessionId,
		};
		
		analyzeMutation.mutate(requestData);
	};

	const handleStartOver = () => {
		setAppState('input');
		setJobDescription('');
		setIndustry('');
		setTitle('');
		setAnalysisData(null);
		setErrorMessage('');
		setSessionId('');
		analyzeMutation.reset();
	};

	const handleRetry = () => {
		setAppState('email');
		setErrorMessage('');
		analyzeMutation.reset();
	};

	const handleGetStarted = () => {
		const inputSection = document.querySelector('[data-section="input"]');
		if (inputSection) {
			inputSection.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const handleHistoryClick = () => {
		setHistoryOpen(true);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
			<Header onGetStarted={handleGetStarted} onHistoryClick={handleHistoryClick} />
			<HistorySidebar isOpen={historyOpen} onOpenChange={setHistoryOpen} />
			<main className='w-full'>
				<div className='max-w-7xl mx-auto px-4 pt-20 sm:pt-28 pb-16'>
					{appState === 'input' && (
						<>
							<div className='text-center mb-12 sm:mb-16'>
								<h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-2'>
									Discover automation opportunities in
									<span className='block text-blue-600'>under 2 minutes</span>
								</h1>
								<p className='text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4 mb-8'>
									Skip months of manual analysis. Get AI-powered automation recommendations with precise ROI calculations, so you can build your business case before investing in any technology.
								</p>
								<div className='flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base text-gray-500'>
									<div className='flex items-center'>
										<svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
											<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
										</svg>
										Detailed task breakdown
									</div>
									<div className='flex items-center'>
										<svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
											<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
										</svg>
										3-year ROI projections
									</div>
									<div className='flex items-center'>
										<svg className='w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
											<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
										</svg>
										Implementation roadmap
									</div>
								</div>
							</div>

							{/* 3-Step Process */}
							<div className='mb-12 sm:mb-16'>
								<h2 className='text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12'>How it works</h2>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4'>
									{/* Step 1 */}
									<div className='text-center'>
										<div className='w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4'>1</div>
										<h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-3'>Paste job description</h3>
										<p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
											Copy any job posting and select the industry. Takes 30 seconds.
										</p>
									</div>

									{/* Step 2 */}
									<div className='text-center'>
										<div className='w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4'>2</div>
										<h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-3'>AI analyzes in real-time</h3>
										<p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
											Our AI identifies automation opportunities and calculates precise ROI within 90 seconds.
										</p>
									</div>

									{/* Step 3 */}
									<div className='text-center'>
										<div className='w-14 h-14 sm:w-16 sm:h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4'>3</div>
										<h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-3'>Get your roadmap</h3>
										<p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
											Download a detailed plan with cost savings, implementation steps, and timeline.
										</p>
									</div>
								</div>
							</div>

							{/* Benefits Section */}
							<div className='text-center mb-12 sm:mb-16'>
								<h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4'>Stop guessing what to automate</h2>
								<p className='text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-4'>
									Get data-driven insights that help you prioritize automation investments and secure stakeholder buy-in.
								</p>
								
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4'>
									<div className='bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100'>
										<div className='text-3xl font-bold text-blue-600 mb-2'>$50K+</div>
										<div className='text-sm text-gray-600'>Average annual savings identified</div>
									</div>
									<div className='bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100'>
										<div className='text-3xl font-bold text-green-600 mb-2'>8 months</div>
										<div className='text-sm text-gray-600'>Typical payback period</div>
									</div>
									<div className='bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100'>
										<div className='text-3xl font-bold text-purple-600 mb-2'>40%</div>
										<div className='text-sm text-gray-600'>Average time savings per task</div>
									</div>
									<div className='bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100'>
										<div className='text-3xl font-bold text-orange-600 mb-2'>90 sec</div>
										<div className='text-sm text-gray-600'>Complete analysis time</div>
									</div>
								</div>
							</div>
						</>
					)}

					<div className='max-w-3xl mx-auto' data-section="input">
						{appState === 'input' && <JobDescriptionInput onSubmit={handleJobDescriptionSubmit} />}

						{appState === 'email' && <EmailCapture onSubmit={handleEmailSubmit} />}

						{appState === 'loading' && <LoadingState />}

						{appState === 'error' && (
							<div className="bg-white rounded-lg shadow-lg p-8">
								<div className="text-center">
									<div className="text-red-600 text-6xl mb-4">⚠️</div>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										Analysis Failed
									</h2>
									<p className="text-gray-600 mb-6">
										{errorMessage}
									</p>
									<div className="space-x-4">
										<button
											onClick={handleRetry}
											className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
										>
											Try Again
										</button>
										<button
											onClick={handleStartOver}
											className="bg-gray-200 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
										>
											Start Over
										</button>
									</div>
								</div>
							</div>
						)}

						{appState === 'results' && analysisData && <ResultsDashboard analysis={analysisData.analysis} onStartOver={handleStartOver} />}
					</div>
				</div>
			</main>
			{process.env.NODE_ENV === 'development' && (
				<div className="fixed bottom-4 right-4 z-50">
					<ReactQueryDevtools initialIsOpen={false} />
				</div>
			)}
		</div>
	);
}
