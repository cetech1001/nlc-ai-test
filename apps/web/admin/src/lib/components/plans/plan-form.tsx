import {
  Button,
  Input,
  Textarea,
  Label
} from "@nlc-ai/web-ui";
import { X, Plus, Palette, Bot } from "lucide-react";
import {useEffect, useState} from "react";
import {PLAN_COLORS} from "@nlc-ai/web-utils";
import {CreatePlanRequest, Plan, PlanFormData, PlanFormErrors, AiAgent} from "@nlc-ai/sdk-billing";
import {sdkClient} from "@/lib";

interface IProps {
  type: "create" | "edit";
  onAction: (requestData: CreatePlanRequest) => Promise<void>;
  onDiscard: () => void;
  originalPlan?: Plan | null;
}

export const PlanForm = (props: IProps) => {
  const [newFeature, setNewFeature] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [errors, setErrors] = useState<PlanFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiAgents, setAiAgents] = useState<AiAgent[]>([]);
  const [loadingAiAgents, setLoadingAiAgents] = useState(true);

  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    color: "",
    description: "",
    monthlyPrice: "",
    annualPrice: "",
    maxClients: "",
    maxAiAgents: "",
    features: [],
    isActive: true,
    accessibleAiAgents: [],
  });

  useEffect(() => {
    loadAiAgents();
  }, []);

  useEffect(() => {
    if (props.originalPlan) {
      const plan = props.originalPlan;
      setFormData({
        name: plan.name,
        description: plan.description || "",
        color: plan.color || "",
        monthlyPrice: (plan.monthlyPrice / 100).toString(),
        annualPrice: (plan.annualPrice / 100).toString(),
        maxClients: plan.maxClients?.toString() || "",
        maxAiAgents: plan.maxAiAgents?.toString() || "",
        features: plan.features || [],
        isActive: plan.isActive,
        accessibleAiAgents: plan.planAiAgents?.map(paa => paa.agentID) || [],
      });
    }
  }, [props.originalPlan]);

  const loadAiAgents = async () => {
    try {
      setLoadingAiAgents(true);
      const agents = await sdkClient.billing.plans.getAllAiAgents();
      setAiAgents(agents);
    } catch (error) {
      console.error('Failed to load AI agents:', error);
    } finally {
      setLoadingAiAgents(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PlanFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Plan title is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Plan title must be at least 2 characters";
    }

    if (!formData.monthlyPrice.trim()) {
      newErrors.monthlyPrice = "Monthly price is required";
    } else {
      const price = parseFloat(formData.monthlyPrice);
      if (isNaN(price) || price < 0) {
        newErrors.monthlyPrice = "Monthly price must be a valid positive number";
      }
    }

    if (!formData.annualPrice.trim()) {
      newErrors.annualPrice = "Annual price is required";
    } else {
      const price = parseFloat(formData.annualPrice);
      if (isNaN(price) || price < 0) {
        newErrors.annualPrice = "Annual price must be a valid positive number";
      }
    }

    if (formData.maxClients.trim()) {
      const maxClients = parseInt(formData.maxClients);
      if (isNaN(maxClients) || maxClients < 0) {
        newErrors.maxClients = "Max clients must be a valid positive number";
      }
    }

    if (formData.maxAiAgents.trim()) {
      const maxAgents = parseInt(formData.maxAiAgents);
      if (isNaN(maxAgents) || maxAgents < 0) {
        newErrors.maxAiAgents = "Max AI agents must be a valid positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof PlanFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      const updatedFeatures = [...formData.features, newFeature.trim()];
      handleInputChange("features", updatedFeatures);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    handleInputChange("features", updatedFeatures);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const handleAiAgentToggle = (agentID: string) => {
    const updatedAgents = formData.accessibleAiAgents.includes(agentID)
      ? formData.accessibleAiAgents.filter(id => id !== agentID)
      : [...formData.accessibleAiAgents, agentID];
    handleInputChange("accessibleAiAgents", updatedAgents);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const requestData: CreatePlanRequest = {
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim() || undefined,
        monthlyPrice: Math.round(parseFloat(formData.monthlyPrice) * 100),
        annualPrice: Math.round(parseFloat(formData.annualPrice) * 100),
        maxClients: formData.maxClients.trim() ? parseInt(formData.maxClients) : undefined,
        maxAiAgents: formData.maxAiAgents.trim() ? parseInt(formData.maxAiAgents) : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        isActive: formData.isActive,
        accessibleAiAgents: formData.accessibleAiAgents.length > 0 ? formData.accessibleAiAgents : undefined,
      };

      await props.onAction(requestData);
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrors({ name: "A plan with this name already exists" });
      } else {
        setErrors({ general: error.message || `Failed to ${props.type} plan` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isLoading) return;

    const hasChanges = Object.values(formData).some((value, index) => {
      const initialValues = ["", "", "", "", "", "", [], true, []];
      return JSON.stringify(value) !== JSON.stringify(initialValues[index]);
    });

    if (hasChanges && !confirm("Are you sure you want to discard your changes?")) {
      return;
    }

    props.onDiscard();
  };

  const selectedColor = PLAN_COLORS.find(color => color.value === formData.color) || PLAN_COLORS[0];

  return (
    <div className="max-w-4xl">
      {errors?.general && (
        <div className="mb-6 p-4 bg-red-800/20 border border-red-600 rounded-lg">
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white text-sm">
            Plan Title <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
              errors?.name ? 'border-red-500' : ''
            }`}
            placeholder="Enter plan title (e.g., Growth Pro)"
            disabled={isLoading}
          />
          {errors?.name && (
            <p className="text-red-400 text-sm">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white text-sm">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 min-h-[60px] resize-none"
            placeholder="Enter brief description for the plan (e.g., Perfect for growing coaching businesses)"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white text-sm">
            Plan Color
          </Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={isLoading}
              className="flex items-center gap-3 w-full p-3 bg-background border border-[#3A3A3A] rounded-lg text-white hover:border-[#7B21BA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                className={`w-6 h-6 rounded-full ${selectedColor.class}`}
                style={{ backgroundColor: formData.color }}
              />
              <span className="flex-1 text-left">{selectedColor.label}</span>
              <Palette className="w-4 h-4 text-[#A0A0A0]" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-4 gap-3">
                  {PLAN_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => {
                        handleInputChange("color", color.value);
                        setShowColorPicker(false);
                      }}
                      disabled={isLoading}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        formData.color === color.value
                          ? 'border-white bg-[#3A3A3A]'
                          : 'border-transparent hover:border-[#7B21BA]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${color.class}`}
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-xs text-white">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors?.color && (
            <p className="text-red-400 text-sm">{errors.color}</p>
          )}
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
              value={formData.monthlyPrice}
              onChange={(e) => handleInputChange("monthlyPrice", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                errors?.monthlyPrice ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors?.monthlyPrice && (
              <p className="text-red-400 text-sm">{errors.monthlyPrice}</p>
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
              value={formData.annualPrice}
              onChange={(e) => handleInputChange("annualPrice", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                errors?.annualPrice ? 'border-red-500' : ''
              }`}
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors?.annualPrice && (
              <p className="text-red-400 text-sm">{errors.annualPrice}</p>
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
              value={formData.maxClients}
              onChange={(e) => handleInputChange("maxClients", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                errors?.maxClients ? 'border-red-500' : ''
              }`}
              placeholder="Leave empty for unlimited"
              disabled={isLoading}
            />
            {errors?.maxClients && (
              <p className="text-red-400 text-sm">{errors.maxClients}</p>
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
              value={formData.maxAiAgents}
              onChange={(e) => handleInputChange("maxAiAgents", e.target.value)}
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                errors?.maxAiAgents ? 'border-red-500' : ''
              }`}
              placeholder="Leave empty for unlimited"
              disabled={isLoading}
            />
            {errors?.maxAiAgents && (
              <p className="text-red-400 text-sm">{errors.maxAiAgents}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-white text-sm">
              Accessible AI Agents
            </Label>
            <Bot className="w-4 h-4 text-[#7B21BA]" />
          </div>

          {loadingAiAgents ? (
            <div className="p-4 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg">
              <p className="text-[#A0A0A0] text-sm">Loading AI agents...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`p-4 bg-[#2A2A2A] border rounded-lg cursor-pointer transition-all ${
                    formData.accessibleAiAgents.includes(agent.id)
                      ? 'border-[#7B21BA] bg-[#7B21BA]/10'
                      : 'border-[#3A3A3A] hover:border-[#7B21BA]/50'
                  }`}
                  onClick={() => handleAiAgentToggle(agent.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center ${
                      formData.accessibleAiAgents.includes(agent.id)
                        ? 'bg-[#7B21BA] border-[#7B21BA]'
                        : 'border-[#3A3A3A]'
                    }`}>
                      {formData.accessibleAiAgents.includes(agent.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{agent.name}</div>
                      {agent.description && (
                        <div className="text-[#A0A0A0] text-xs mt-1">{agent.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.accessibleAiAgents.length > 0 && (
            <div className="mt-3">
              <p className="text-white text-sm">
                Selected: {formData.accessibleAiAgents.length} AI agent{formData.accessibleAiAgents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {errors?.accessibleAiAgents && (
            <p className="text-red-400 text-sm">{errors.accessibleAiAgents}</p>
          )}
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
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={addFeature}
              disabled={!newFeature.trim() || isLoading}
              className="px-4 py-2 bg-[#7B21BA] hover:bg-[#8B31CA] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.features.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-white text-sm font-medium">Features ({formData.features.length}):</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2"
                  >
                    <span className="text-white text-sm flex-1">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      disabled={isLoading}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors?.features && (
            <p className="text-red-400 text-sm">{errors.features}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Label className="text-white text-sm">Plan Status</Label>
            <button
              type="button"
              onClick={() => handleInputChange("isActive", !formData.isActive)}
              disabled={isLoading}
              className={`w-16 p-1 rounded-[100px] border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.isActive
                  ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                  : "bg-stone-300 border-stone-300 justify-start"
              } flex items-center`}
            >
              <div className="w-6 h-6 bg-white rounded-full" />
            </button>
            <span className={`text-sm font-normal ${
              formData.isActive ? "text-white" : "text-zinc-500"
            }`}>
              {formData.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 hover:bg-[#8B31CA] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? (props.type === 'create' ? 'Creating...' : 'Saving...')
            : (props.type === 'create' ? 'Create Plan' : 'Save Changes')
          }
        </Button>
        <Button
          onClick={handleDiscard}
          disabled={isLoading}
          variant="outline"
          className="bg-transparent border-[#3A3A3A] text-white hover:bg-background px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
