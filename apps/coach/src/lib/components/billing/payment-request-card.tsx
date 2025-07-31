import {ExternalLink} from "lucide-react";
import {CoachPaymentRequest} from "@nlc-ai/types";
import {FC} from "react";

interface IProps {
  request: CoachPaymentRequest;
  onMakePayment: (request: CoachPaymentRequest) => void;
}

export const PaymentRequestCard: FC<IProps> = ({ request, onMakePayment }) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { text: 'Paid', color: 'text-green-600' };
      case 'expired':
        return { text: 'Expired', color: 'text-red-600' };
      case 'pending':
      default:
        return { text: 'Pending', color: 'text-yellow-600' };
    }
  };

  const statusDisplay = getStatusDisplay(request.status);

  return (
    <div className="bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] rounded-[30px] border border-neutral-700 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-stone-50 text-xl font-semibold font-['Inter'] leading-relaxed">
            ${(request.amount / 100).toFixed(2)} Payment Request
          </h3>
          <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">
            Created {new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
          </p>
        </div>
        <div className={`text-base font-medium font-['Inter'] ${statusDisplay.color}`}>
          {statusDisplay.text}
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-3 mb-6 flex-1">
        <div>
          <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Plan</p>
          <p className="text-stone-50 text-base font-medium font-['Inter']">{request.planName}</p>
        </div>

        {request.description && (
          <div>
            <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Description</p>
            <p className="text-stone-50 text-base font-medium font-['Inter']">{request.description}</p>
          </div>
        )}

        {request.expiresAt && (
          <div>
            <p className="text-stone-300 text-sm font-normal font-['Inter'] leading-relaxed">Expires</p>
            <p className="text-stone-50 text-base font-medium font-['Inter']">
              {new Date(request.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Status Message */}
      {request.status === 'paid' && (
        <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">
            Payment of ${(request.totalAmountReceived / 100).toFixed(2)} received successfully
          </p>
        </div>
      )}

      {request.status === 'expired' && (
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">
            This payment request has expired. Please contact support for assistance.
          </p>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-3 mb-4">
          <p className="text-yellow-400 text-sm">
            This payment will activate your {request.planName} subscription.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {request.status === 'pending' && (
          <button
            onClick={() => onMakePayment(request)}
            className="flex-1 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Make Payment
          </button>
        )}

        <button
          onClick={() => window.open(request.paymentLinkUrl, '_blank')}
          className="px-4 py-2 bg-transparent border border-white/30 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Link
        </button>
      </div>
    </div>
  );
};
