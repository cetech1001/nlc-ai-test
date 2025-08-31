import {Lead, LeadAnswers, questions} from "@nlc-ai/sdk-leads";
import {CheckCircle, XCircle} from "lucide-react";

export const QualificationSummary = ({ lead }: { lead: Lead }) => {
  const calculateQualificationDetails = () => {
    if (!lead.answers) return { disqualifying: 0, qualifying: 0, points: 0, details: [] };

    let disqualifying = 0;
    let qualifying = 0;
    let points = 0;
    const details: string[] = [];

    Object.entries(lead.answers as LeadAnswers).forEach(([questionID, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionID));
      if (!question) return;

      if (Array.isArray(answer)) {
        answer.forEach(value => {
          const cleanValue = value.startsWith('other:') ? 'other' : value;
          const option = question.options?.find(opt => opt.value === cleanValue);
          if (option?.disqualifies) {
            disqualifying++;
            details.push(`❌ Q${questionID}: ${option.text}`);
          }
          if (option?.qualifies) {
            qualifying++;
            details.push(`✅ Q${questionID}: ${option.text}`);
          }
          if (option?.points) {
            points += option.points;
            details.push(`⭐ Q${questionID}: +${option.points} points`);
          }
        });
      } else {
        const cleanValue = answer.startsWith('other:') ? 'other' : answer;
        const option = question.options?.find(opt => opt.value === cleanValue);
        if (option?.disqualifies) {
          disqualifying++;
          details.push(`❌ Q${questionID}: ${option.text}`);
        }
        if (option?.qualifies) {
          qualifying++;
          details.push(`✅ Q${questionID}: ${option.text}`);
        }
        if (option?.points) {
          points += option.points;
          details.push(`⭐ Q${questionID}: +${option.points} points`);
        }
      }
    });

    return { disqualifying, qualifying, points, details };
  };

  const { disqualifying, qualifying, points, details } = calculateQualificationDetails();
  const isQualified = disqualifying < 3; // Based on your qualification logic

  return (
    <div className={`p-4 rounded-xl border ${
      isQualified
        ? 'bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-600/20'
        : 'bg-gradient-to-r from-red-600/10 to-pink-600/10 border-red-600/20'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isQualified ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={`font-medium ${isQualified ? 'text-green-400' : 'text-red-400'}`}>
            {isQualified ? 'Qualified Lead' : 'Not Qualified'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-400">✅ {qualifying} Qualifying</span>
          <span className="text-red-400">❌ {disqualifying} Disqualifying</span>
          {points > 0 && <span className="text-blue-400">⭐ {points} Points</span>}
        </div>
      </div>

      <div className={`text-sm ${isQualified ? 'text-green-300' : 'text-red-300'}`}>
        <strong>Qualification Logic:</strong> {isQualified
        ? `Passed with ${disqualifying} disqualifying answers (needs <3 to qualify)`
        : `Failed with ${disqualifying} disqualifying answers (needs <3 to qualify)`
      }
      </div>

      {details.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-300">
            View detailed breakdown ({details.length} factors)
          </summary>
          <div className="mt-2 space-y-1">
            {details.map((detail, index) => (
              <div key={index} className="text-xs text-stone-400 pl-4">
                {detail}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
