import { useState } from "react";
import { Button } from "@nlc-ai/ui";
import { Eye, EyeOff, AlertCircle, ExternalLink } from "lucide-react";

interface CalendlyTokenFormProps {
  isOpen: boolean;
  onSubmit: (token: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const CalendlyTokenForm = ({ isOpen, onSubmit, onClose, isLoading }: CalendlyTokenFormProps) => {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Please enter your Calendly access token");
      return;
    }

    try {
      await onSubmit(token.trim());
      setToken("");
      setShowToken(false);
    } catch (error: any) {
      setError(error.message || "Failed to connect Calendly account");
    }
  };

  const handleClose = () => {
    setToken("");
    setShowToken(false);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-2xl p-6 w-full max-w-md">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">Connect Calendly Account</h3>
          <p className="text-[#A0A0A0] text-sm">
            Enter your Calendly Personal Access Token to connect your account.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-[#2A2A2A]/50 border border-[#3A3A3A] rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium mb-2 text-sm">How to get your token:</h4>
              <ol className="text-[#A0A0A0] text-xs space-y-1 list-decimal list-inside">
                <li>Go to your Calendly account settings</li>
                <li>Navigate to "Integrations" → "API & Webhooks"</li>
                <li>Generate a Personal Access Token</li>
                <li>Copy and paste it below</li>
              </ol>
              <a
                href="https://calendly.com/app/settings/developer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs mt-2"
              >
                Open Calendly Settings <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-white text-sm font-medium mb-2">
              Personal Access Token <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your Calendly access token"
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="flex-1 border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-[#555]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !token.trim()}
              className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-violet-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                "Connect Account"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
