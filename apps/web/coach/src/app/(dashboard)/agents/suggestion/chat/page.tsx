'use client'

import React, { useState, useRef, useEffect } from 'react';
import {useRouter, useParams, useSearchParams} from "next/navigation";
import { Send, Sparkles, FileText, Hash, Copy, MessageSquare } from 'lucide-react';
import { toast } from "sonner";
import { sdkClient } from "@/lib";
import { TemplateFrame } from "@nlc-ai/web-shared";
import { ConversationHistory, AgentConversationMessage, ConversationArtifact } from "@nlc-ai/types";

const ContentConversationPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const conversationID = params.get('conversationID') as string | undefined;

  const [conversation, setConversation] = useState<ConversationHistory | null>(null);
  const [messages, setMessages] = useState<AgentConversationMessage[]>([]);
  const [artifacts, setArtifacts] = useState<ConversationArtifact[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationID) {
      loadConversation();
    } else {
      // New conversation - show welcome message
      setMessages([{
        id: 'welcome',
        senderType: 'agent',
        content: "Hi! I'm your content creation assistant. I can help you brainstorm ideas, write scripts, create social media posts, and develop blog outlines. What would you like to work on today?",
        messageType: 'text',
        metadata: {},
        createdAt: new Date(),
        artifacts: []
      }]);
    }
  }, [conversationID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!conversationID) return;

    try {
      setIsLoading(true);
      const data = await sdkClient.agents.contentConversation.getConversation(conversationID);
      setConversation(data);
      setMessages(data.messages);
      setArtifacts(data.artifacts);
    } catch (error: any) {
      toast.error('Failed to load conversation');
      router.push('/agents/content/chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;

    const userMessage: AgentConversationMessage = {
      id: `temp-${Date.now()}`,
      senderType: 'coach',
      content: currentMessage,
      messageType: 'text',
      metadata: {},
      createdAt: new Date(),
      artifacts: []
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsTyping(true);

    try {
      let response: AgentConversationMessage;

      if (conversationID) {
        // Continue existing conversation
        response = await sdkClient.agents.contentConversation.sendMessage(conversationID, {
          message: messageToSend
        });
      } else {
        // Start new conversation
        const startResponse = await sdkClient.agents.contentConversation.startConversation({
          message: messageToSend,
          title: "Content Creation Session"
        });

        setConversation(startResponse.conversation);
        response = startResponse.firstResponse;

        // Update URL to include conversation ID
        window.history.replaceState({}, '', `/agents/suggestion/chat?conversationID=${startResponse.conversation.id}`);
      }

      setMessages(prev => [...prev, response]);
    } catch (error: any) {
      toast.error('Failed to send message');
      // Remove the temporary message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateArtifact = async (type: 'content_script' | 'social_post' | 'blog_outline') => {
    if (!conversationID) {
      toast.error('Start a conversation first');
      return;
    }

    const requirements = {
      platform: type === 'social_post' ? ['LinkedIn', 'Instagram'] : undefined,
      contentType: type === 'blog_outline' ? 'Educational' : 'Engaging',
      tone: 'Professional',
      length: 'Medium'
    };

    const title = type === 'content_script'
      ? 'Content Script'
      : type === 'social_post'
        ? 'Social Media Post'
        : 'Blog Outline';

    try {
      setIsTyping(true);
      const artifactResponse = await sdkClient.agents.contentConversation.createArtifact(conversationID, {
        type,
        title,
        requirements
      });

      // Add agent message about artifact creation
      const agentMessage: AgentConversationMessage = {
        id: `artifact-msg-${Date.now()}`,
        senderType: 'agent',
        content: artifactResponse.message,
        messageType: 'artifact_response',
        metadata: { artifactID: artifactResponse.artifact.id },
        createdAt: new Date(),
        artifacts: [artifactResponse.artifact]
      };

      setMessages(prev => [...prev, agentMessage]);
      setArtifacts(prev => [artifactResponse.artifact, ...prev]);
    } catch (error: any) {
      toast.error('Failed to create artifact');
    } finally {
      setIsTyping(false);
    }
  };

  const handleRefineArtifact = async (artifactID: string, refinements: string) => {
    if (!conversationID) return;

    try {
      setIsTyping(true);
      const response = await sdkClient.agents.contentConversation.refineArtifact(
        conversationID,
        artifactID,
        { refinements }
      );

      // Update artifacts list
      setArtifacts(prev => prev.map(a =>
        a.id === artifactID ? { ...a, isCurrent: false } : a
      ).concat(response.artifact));

      // Add agent message
      const agentMessage: AgentConversationMessage = {
        id: `refine-msg-${Date.now()}`,
        senderType: 'agent',
        content: response.message,
        messageType: 'artifact_response',
        metadata: { artifactID: response.artifact.id },
        createdAt: new Date(),
        artifacts: [response.artifact]
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error: any) {
      toast.error('Failed to refine artifact');
    } finally {
      setIsTyping(false);
    }
  };

  const copyArtifactContent = (artifact: ConversationArtifact) => {
    let textToCopy = '';

    try {
      const content = typeof artifact.content === 'string'
        ? JSON.parse(artifact.content)
        : artifact.content;

      if (artifact.artifactType === 'content_script') {
        textToCopy = `Hook: ${content.hook}\n\nMain Content:\n${content.mainContent}\n\nCall to Action: ${content.callToAction}`;
      } else if (artifact.artifactType === 'social_post') {
        textToCopy = `${content.content}\n\n${content.hashtags?.join(' ') || ''}`;
      } else {
        textToCopy = JSON.stringify(content, null, 2);
      }

      navigator.clipboard.writeText(textToCopy);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const renderMessage = (message: AgentConversationMessage) => (
    <div key={message.id} className={`flex ${message.senderType === 'coach' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${
        message.senderType === 'coach'
          ? 'bg-gradient-to-r from-[#B339D4] to-[#7B21BA]'
          : 'bg-black/30 backdrop-blur-sm'
      } rounded-2xl p-4 text-white border ${
        message.senderType === 'coach' ? 'border-purple-500/30' : 'border-white/10'
      }`}>
        {message.messageType === 'artifact_response' && (
          <div className="mb-2 flex items-center gap-2 text-purple-300">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Created artifact</span>
          </div>
        )}
        <p className="whitespace-pre-wrap leading-relaxed text-[#F9F9F9]">{message.content}</p>
        <div className="text-xs text-white/50 mt-2">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  const renderArtifact = (artifact: ConversationArtifact) => {
    let content;
    try {
      content = typeof artifact.content === 'string'
        ? JSON.parse(artifact.content)
        : artifact.content;
    } catch {
      content = { error: 'Invalid content' };
    }

    return (
      <div key={artifact.id} className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-[#F9F9F9] font-medium text-sm">{artifact.title}</h3>
            {artifact.version > 1 && (
              <span className="text-xs text-purple-300 bg-purple-600/20 px-2 py-1 rounded">
                v{artifact.version}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => copyArtifactContent(artifact)}
              className="text-white/50 hover:text-white p-1 rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {artifact.artifactType === 'content_script' && content.hook && (
          <div className="space-y-3 text-sm text-white/90">
            <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-lg p-3">
              <p className="text-purple-300 font-medium mb-1">Hook:</p>
              <p className="text-xs text-[#F9F9F9]">{content.hook}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-blue-300 font-medium mb-1">Main Content:</p>
              <p className="text-xs text-[#F9F9F9] line-clamp-4">{content.mainContent}</p>
            </div>
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-lg p-3">
              <p className="text-green-300 font-medium mb-1">Call to Action:</p>
              <p className="text-xs text-[#F9F9F9]">{content.callToAction}</p>
            </div>
          </div>
        )}

        {artifact.artifactType === 'social_post' && content.content && (
          <div className="space-y-3 text-sm text-white/90">
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-blue-300 font-medium mb-1">Content:</p>
              <p className="text-xs text-[#F9F9F9] whitespace-pre-wrap">{content.content}</p>
            </div>
            {content.hashtags && (
              <div>
                <p className="text-purple-300 font-medium mb-1">Hashtags:</p>
                <p className="text-xs text-[#C5C5C5]">{content.hashtags.join(' ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#B339D4] to-[#7B21BA] rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[#F9F9F9] font-inter text-lg font-semibold">
              Content Assistant
            </h3>
            <p className="text-[#C5C5C5] text-sm">
              {conversation?.title || 'New conversation'}
            </p>
          </div>
        </div>
      </div>

      {artifacts.filter(a => a.isCurrent).length > 0 && (
        <div className="flex flex-col gap-4">
          <h4 className="text-[#F9F9F9] font-inter text-base font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generated Content
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {artifacts.filter(a => a.isCurrent).map(renderArtifact)}
          </div>
        </div>
      )}
    </>
  );

  const mainContent = (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(renderMessage)}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 text-white border border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-sm text-white/70">Assistant is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-3">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask me to create content, brainstorm ideas, or refine existing work..."
              className="w-full bg-transparent text-[#F9F9F9] placeholder-white/50 resize-none focus:outline-none"
              rows={3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isTyping}
            className="bg-gradient-to-r from-[#B339D4] to-[#7B21BA] hover:from-[#9A2FB8] hover:to-[#651A9E] disabled:opacity-50 rounded-2xl p-3 transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => handleCreateArtifact('content_script')}
            disabled={!conversationID || isTyping}
            className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white text-sm px-4 py-2 rounded-lg border border-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Create Script
          </button>
          <button
            onClick={() => handleCreateArtifact('social_post')}
            disabled={!conversationID || isTyping}
            className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white text-sm px-4 py-2 rounded-lg border border-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Hash className="w-4 h-4" />
            Social Post
          </button>
          <button
            onClick={() => handleCreateArtifact('blog_outline')}
            disabled={!conversationID || isTyping}
            className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white text-sm px-4 py-2 rounded-lg border border-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            Blog Outline
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden min-h-screen">
      {/* Background with glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[267px] h-[267px] rounded-full opacity-40 blur-[112.55px] bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 right-[-21px] top-[-21px]"></div>
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <TemplateFrame
        pageTitle="Content Creation Assistant"
        onSave={() => {}}
        onDiscard={() => router.push('/agents/content')}
        sidebarComponent={sidebarContent}
        mainComponent={mainContent}
        displayActionButtons={false}
      />
    </div>
  );
};

export default ContentConversationPage;
