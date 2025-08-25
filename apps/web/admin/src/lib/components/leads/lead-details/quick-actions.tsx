import {FC} from "react";
import {Button} from "@nlc-ai/web-ui";

interface IProps {
  leadID: string;
}

export const QuickActions: FC<IProps> = () => {
  return (
    <div className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[20px] border border-neutral-700 p-6">
      <h3 className="text-stone-50 text-lg font-medium mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => console.log('Mark as contacted')}
          className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30"
        >
          Mark as Contacted
        </Button>
        <Button
          onClick={() => console.log('Schedule meeting')}
          className="bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30"
        >
          Schedule Meeting
        </Button>
        <Button
          onClick={() => console.log('Mark as converted')}
          className="bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
        >
          Mark as Converted
        </Button>
        <Button
          onClick={() => console.log('Mark unresponsive')}
          className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
        >
          Mark as Unresponsive
        </Button>
      </div>
    </div>
  );
}
