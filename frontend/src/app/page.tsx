'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import EmailCapture from '@/components/EmailCapture';
import LoadingState from '@/components/LoadingState';
import ResultsDashboard from '@/components/ResultsDashboard';
import HistorySidebar from '@/components/HistorySidebar';
import { saveAnalysis } from '@/lib/history';

type AppState = 'input' | 'email' | 'loading' | 'results';

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
	const [email, setEmail] = useState('');
	const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

	const handleJobDescriptionSubmit = (description: string, selectedIndustry: string, jobTitle: string) => {
		setJobDescription(description);
		setIndustry(selectedIndustry);
		setTitle(jobTitle);
		setAppState('email');
	};

	const handleEmailSubmit = async (userEmail?: string) => {
		setEmail(userEmail || '');
		setAppState('loading');

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					job_description: jobDescription,
					industry: industry,
					user_email: userEmail || null,
				}),
			});

			if (!response.ok) {
				throw new Error('Analysis failed');
			}

			const data = await response.json();
			setAnalysisData(data);

			// Save to session storage
			const savedAnalysis = saveAnalysis({
				title,
				jobDescription,
				industry,
				analysis: data.analysis,
			});

			// Dispatch event to update sidebar
			window.dispatchEvent(new Event('analysisHistoryUpdated'));

			// Navigate to the saved analysis page
			router.push(`/analysis/${savedAnalysis.id}`);
		} catch (error) {
			console.error('Analysis error:', error);
			alert('Analysis failed. Please try again.');
			setAppState('input');
		}
	};

	const handleStartOver = () => {
		setAppState('input');
		setJobDescription('');
		setIndustry('');
		setTitle('');
		setEmail('');
		setAnalysisData(null);
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex'>
			<HistorySidebar />
			<main className='flex-1 overflow-auto'>
				<div className='max-w-7xl mx-auto px-4 py-16'>
					{appState === 'input' && (
						<>
							<div className='text-center mb-16'>
								<h1 className='text-5xl font-bold text-gray-900 mb-6'>How AI Automation Analysis Works In 3 Simple Steps</h1>
								<p className='text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed'>
									The process of identifying automation opportunities is complicated and time-consuming. Most teams struggle with manual tasks that drain
									productivity and resources. We have designed a unique AI-powered process that analyzes your job descriptions and reveals specific automation
									opportunities with detailed ROI calculations in minutes.
								</p>
							</div>

							{/* 3-Step Process */}
							<div className='mb-16'>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
									{/* Step 1 */}
									<div className='text-center'>
										<div className='w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>1</div>
										<h3 className='text-xl font-semibold text-gray-900 mb-3'>Input Your Job Description</h3>
										<p className='text-gray-600 leading-relaxed'>
											Paste any job description and select your industry. Our AI will analyze every task and responsibility to identify automation potential.
										</p>
									</div>

									{/* Step 2 */}
									<div className='text-center'>
										<div className='w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>2</div>
										<h3 className='text-xl font-semibold text-gray-900 mb-3'>AI Analyzes & Calculates ROI</h3>
										<p className='text-gray-600 leading-relaxed'>
											Our advanced AI identifies specific automation opportunities, estimates time savings, and calculates detailed ROI projections with
											implementation costs.
										</p>
									</div>

									{/* Step 3 */}
									<div className='text-center'>
										<div className='w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>3</div>
										<h3 className='text-xl font-semibold text-gray-900 mb-3'>Get Actionable Implementation Plan</h3>
										<p className='text-gray-600 leading-relaxed'>
											Receive a comprehensive report with task-by-task automation recommendations, implementation roadmap, and projected cost savings.
										</p>
									</div>
								</div>
							</div>

							{/* Benefits Section */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16'>
								{/* Benefit 1 */}
								<div className='bg-white rounded-lg shadow-lg p-8'>
									<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
										<svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
										</svg>
									</div>
									<h3 className='text-xl font-semibold text-gray-900 mb-3'>Instantly Identify High-ROI Opportunities</h3>
									<p className='text-gray-600 leading-relaxed'>
										Our AI scans every task in your job description and calculates which activities offer the highest return on automation investment. Get
										specific recommendations ranked by potential savings and implementation difficulty.
									</p>
								</div>

								{/* Benefit 2 */}
								<div className='bg-white rounded-lg shadow-lg p-8'>
									<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
										<svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
											/>
										</svg>
									</div>
									<h3 className='text-xl font-semibold text-gray-900 mb-3'>Get Detailed Financial Projections</h3>
									<p className='text-gray-600 leading-relaxed'>
										Receive comprehensive ROI analysis with 3-year projections, payback periods, and implementation costs. Build a compelling business case for
										automation initiatives with concrete financial data.
									</p>
								</div>
							</div>
						</>
					)}

					<div className='max-w-3xl mx-auto'>
						{appState === 'input' && <JobDescriptionInput onSubmit={handleJobDescriptionSubmit} />}

						{appState === 'email' && <EmailCapture onSubmit={handleEmailSubmit} />}

						{appState === 'loading' && <LoadingState />}

						{appState === 'results' && analysisData && <ResultsDashboard analysis={analysisData.analysis} onStartOver={handleStartOver} />}
					</div>
				</div>
			</main>
		</div>
	);
}
