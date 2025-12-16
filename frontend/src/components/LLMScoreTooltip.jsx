/**
 * LLM Score Tooltip Component
 * Detailed breakdown of LLM presence score calculation
 */

import { Info } from 'lucide-react';
import Tooltip from './Tooltip';

// Score calculation weights and formulas
const SCORE_WEIGHTS = {
  freshness: { weight: 0.20, name: 'Freshness' },
  answerability: { weight: 0.25, name: 'Answerability' },
  queryAlignment: { weight: 0.20, name: 'Query Alignment' },
  authority: { weight: 0.15, name: 'Authority' },
  structure: { weight: 0.12, name: 'Structure' },
  snippetQuality: { weight: 0.08, name: 'Snippet Quality' }
};

// Factor descriptions
const FACTOR_DETAILS = {
  freshness: {
    description: 'Measures content recency and update frequency',
    factors: [
      'Publication date',
      'Last modified date',
      'Content update frequency',
      'Time-sensitive information'
    ]
  },
  answerability: {
    description: 'How directly content answers user questions',
    factors: [
      'Clear answers to questions',
      'Direct problem solutions',
      'Step-by-step instructions',
      'Comprehensive coverage'
    ]
  },
  queryAlignment: {
    description: 'Matches common search queries and intent',
    factors: [
      'Keyword relevance',
      'Search intent alignment',
      'Natural language patterns',
      'Topic authority'
    ]
  },
  authority: {
    description: 'Trust and credibility signals',
    factors: [
      'Author expertise',
      'Citations and references',
      'External links quality',
      'Domain reputation'
    ]
  },
  structure: {
    description: 'Content organization for AI consumption',
    factors: [
      'Clear headings hierarchy',
      'Logical content flow',
      'Proper HTML semantics',
      'Structured data markup'
    ]
  },
  snippetQuality: {
    description: 'Optimization for featured snippets',
    factors: [
      'Concise answers',
      'List formatting',
      'Table structures',
      'Definition clarity'
    ]
  }
};

function LLMScoreTooltip({ metric, value }) {
  // Convert "Query Alignment" -> "queryAlignment", "Snippet Quality" -> "snippetQuality"
  const metricKey = metric
    .split(' ')
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
  
  const weight = SCORE_WEIGHTS[metricKey];
  const factorInfo = FACTOR_DETAILS[metricKey];

  if (!weight || !factorInfo) {
    console.warn(`[LLMScoreTooltip] No data found for metric: "${metric}" (key: "${metricKey}")`);
    return (
      <Tooltip content={`Score: ${(value * 100).toFixed(0)}%`}>
        <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
      </Tooltip>
    );
  }

  const content = (
    <div className="space-y-2.5 min-w-[280px]">
      {/* Header */}
      <div>
        <div className="font-bold text-sm text-white mb-1">{weight.name}</div>
        <div className="text-xs text-gray-300 leading-relaxed">{factorInfo.description}</div>
      </div>

      {/* Score Box */}
      <div className="bg-gray-800 rounded px-3 py-2 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Current Score</span>
          <span className="font-bold text-base text-white">{(value * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Weight in Total</span>
          <span className="font-semibold text-sm text-yellow-300">{(weight.weight * 100).toFixed(0)}%</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-700">
          <span className="text-xs text-gray-400">Contribution to Overall</span>
          <span className="font-semibold text-sm text-green-300">
            {(value * weight.weight * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Key Factors */}
      <div>
        <div className="text-xs font-semibold text-gray-200 mb-1.5">Evaluation Factors:</div>
        <ul className="space-y-1">
          {factorInfo.factors.map((factor, idx) => (
            <li key={idx} className="text-xs text-gray-300 flex items-start leading-relaxed">
              <span className="text-blue-400 mr-1.5 mt-0.5">▪</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <Tooltip content={content} maxWidth="max-w-md">
      <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
    </Tooltip>
  );
}

// Overall LLM Score Tooltip
export function OverallLLMScoreTooltip({ scores }) {
  const totalScore = Object.keys(SCORE_WEIGHTS).reduce((total, key) => {
    const score = scores[key] || 0;
    const weight = SCORE_WEIGHTS[key].weight;
    return total + (score * weight);
  }, 0);

  const content = (
    <div className="space-y-2.5 min-w-[320px] max-w-[400px]">
      {/* Header */}
      <div>
        <div className="font-bold text-base text-white mb-1">📊 LLM Presence Score</div>
        <div className="text-xs text-gray-300 leading-relaxed">
          How discoverable and useful your content is to AI platforms
        </div>
      </div>

      {/* Overall Score Highlight */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg px-4 py-3 text-center">
        <div className="text-xs text-gray-300 mb-1">Overall Score</div>
        <div className="text-3xl font-bold text-white">
          {(totalScore * 100).toFixed(1)}%
        </div>
        <div className="text-xs mt-1">
          {totalScore >= 0.8 && <span className="text-green-300">✓ Excellent</span>}
          {totalScore >= 0.6 && totalScore < 0.8 && <span className="text-yellow-300">⚠ Good</span>}
          {totalScore < 0.6 && <span className="text-red-300">✗ Needs Work</span>}
        </div>
      </div>

      {/* Calculation Formula */}
      <div>
        <div className="text-xs font-semibold text-gray-200 mb-1.5">How It's Calculated:</div>
        <div className="bg-gray-800 rounded-lg p-2.5 space-y-1">
          {Object.entries(SCORE_WEIGHTS).map(([key, data]) => {
            const score = scores[key] || 0;
            const contribution = score * data.weight;
            return (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  {data.name} <span className="text-gray-500">({(score * 100).toFixed(0)}% × {(data.weight * 100).toFixed(0)}%)</span>
                </span>
                <span className="text-white font-semibold tabular-nums">
                  = {(contribution * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
          <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-sm">
            <span className="text-gray-200">Total</span>
            <span className="text-green-400 tabular-nums">{(totalScore * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Weight Distribution */}
      <div>
        <div className="text-xs font-semibold text-gray-200 mb-1.5">Weight Distribution:</div>
        <div className="space-y-1.5">
          {Object.entries(SCORE_WEIGHTS)
            .sort((a, b) => b[1].weight - a[1].weight)
            .map(([key, data]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${data.weight * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300 w-28 text-right tabular-nums">
                  {data.name.split(' ')[0]}: {(data.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-gray-800 rounded-lg p-2.5">
        <div className="text-xs font-semibold text-gray-200 mb-1">What This Means:</div>
        <div className="text-xs text-gray-300 leading-relaxed">
          {totalScore >= 0.8 && (
            <p>Your content is <span className="text-green-300 font-semibold">highly optimized</span> for AI platforms. LLMs will easily discover and cite this content.</p>
          )}
          {totalScore >= 0.6 && totalScore < 0.8 && (
            <p>Your content is <span className="text-yellow-300 font-semibold">well-structured</span> but has room for improvement. Consider the recommendations below.</p>
          )}
          {totalScore < 0.6 && (
            <p>Your content <span className="text-red-300 font-semibold">needs optimization</span>. Focus on the metrics with lowest scores for maximum impact.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Tooltip content={content} maxWidth="max-w-lg">
      <Info className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help transition-colors" />
    </Tooltip>
  );
}

export default LLMScoreTooltip;

