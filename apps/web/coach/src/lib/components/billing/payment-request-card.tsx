import {PaymentRequest} from "@nlc-ai/sdk-billing";
import {FC} from "react";

interface IProps {
  request?: PaymentRequest;
  onMakePayment?: (request: PaymentRequest) => void;
  isLoading?: boolean;
}

export const PaymentRequestCardSkeleton: FC = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>
      <div className="relative z-10 flex flex-col h-full min-h-[300px]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-6 bg-neutral-700/50 rounded-lg w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-neutral-700/30 rounded w-32 animate-pulse" />
          </div>
          <div className="h-5 bg-neutral-700/50 rounded w-16 animate-pulse" />
        </div>

        <div className="space-y-4 mb-6 flex-1">
          <div>
            <div className="h-4 bg-neutral-700/30 rounded w-12 mb-1 animate-pulse" />
            <div className="h-5 bg-neutral-700/50 rounded w-24 animate-pulse" />
          </div>
          <div>
            <div className="h-4 bg-neutral-700/30 rounded w-20 mb-1 animate-pulse" />
            <div className="h-5 bg-neutral-700/50 rounded w-40 animate-pulse" />
          </div>
          <div>
            <div className="h-4 bg-neutral-700/30 rounded w-16 mb-1 animate-pulse" />
            <div className="h-5 bg-neutral-700/50 rounded w-28 animate-pulse" />
          </div>
        </div>

        <div className="bg-neutral-700/20 border border-neutral-700/30 rounded-lg p-3 mb-4">
          <div className="h-4 bg-neutral-700/50 rounded w-64 animate-pulse" />
        </div>

        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-neutral-700/50 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export const PaymentRequestCard: FC<IProps> = ({ request, onMakePayment, isLoading }) => {
  if (isLoading) {
    return <PaymentRequestCardSkeleton />;
  }

  if (!request) {
    return null;
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return { text: 'Paid', color: 'text-green-400' };
      case 'expired':
        return { text: 'Expired', color: 'text-red-400' };
      case 'pending':
      default:
        return { text: 'Pending', color: 'text-yellow-400' };
    }
  };

  const statusDisplay = getStatusDisplay(request.status);

  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-6 overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-56 h-56 -left-12 -top-20 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-stone-50 text-xl font-semibold leading-relaxed">
              ${(request.amount / 100).toFixed(2)} Payment Request
            </h3>
            <p className="text-stone-400 text-sm font-medium leading-tight">
              Created {new Date(request.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full border text-sm font-medium leading-relaxed ${
            request.status === 'paid'
              ? 'bg-green-700/20 border-green-700 text-green-400'
              : request.status === 'expired'
                ? 'bg-red-700/20 border-red-700 text-red-400'
                : 'bg-yellow-700/20 border-yellow-700 text-yellow-400'
          }`}>
            {statusDisplay.text}
          </div>
        </div>

        <div className="space-y-3 mb-6 flex-1">
          <div>
            <p className="text-stone-400 text-sm font-medium leading-tight mb-1">Plan</p>
            <p className="text-stone-50 text-base font-semibold">{request.planName}</p>
          </div>

          {request.description && (
            <div>
              <p className="text-stone-400 text-sm font-medium leading-tight mb-1">Description</p>
              <p className="text-stone-50 text-base font-medium">{request.description}</p>
            </div>
          )}

          {request.expiresAt && (
            <div>
              <p className="text-stone-400 text-sm font-medium leading-tight mb-1">Expires</p>
              <p className="text-stone-50 text-base font-medium">
                {new Date(request.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {request.status === 'paid' && (
          <div className="bg-green-700/20 border border-green-700/50 rounded-xl p-3 mb-4">
            <p className="text-green-400 text-sm font-medium">
              Payment of ${(request.totalAmountReceived / 100).toFixed(2)} received successfully
            </p>
          </div>
        )}

        {request.status === 'expired' && (
          <div className="bg-red-700/20 border border-red-700/50 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm font-medium">
              This payment request has expired. Please contact support for assistance.
            </p>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="bg-yellow-700/20 border border-yellow-700/50 rounded-xl p-3 mb-4">
            <p className="text-yellow-400 text-sm font-medium">
              This payment will activate your {request.planName} subscription.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-auto">
          {request.status === 'pending' && (
            <button
              onClick={() => onMakePayment?.(request)}
              className="flex-1 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-medium text-sm"
            >
              Make Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
