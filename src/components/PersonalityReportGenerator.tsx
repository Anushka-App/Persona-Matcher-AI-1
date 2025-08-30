import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Download, RefreshCw, FileText } from 'lucide-react';

interface PersonalityReportInput {
  name: string;
  hobbies: string[];
  communication_style: string;
  favorite_books_movies: string[];
  strengths: string[];
  weaknesses: string[];
}

interface PersonalityReport {
  introduction: string;
  hobbies_analysis: string;
  communication_analysis: string;
  media_preferences_analysis: string;
  strengths_weaknesses_analysis: string;
  conclusion: string;
  personalized_recommendations: string[];
}

interface QuizAnswer {
  question: string;
  selected_personality: string;
}

export function PersonalityReportGenerator() {
  const [userInput, setUserInput] = useState<PersonalityReportInput>({
    name: '',
    hobbies: [''],
    communication_style: '',
    favorite_books_movies: [''],
    strengths: [''],
    weaknesses: ['']
  });

  const [report, setReport] = useState<PersonalityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'quiz'>('manual');

  const addArrayItem = (field: keyof PersonalityReportInput, value: string = '') => {
    setUserInput(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value]
    }));
  };

  const removeArrayItem = (field: keyof PersonalityReportInput, index: number) => {
    setUserInput(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof PersonalityReportInput, index: number, value: string) => {
    setUserInput(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/personality-report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInput),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setReport(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateFromQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sample quiz answers - in a real app, this would come from actual quiz results
      const quizAnswers: QuizAnswer[] = [
        { question: "What do you enjoy doing in your free time?", selected_personality: userInput.hobbies[0] || "various activities" },
        { question: "How do you prefer to communicate?", selected_personality: userInput.communication_style || "adaptively" },
        { question: "What type of media do you enjoy?", selected_personality: userInput.favorite_books_movies[0] || "diverse genres" },
        { question: "What are your main strengths?", selected_personality: userInput.strengths[0] || "adaptability" },
        { question: "What areas would you like to improve?", selected_personality: userInput.weaknesses[0] || "personal growth" }
      ];

      const response = await fetch('/api/personality-report/generate-from-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizAnswers,
          userInfo: { name: userInput.name || 'User' }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report from quiz');
      }

      setReport(data.data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
PERSONALITY REPORT FOR ${userInput.name.toUpperCase()}

${report.introduction}

HOBBIES ANALYSIS:
${report.hobbies_analysis}

COMMUNICATION ANALYSIS:
${report.communication_analysis}

MEDIA PREFERENCES ANALYSIS:
${report.media_preferences_analysis}

STRENGTHS AND WEAKNESSES ANALYSIS:
${report.strengths_weaknesses_analysis}

CONCLUSION:
${report.conclusion}

PERSONALIZED RECOMMENDATIONS:
${report.personalized_recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personality-report-${userInput.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setUserInput({
      name: '',
      hobbies: [''],
      communication_style: '',
      favorite_books_movies: [''],
      strengths: [''],
      weaknesses: ['']
    });
    setReport(null);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Personality Report Generator</h1>
        <p className="text-gray-600">
          Generate detailed personality profiles based on user input or quiz results
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manual Input
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'quiz'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quiz-Based
        </button>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {activeTab === 'manual' 
              ? 'Fill in your details to generate a personalized personality report'
              : 'Provide basic information and we\'ll generate a report based on quiz-style analysis'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userInput.name}
                onChange={(e) => setUserInput(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communication_style">Communication Style</Label>
              <Input
                id="communication_style"
                value={userInput.communication_style}
                onChange={(e) => setUserInput(prev => ({ ...prev, communication_style: e.target.value }))}
                placeholder="e.g., direct, empathetic, analytical"
              />
            </div>
          </div>

          {/* Hobbies */}
          <div className="space-y-2">
            <Label>Hobbies & Interests</Label>
            <div className="space-y-2">
              {userInput.hobbies.map((hobby, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={hobby}
                    onChange={(e) => updateArrayItem('hobbies', index, e.target.value)}
                    placeholder="e.g., reading, hiking, photography"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('hobbies', index)}
                    disabled={userInput.hobbies.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('hobbies')}
              >
                Add Hobby
              </Button>
            </div>
          </div>

          {/* Favorite Books/Movies */}
          <div className="space-y-2">
            <Label>Favorite Books & Movies</Label>
            <div className="space-y-2">
              {userInput.favorite_books_movies.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem('favorite_books_movies', index, e.target.value)}
                    placeholder="e.g., The Alchemist, Inception"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('favorite_books_movies', index)}
                    disabled={userInput.favorite_books_movies.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('favorite_books_movies')}
              >
                Add Book/Movie
              </Button>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label>Strengths</Label>
            <div className="space-y-2">
              {userInput.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={strength}
                    onChange={(e) => updateArrayItem('strengths', index, e.target.value)}
                    placeholder="e.g., creativity, leadership, empathy"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('strengths', index)}
                    disabled={userInput.strengths.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('strengths')}
              >
                Add Strength
              </Button>
            </div>
          </div>

          {/* Weaknesses */}
          <div className="space-y-2">
            <Label>Areas for Growth</Label>
            <div className="space-y-2">
              {userInput.weaknesses.map((weakness, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={weakness}
                    onChange={(e) => updateArrayItem('weaknesses', index, e.target.value)}
                    placeholder="e.g., patience, organization, confidence"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('weaknesses', index)}
                    disabled={userInput.weaknesses.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('weaknesses')}
              >
                Add Growth Area
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={activeTab === 'manual' ? generateReport : generateFromQuiz}
              disabled={loading || !userInput.name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  {activeTab === 'manual' ? 'Generate Report' : 'Generate from Quiz'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Report Display */}
      {report && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Personality Report for {userInput.name}</CardTitle>
                <CardDescription>
                  Generated on {new Date().toLocaleDateString()}
                </CardDescription>
              </div>
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Introduction */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Introduction</h3>
              <p className="text-gray-700 leading-relaxed">{report.introduction}</p>
            </div>

            {/* Hobbies Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Hobbies Analysis</h3>
              <p className="text-gray-700 leading-relaxed">{report.hobbies_analysis}</p>
            </div>

            {/* Communication Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Communication Analysis</h3>
              <p className="text-gray-700 leading-relaxed">{report.communication_analysis}</p>
            </div>

            {/* Media Preferences Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Media Preferences Analysis</h3>
              <p className="text-gray-700 leading-relaxed">{report.media_preferences_analysis}</p>
            </div>

            {/* Strengths and Weaknesses Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Strengths & Growth Areas</h3>
              <p className="text-gray-700 leading-relaxed">{report.strengths_weaknesses_analysis}</p>
            </div>

            {/* Conclusion */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Conclusion</h3>
              <p className="text-gray-700 leading-relaxed">{report.conclusion}</p>
            </div>

            {/* Personalized Recommendations */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Personalized Recommendations</h3>
              <div className="space-y-2">
                {report.personalized_recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Badge variant="secondary" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
