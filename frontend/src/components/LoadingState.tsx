'use client';

import { useState, useEffect } from 'react';

export default function LoadingState() {
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState(0);

	const steps = [
		'Analyzing job description...',
		'Identifying automation opportunities...',
		'Calculating ROI projections...',
		'Generating implementation roadmap...',
		'Finalizing recommendations...',
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 1;
				const stepIndex = Math.floor(newProgress / 20);
				setCurrentStep(Math.min(stepIndex, steps.length - 1));

				if (newProgress >= 100) {
					clearInterval(interval);
					return 100;
				}
				return newProgress;
			});
		}, 200);

		return () => clearInterval(interval);
	}, [steps.length]);

	return (
		<div className='bg-white rounded-lg shadow-lg p-8'>
			<div className='text-center mb-8'>
				<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>Analyzing Your Job Description</h2>
				<p className='text-gray-600'>Our AI is analyzing your job description to identify automation opportunities and calculate ROI.</p>
			</div>

			<div className='space-y-4'>
				<div className='flex justify-between text-sm text-gray-600 mb-2'>
					<span>Progress</span>
					<span>{progress}%</span>
				</div>

				<div className='w-full bg-gray-200 rounded-full h-2'>
					<div className='bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out' style={{ width: `${progress}%` }}></div>
				</div>

				<div className='mt-6'>
					<div className='text-center text-gray-600 font-medium'>{steps[currentStep]}</div>
				</div>

				<div className='mt-6 space-y-2'>
					{steps.map((step, index) => (
						<div key={index} className='flex items-center space-x-3'>
							<div className={`w-4 h-4 rounded-full flex-shrink-0 ${index < currentStep ? 'bg-green-500' : index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}>
								{index < currentStep && (
									<svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
										<path
											fillRule='evenodd'
											d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
											clipRule='evenodd'
										/>
									</svg>
								)}
							</div>
							<span className={`text-sm ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>{step}</span>
						</div>
					))}
				</div>
			</div>

			<div className='mt-8 text-center text-sm text-gray-500'>This analysis typically takes 30-45 seconds to complete</div>
		</div>
	);
}
