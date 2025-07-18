'use client'

import {useState, useEffect} from 'react';
import {mockClientData, RetentionStatsTableContainer} from "@/lib";
import { StatCard } from '@nlc-ai/shared';

interface RetentionStats {
  retentionClients: number;
  feedbackResponses: number;
}

export default function RetentionStats() {
  const [stats, _] = useState<RetentionStats>({ retentionClients: 938, feedbackResponses: 1356 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-4 sm:py-6 lg:py-8 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <StatCard
            isLoading={isLoading}
            title="# of Clients Who Came Back To The Course After Receiving The Retention Mail"
            value={stats.retentionClients.toString()}
          />
          <RetentionStatsTableContainer
            title="Successful Retentions"
            data={mockClientData}
            dateColumn="lastInteractionAt"
            isLoading={isLoading}
          />
        </div>
        <div>
          <StatCard
            isLoading={isLoading}
            title="# of Clients Who Responded To The Feedback Survey Form"
            value={stats.feedbackResponses.toString()}
          />
          <RetentionStatsTableContainer
            title="Feedback Received From"
            data={mockClientData}
            dateColumn="respondedOn"
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
