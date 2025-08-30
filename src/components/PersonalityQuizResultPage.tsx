import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SharedHeader from './SharedHeader';

const sanitizeHtml = (html: string) => {
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/ on[a-z]+="[^"]*"/gi, '')
		.replace(/ on[a-z]+='[^']*'/gi, '');
};

const renderMarkdownToHtml = (md: string) => {
	const escapeHtml = (s: string) => s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	const boldified = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	const lines = boldified.split(/\r?\n/);
	const htmlParts: string[] = [];
	let listOpen = false;
	for (const raw of lines) {
		const line = raw.trim();
		if (line.startsWith('## ')) {
			if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
			htmlParts.push(`<h2 class="text-xl md:text-2xl font-bold text-gray-800 mt-4">${escapeHtml(line.slice(3))}</h2>`);
		} else if (line.startsWith('- ')) {
			if (!listOpen) { htmlParts.push('<ul class="list-disc ml-6 space-y-1">'); listOpen = true; }
			htmlParts.push(`<li>${escapeHtml(line.slice(2))}</li>`);
		} else if (line.length === 0) {
			if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
			htmlParts.push('');
		} else {
			if (listOpen) { htmlParts.push('</ul>'); listOpen = false; }
			htmlParts.push(`<p class="text-gray-700 leading-7">${escapeHtml(line)}</p>`);
		}
	}
	if (listOpen) htmlParts.push('</ul>');
	return sanitizeHtml(htmlParts.filter(Boolean).join('\n'));
};

const PersonalityQuizResultPage = () => {
	const navigate = useNavigate();
	const locationState = useLocation().state as {
		markdownReport?: string;
	} | null;

	const markdownReport = locationState?.markdownReport || '';

	return (
		<div className="min-h-screen bg-background">
			<SharedHeader />

			<div className="container mx-auto px-4 md:px-6 max-w-3xl">
				<div className="mb-6 md:mb-8 text-center">
					<h1 className="font-heading text-3xl md:text-4xl font-bold text-palo-primary">Your Personality</h1>
					<p className="text-muted-foreground mt-2">A simple, clear view of how you show up day to day.</p>
				</div>

				<div className="bg-white border rounded-2xl p-4 md:p-6">
					{markdownReport ? (
						<div className="prose max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(markdownReport) }} />
					) : (
						<div className="text-center text-gray-600">
							<p>No report content found.</p>
							<div className="mt-4">
								<Button onClick={() => navigate('/personality-quiz')}>Take Quiz</Button>
							</div>
						</div>
					)}
				</div>

				<div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
					<Button variant="outline" onClick={() => navigate('/personality-quiz')}>
						Retake Quiz
					</Button>
					<Button 
						onClick={() => navigate('/circle')}
						className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
					>
						Join Anuschka Circle
					</Button>
				</div>
			</div>
		</div>
	);
};

export default PersonalityQuizResultPage; 