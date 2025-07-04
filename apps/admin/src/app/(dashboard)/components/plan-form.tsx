import {
  Button,
  Input,
  Textarea,
  Label
} from "@nlc-ai/ui";
import { X, Plus } from "lucide-react";
import { useState } from "react";

interface FormData {
  planTitle: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  maxClients: string;
  maxAiAgents: string;
  features: string[];
  isActive: boolean;
}

interface FormErrors {
  planTitle?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  maxClients?: string;
  maxAiAgents?: string;
  features?: string;
  general?: string;
}

interface IProps {
  type: "create" | "edit";
  formData: FormData;
  handleInputChange: (field: string, value: string | boolean | string[]) => void;
  onAction: () => void;
  onDiscard: () => void;
  isLoading?: boolean;
  errors?: FormErrors;
}

export const PlanForm = (props: IProps) => {
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (newFeature.trim() && !props.formData.features.includes(newFeature.trim())) {
      const updatedFeatures = [...props.formData.features, newFeature.trim()];
      props.handleInputChange("features", updatedFeatures);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = props.formData.features.filter((_, i) => i !== index);
    props.handleInputChange("features", updatedFeatures);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  return (
    <div className="max-w-4xl">
      {props.errors?.general && (
        <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{props.errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="planTitle" className="text-white text-sm">
            Plan Title <span className="text-red-400">*</span>
          </Label>
          <Input
            id="planTitle"
            type="text"
            value={props.formData.planTitle}
            onChange={(e) => props.handleInputChange("planTitle", e.target.value)}
            className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
              props.errors?.planTitle ? 'border-red-500' : ''
            }`}
            placeholder="Enter plan title (e.g., Growth Pro)"
            disabled={props.isLoading}
          />
          {props.errors?.planTitle && (
            <p className="text-red-400 text-sm">{props.errors.planTitle}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white text-sm">
            Description
          </Label>
          <Textarea
            id="description"
            value={props.formData.description}
            onChange={(e) => props.handleInputChange("description", e.target.value)}
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 min-h-[60px] resize-none"
            placeholder="Enter brief description for the plan (e.g., Perfect for growing coaching businesses)"
            disabled={props.isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice" className="text-white text-sm">
              Monthly Price ($) <span className="text-red-400">*</span>
            </Label>
            <Input
              id="monthlyPrice"
              type="number"
              min="0"
              step="0.01"
              value={props.formData.monthlyPrice}
              onChange={(e) => props.handleInputChange("monthlyPrice", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                props.errors?.monthlyPrice ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={props.isLoading}
            />
            {props.errors?.monthlyPrice && (
              <p className="text-red-400 text-sm">{props.errors.monthlyPrice}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualPrice" className="text-white text-sm">
              Annual Price ($) <span className="text-red-400">*</span>
            </Label>
            <Input
              id="annualPrice"
              type="number"
              min="0"
              step="0.01"
              value={props.formData.annualPrice}
              onChange={(e) => props.handleInputChange("annualPrice", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                props.errors?.annualPrice ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={props.isLoading}
            />
            {props.errors?.annualPrice && (
              <p className="text-red-400 text-sm">{props.errors.annualPrice}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxClients" className="text-white text-sm">
              Max Clients
            </Label>
            <Input
              id="maxClients"
              type="number"
              min="0"
              value={props.formData.maxClients}
              onChange={(e) => props.handleInputChange("maxClients", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                props.errors?.maxClients ? 'border-red-500' : ''
              }`}
              placeholder="Leave empty for unlimited"
              disabled={props.isLoading}
            />
            {props.errors?.maxClients && (
              <p className="text-red-400 text-sm">{props.errors.maxClients}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAiAgents" className="text-white text-sm">
              Max AI Agents
            </Label>
            <Input
              id="maxAiAgents"
              type="number"
              min="0"
              value={props.formData.maxAiAgents}
              onChange={(e) => props.handleInputChange("maxAiAgents", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                props.errors?.maxAiAgents ? 'border-red-500' : ''
              }`}
              placeholder="Leave empty for unlimited"
              disabled={props.isLoading}
            />
            {props.errors?.maxAiAgents && (
              <p className="text-red-400 text-sm">{props.errors.maxAiAgents}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="features" className="text-white text-sm">
              Included Features
            </Label>
          </div>

          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 flex-1"
              placeholder="Enter a feature (e.g., AI Email Management)"
              disabled={props.isLoading}
            />
            <Button
              type="button"
              onClick={addFeature}
              disabled={!newFeature.trim() || props.isLoading}
              className="px-4 py-2 bg-[#7B21BA] hover:bg-[#8B31CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {props.formData.features.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-white text-sm font-medium">Features ({props.formData.features.length}):</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {props.formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2"
                  >
                    <span className="text-white text-sm flex-1">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={props.isLoading}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {props.errors?.features && (
            <p className="text-red-400 text-sm">{props.errors.features}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Label className="text-white text-sm">Plan Status</Label>
            <button
              type="button"
              onClick={() => props.handleInputChange("isActive", !props.formData.isActive)}
              disabled={props.isLoading}
              className={`w-16 p-1 rounded-[100px] border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                props.formData.isActive
                  ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                  : "bg-stone-300 border-stone-300 justify-start"
              } flex items-center`}
            >
              <div className="w-6 h-6 bg-white rounded-full" />
            </button>
            <span className={`text-sm font-normal ${
              props.formData.isActive ? "text-white" : "text-zinc-500"
            }`}>
              {props.formData.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          onClick={props.onAction}
          disabled={props.isLoading}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {props.isLoading
            ? (props.type === 'create' ? 'Creating...' : 'Saving...')
            : (props.type === 'create' ? 'Create Plan' : 'Save Changes')
          }
        </Button>
        <Button
          onClick={props.onDiscard}
          disabled={props.isLoading}
          variant="outline"
          className="bg-transparent border-[#3A3A3A] text-white hover:bg-background px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
