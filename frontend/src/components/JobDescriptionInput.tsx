'use client';

import { useState } from 'react';

interface JobDescriptionInputProps {
	onSubmit: (jobDescription: string, industry: string, title: string) => void;
}

const INDUSTRIES = [
	'Energy',
	'Materials',
	'Industrials',
	'Consumer Discretionary',
	'Consumer Staples',
	'Health Care',
	'Financials',
	'Information Technology',
	'Communication Services',
	'Utilities',
	'Real Estate',
];

export default function JobDescriptionInput({ onSubmit }: JobDescriptionInputProps) {
	const [jobDescription, setJobDescription] = useState('');
	const [industry, setIndustry] = useState('');
	const [title, setTitle] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (jobDescription.trim().length < 50) {
			alert('Job description must be at least 50 characters long');
			return;
		}

		if (!industry) {
			alert('Please select an industry');
			return;
		}

		if (!title.trim()) {
			alert('Please enter a job title');
			return;
		}

		onSubmit(jobDescription, industry, title);
	};

	return (
		<div className='bg-white rounded-lg shadow-lg p-8'>
			<div className='text-center mb-8'>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>
					Identify Automation Opportunities (<i>for free</i>)
				</h2>
			</div>
			<form onSubmit={handleSubmit} className='space-y-6'>
				<div>
					<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-2'>
						Job Title
					</label>
					<input
						id='title'
						type='text'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='e.g., Operations Manager, Quality Control Specialist'
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						required
					/>
				</div>

				<div>
					<label htmlFor='industry' className='block text-sm font-medium text-gray-700 mb-2'>
						Industry
					</label>
					<select
						id='industry'
						value={industry}
						onChange={(e) => setIndustry(e.target.value)}
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						required>
						<option value=''>Select your industry</option>
						{INDUSTRIES.map((ind) => (
							<option key={ind} value={ind}>
								{ind}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor='jobDescription' className='block text-sm font-medium text-gray-700 mb-2'>
						Job Description
					</label>
					<textarea
						id='jobDescription'
						value={jobDescription}
						onChange={(e) => setJobDescription(e.target.value)}
						placeholder='Paste your job description here... (minimum 50 characters)'
						className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						rows={12}
						required
						minLength={50}
					/>
					<p className='mt-1 text-sm text-gray-500'>{jobDescription.length} characters (minimum 50 required)</p>
				</div>

				<button
					type='submit'
					disabled={jobDescription.trim().length < 50 || !industry || !title.trim()}
					className='w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium'>
					Analyze Job Description
				</button>
			</form>
		</div>
	);
}
