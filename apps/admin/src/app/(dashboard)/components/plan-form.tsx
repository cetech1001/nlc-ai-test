import {
  Button,
  Input,
  Textarea,
  Label
} from "@nlc-ai/ui";
import {HelpCircle as InfoIcon} from "lucide-react";


interface IProps {
  type: "create" | "edit";
  formData: {
    planTitle: string;
    monthlyPrice: string;
    annualPrice: string;
    description: string;
    features: string;
  }
  handleInputChange: (field: string, value: string) => void;
  onAction: () => void;
  onDiscard: () => void;
}

export const PlanForm = (props: IProps) => {
  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="planTitle" className="text-white text-sm">
            Plan Title
          </Label>
          <Input
            id="planTitle"
            type="text"
            value={props.formData.planTitle}
            onChange={(e) =>
              props.handleInputChange("planTitle", e.target.value)
            }
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
            placeholder="Enter plan title"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice" className="text-white text-sm">
              Monthly Price
            </Label>
            <Input
              id="monthlyPrice"
              type="text"
              value={props.formData.monthlyPrice}
              onChange={(e) =>
                props.handleInputChange("monthlyPrice", e.target.value)
              }
              className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
              placeholder="Enter monthly price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualPrice" className="text-white text-sm">
              Annual Price
            </Label>
            <Input
              id="annualPrice"
              type="text"
              value={props.formData.annualPrice}
              onChange={(e) =>
                props.handleInputChange("annualPrice", e.target.value)
              }
              className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20"
              placeholder="Enter annual price"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white text-sm">
            Description
          </Label>
          <Textarea
            id="description"
            value={props.formData.description}
            onChange={(e) =>
              props.handleInputChange("description", e.target.value)
            }
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 min-h-[60px] resize-none"
            placeholder="Enter brief description for the plan (e.g. who is this for)"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="features" className="text-white text-sm">
              Included Features
            </Label>
            <InfoIcon className="w-4 h-4 text-[#A0A0A0]" />
          </div>
          <Textarea
            id="features"
            value={props.formData.features}
            onChange={(e) =>
              props.handleInputChange("features", e.target.value)
            }
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 min-h-[150px] resize-none"
            placeholder="Enter features of the plan (each line will function as a separate feature)"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          onClick={props.onAction}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white px-8"
        >
          {props.type === 'create' ? 'Create Plan' : 'Save'}
        </Button>
        <Button
          onClick={props.onDiscard}
          variant="outline"
          className="bg-transparent border-[#3A3A3A] text-white hover:bg-background px-8"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
