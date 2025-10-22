-- CreateEnum
DO $$ BEGIN
CREATE TYPE "AgentType" AS ENUM ('content_creation', 'email_response', 'lead_followup', 'client_retention', 'coach_replica');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert AI Agents
INSERT INTO "ai_agents" (
  "id",
  "name",
  "type",
  "description",
  "isActive",
  "defaultConfig",
  "createdAt",
  "updatedAt"
) VALUES
    (
      gen_random_uuid(),
      'Content Creation Agent',
      'content_creation',
      'AI agent that helps coaches create engaging content, generate ideas, and optimize content for their audience',
      true,
      '{"maxTokens": 2000, "temperature": 0.7, "model": "gpt-4o"}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'Email Response Agent',
      'email_response',
      'AI agent that drafts intelligent email responses based on coach communication style and context',
      true,
      '{"maxTokens": 1500, "temperature": 0.6, "model": "gpt-4o"}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'Lead Follow-up Agent',
      'lead_followup',
      'AI agent that automates lead follow-up communication and nurtures potential clients',
      true,
      '{"maxTokens": 1000, "temperature": 0.5, "model": "gpt-4o"}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'Client Retention Agent',
      'client_retention',
      'AI agent that helps maintain client engagement and identifies at-risk clients',
      true,
      '{"maxTokens": 1200, "temperature": 0.6, "model": "gpt-4o"}'::jsonb,
      NOW(),
      NOW()
    ),
    (
      gen_random_uuid(),
      'Coach Replica Agent',
      'coach_replica',
      'AI agent that replicates coach communication style and personality for client interactions',
      true,
      '{"maxTokens": 1800, "temperature": 0.7, "model": "gpt-4o"}'::jsonb,
      NOW(),
      NOW()
    )
  ON CONFLICT ("type") DO NOTHING;
