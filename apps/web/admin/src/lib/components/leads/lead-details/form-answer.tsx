import {CheckCircle, Star, XCircle} from "lucide-react";
import {questions} from "@nlc-ai/sdk-leads";

export const FormAnswer = ({ questionNumber, answer }: { questionNumber: string, answer: any }) => {
  const questionID = parseInt(questionNumber);
  const question = questions.find(q => q.id === questionID);

  if (!question) {
    return (
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
        <div className="text-red-400 text-sm">Question {questionNumber} not found</div>
      </div>
    );
  }

  const formatAnswerWithLabels = (answer: any): { text: string; indicators: Array<{type: string, label: string}> } => {
    const indicators: Array<{type: string, label: string}> = [];

    if (Array.isArray(answer)) {
      const formattedAnswers = answer.map(value => {
        const cleanValue = value.startsWith('other:') ? 'other' : value;
        const option = question.options?.find(opt => opt.value === cleanValue);

        if (option) {
          // Track qualification indicators
          if (option.disqualifies) indicators.push({type: 'disqualify', label: 'Disqualifying'});
          if (option.qualifies) indicators.push({type: 'qualify', label: 'Qualifying'});
          if (option.points) indicators.push({type: 'points', label: `+${option.points} pts`});

          return value.startsWith('other:') ? `Other: ${value.substring(6).trim()}` : option.text;
        }
        return value;
      });
      return { text: formattedAnswers.join(', '), indicators };
    }

    if (typeof answer === 'string') {
      const cleanValue = answer.startsWith('other:') ? 'other' : answer;
      const option = question.options?.find(opt => opt.value === cleanValue);

      if (option) {
        // Track qualification indicators
        if (option.disqualifies) indicators.push({type: 'disqualify', label: 'Disqualifying'});
        if (option.qualifies) indicators.push({type: 'qualify', label: 'Qualifying'});
        if (option.points) indicators.push({type: 'points', label: `+${option.points} pts`});

        const displayText = answer.startsWith('other:') ? `Other: ${answer.substring(6).trim()}` : option.text;
        return { text: displayText, indicators };
      }
    }

    return { text: answer.toString(), indicators };
  };

  const { text: formattedText, indicators } = formatAnswerWithLabels(answer);

  // Get color based on qualification status
  const getAnswerColor = (): string => {
    if (indicators.some(i => i.type === 'disqualify')) return 'text-red-400';
    if (indicators.some(i => i.type === 'qualify')) return 'text-green-400';
    if (indicators.some(i => i.type === 'points')) return 'text-blue-400';
    return 'text-stone-300';
  };

  const getBorderColor = (): string => {
    if (indicators.some(i => i.type === 'disqualify')) return 'border-red-600/30 hover:border-red-600/50';
    if (indicators.some(i => i.type === 'qualify')) return 'border-green-600/30 hover:border-green-600/50';
    if (indicators.some(i => i.type === 'points')) return 'border-blue-600/30 hover:border-blue-600/50';
    return 'border-neutral-700/50 hover:border-fuchsia-600/30';
  };

  return (
    <div className={`bg-neutral-800/50 rounded-lg p-4 border transition-all duration-200 ${getBorderColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-emerald-400 text-sm font-medium flex-1 pr-2">
          {question.text}
        </div>
        <div className="flex items-center gap-2">
          {/* Question number badge */}
          <div className="text-xs text-stone-500 bg-neutral-700/50 px-2 py-1 rounded flex-shrink-0">
            Q{questionNumber}
          </div>
          {/* Multi-select indicator */}
          {question.multiSelect && (
            <div className="text-xs text-purple-400 bg-purple-600/20 px-2 py-1 rounded flex-shrink-0">
              Multi
            </div>
          )}
        </div>
      </div>

      <div className={`${getAnswerColor()} font-medium mb-3`}>
        {formattedText}
      </div>

      {/* Qualification indicators */}
      {indicators.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {indicators.map((indicator, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                indicator.type === 'disqualify'
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : indicator.type === 'qualify'
                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                    : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
              }`}
            >
              {indicator.type === 'disqualify' && <XCircle className="w-3 h-3 mr-1" />}
              {indicator.type === 'qualify' && <CheckCircle className="w-3 h-3 mr-1" />}
              {indicator.type === 'points' && <Star className="w-3 h-3 mr-1" />}
              {indicator.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
