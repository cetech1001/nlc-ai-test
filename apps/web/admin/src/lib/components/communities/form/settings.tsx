import React, {FC} from "react";
import { Input, Label } from '@nlc-ai/web-ui';
import {CommunityFormErrors, CreateCommunityForm} from "@/lib";

interface IProps {
  form: CreateCommunityForm;
  errors: CommunityFormErrors;
  updateSettings: (setting: string, value: string) => void;
}

const moderationLevels = [
  { value: 'strict', label: 'Strict', description: 'All posts require approval' },
  { value: 'moderate', label: 'Moderate', description: 'Some posts may require approval' },
  { value: 'relaxed', label: 'Relaxed', description: 'Posts are published immediately' },
];

export const CommunitySettingsFormStep: FC<IProps> = (props) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[
            { key: 'allowMemberPosts', label: 'Allow Member Posts', description: 'Members can create posts' },
            { key: 'requireApproval', label: 'Require Approval', description: 'Posts need approval before publishing' },
            { key: 'allowFileUploads', label: 'Allow File Uploads', description: 'Members can upload files and images' },
            { key: 'allowPolls', label: 'Allow Polls', description: 'Members can create polls' },
            { key: 'allowEvents', label: 'Allow Events', description: 'Members can create events' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{setting.label}</div>
                <div className="text-[#A0A0A0] text-sm">{setting.description}</div>
              </div>
              <button
                type="button"
                onClick={() => props.updateSettings(setting.key, Boolean(!props.form.settings[setting.key as keyof typeof props.form.settings]).toString())}
                className={`w-16 p-1 rounded-[100px] border transition-colors ${
                  props.form.settings[setting.key as keyof typeof props.form.settings]
                    ? "bg-fuchsia-400 border-fuchsia-400 justify-end"
                    : "bg-stone-300 border-stone-300 justify-start"
                } flex items-center`}
              >
                <div className="w-6 h-6 bg-white rounded-full" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxPostLength" className="text-white text-sm">
              Max Post Length
            </Label>
            <Input
              id="maxPostLength"
              type="number"
              value={props.form.settings.maxPostLength}
              onChange={(e) => props.updateSettings('maxPostLength', (parseInt(e.target.value) || 5000).toString())}
              min="100"
              max="10000"
              className={`bg-background border-[#3A3A3A] text-white placeholder:text-[#A0A0A0] focus:border-[#7B21BA] focus:ring-[#7B21BA]/20 ${
                props.errors.maxPostLength ? 'border-red-500' : ''
              }`}
            />
            {props.errors.maxPostLength && (
              <p className="text-red-400 text-sm">{props.errors.maxPostLength}</p>
            )}
            <p className="text-[#A0A0A0] text-xs">Characters (100 - 10,000)</p>
          </div>

          <div className="space-y-4">
            <Label className="text-white text-sm block">Moderation Level</Label>
            <div className="space-y-3">
              {moderationLevels.map((level) => (
                <div
                  key={level.value}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    props.form.settings.moderationLevel === level.value
                      ? 'border-[#7B21BA] bg-[#7B21BA]/20'
                      : 'border-[#3A3A3A] bg-background hover:bg-[#2A2A2A]'
                  }`}
                  onClick={() => props.updateSettings('moderationLevel', level.value)}
                >
                  <div className="text-white font-medium text-sm">{level.label}</div>
                  <div className="text-[#A0A0A0] text-xs">{level.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
