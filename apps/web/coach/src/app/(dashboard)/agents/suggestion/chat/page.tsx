'use client'

import React, { useState, useRef, useEffect } from 'react';
import {useRouter, useSearchParams} from "next/navigation";
import { Send, Sparkles, FileText, Hash, Copy, MessageSquare, X, Download, Edit3 } from 'lucide-react';
import { toast } from "sonner";
import { sdkClient } from "@/lib";
import { TemplateFrame } from "@nlc-ai/web-shared";
import { ConversationHistory, AgentConversationMessage, ConversationArtifact } from "@nlc-ai/types";

const ContentConversationPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const conversationID = params.get('conversationID') as string | undefined;

  const [___, setConversation] = useState<ConversationHistory | null>(null);
  const [messages, setMessages] = useState<AgentConversationMessage[]>([]);
  const [__, setArtifacts] = useState<ConversationArtifact[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [_, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<ConversationArtifact | null>(null);
  const [showArtifactViewer, setShowArtifactViewer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();

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

  const loadConversations = async () => {
    try {
      const data = await sdkClient.agents.contentConversation.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
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

        // @ts-ignore
        setConversation(startResponse.conversation);
        response = startResponse.firstResponse;

        // Update URL to include conversation ID
        window.history.replaceState({}, '', `/agents/suggestion/chat?conversationID=${startResponse.conversation.id}`);
      }

      setMessages(prev => [...prev, response]);

      // If response includes artifacts, add them to the artifacts list
      if (response.artifacts && response.artifacts.length > 0) {
        setArtifacts(prev => [...response.artifacts!, ...prev.filter(a =>
          !response.artifacts!.some(newA => newA.id === a.id)
        )]);
      }
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

      // Update the artifact viewer if it's currently showing the refined artifact
      if (selectedArtifact && selectedArtifact.id === artifactID) {
        setSelectedArtifact(response.artifact);
      }
    } catch (error: any) {
      toast.error('Failed to refine artifact');
    } finally {
      setIsTyping(false);
    }
  };

  const handleArtifactClick = (artifact: ConversationArtifact) => {
    setSelectedArtifact(artifact);
    setShowArtifactViewer(true);
  };

  const closeArtifactViewer = () => {
    setShowArtifactViewer(false);
    setSelectedArtifact(null);
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
      } else if (artifact.artifactType === 'blog_outline') {
        textToCopy = `${content.headline}\n\nIntroduction:\n${content.introduction}\n\n`;
        content.sections?.forEach((section: any, index: number) => {
          textToCopy += `${index + 1}. ${section.title}\n`;
          section.subsections?.forEach((sub: string) => {
            textToCopy += `   - ${sub}\n`;
          });
          textToCopy += '\n';
        });
        textToCopy += `Conclusion:\n${content.conclusion}`;
      } else {
        textToCopy = JSON.stringify(content, null, 2);
      }

      navigator.clipboard.writeText(textToCopy);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const downloadArtifactAsWord = (artifact: ConversationArtifact) => {
    try {
      const content = typeof artifact.content === 'string'
        ? JSON.parse(artifact.content)
        : artifact.content;

      let wordContent = '';

      if (artifact.artifactType === 'content_script') {
        wordContent = `
${artifact.title}

HOOK:
${content.hook}

MAIN CONTENT:
${content.mainContent}

CALL TO ACTION:
${content.callToAction}

${content.estimatedDuration ? `Estimated Duration: ${content.estimatedDuration}` : ''}
`;
      } else if (artifact.artifactType === 'social_post') {
        wordContent = `
${artifact.title}

CONTENT:
${content.content}

${content.hashtags ? `HASHTAGS:\n${content.hashtags.join(' ')}` : ''}

${content.callToAction ? `CALL TO ACTION:\n${content.callToAction}` : ''}

${content.platform ? `PLATFORM:\n${content.platform}` : ''}
`;
      } else if (artifact.artifactType === 'blog_outline') {
        wordContent = `
${content.headline}

INTRODUCTION:
${content.introduction}

`;
        content.sections?.forEach((section: any, index: number) => {
          wordContent += `${index + 1}. ${section.title.toUpperCase()}\n`;
          if (section.subsections) {
            section.subsections.forEach((sub: string) => {
              wordContent += `   • ${sub}\n`;
            });
          }
          if (section.keyPoints) {
            wordContent += '\n   Key Points:\n';
            section.keyPoints.forEach((point: string) => {
              wordContent += `   - ${point}\n`;
            });
          }
          wordContent += '\n';
        });

        wordContent += `CONCLUSION:\n${content.conclusion}`;
      }

      // Create a blob and download
      const blob = new Blob([wordContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Content downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download content');
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

        {/* Show artifacts inline with the message */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.artifacts.map(artifact => (
              <div
                key={artifact.id}
                className="bg-black/20 border border-white/20 rounded-lg p-3 cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => handleArtifactClick(artifact)}
              >
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                  <FileText className="w-3 h-3" />
                  <span className="text-xs font-medium">{artifact.title}</span>
                  {artifact.version > 1 && (
                    <span className="text-xs text-purple-200 bg-purple-600/20 px-1 py-0.5 rounded">
                      v{artifact.version}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70">Click to view full content</p>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-white/50 mt-2">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );

  const renderArtifactViewer = () => {
    if (!selectedArtifact || !showArtifactViewer) return null;

    let content;
    try {
      content = typeof selectedArtifact.content === 'string'
        ? JSON.parse(selectedArtifact.content)
        : selectedArtifact.content;
    } catch {
      content = { error: 'Invalid content' };
    }

    console.log(content);
    console.log(selectedArtifact);

    return (
      <div className={`fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 bg-gradient-to-br from-[#1A0B2E] to-[#16213E] backdrop-blur-sm border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
        showArtifactViewer ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Background with glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[200px] h-[200px] rounded-full opacity-30 blur-[80px] bg-gradient-to-l from-fuchsia-400 via-fuchsia-600 to-violet-600 right-[-50px] top-[-50px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                onClick={closeArtifactViewer}
                className="bg-red-500/20 hover:bg-red-500/30 text-white p-2 rounded-lg border border-red-500/20 transition-colors mr-3"
              >
                <X className="w-4 h-4" />
              </button>
              <FileText className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-[#F9F9F9] font-inter text-xl font-semibold">{selectedArtifact.title}</h2>
                <p className="text-[#C5C5C5] text-sm">
                  {selectedArtifact.artifactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {selectedArtifact.version > 1 && ` (Version ${selectedArtifact.version})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyArtifactContent(selectedArtifact)}
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg border border-white/10 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadArtifactAsWord(selectedArtifact)}
                className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg border border-white/10 transition-colors"
                title="Download as text file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-none prose prose-invert prose-purple">
              {selectedArtifact.artifactType === 'content_script' && content.hook && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-700/30 rounded-xl p-6">
                    <h3 className="text-purple-300 font-semibold text-lg mb-4 flex items-center gap-2">
                      🎯 Hook
                    </h3>
                    <p className="text-[#F9F9F9] text-base leading-relaxed">{content.hook}</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
                    <h3 className="text-blue-300 font-semibold text-lg mb-4 flex items-center gap-2">
                      📝 Main Content
                    </h3>
                    <div className="text-[#F9F9F9] text-base leading-relaxed whitespace-pre-wrap">{content.mainContent}</div>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl p-6">
                    <h3 className="text-green-300 font-semibold text-lg mb-4 flex items-center gap-2">
                      🎬 Call to Action
                    </h3>
                    <p className="text-[#F9F9F9] text-base leading-relaxed">{content.callToAction}</p>
                  </div>

                  {content.estimatedDuration && (
                    <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-700/30 rounded-xl p-4">
                      <h3 className="text-orange-300 font-semibold text-sm mb-2">⏱️ Estimated Duration</h3>
                      <p className="text-[#F9F9F9] text-sm">{content.estimatedDuration}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedArtifact.artifactType === 'social_post' && content.content && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
                    <h3 className="text-blue-300 font-semibold text-lg mb-4 flex items-center gap-2">
                      📱 Post Content
                    </h3>
                    <div className="text-[#F9F9F9] text-base leading-relaxed whitespace-pre-wrap">{content.content}</div>
                  </div>

                  {content.hashtags && content.hashtags.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-xl p-6">
                      <h3 className="text-purple-300 font-semibold text-lg mb-4 flex items-center gap-2">
                        #️⃣ Hashtags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((hashtag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-purple-600/20 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.callToAction && (
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl p-6">
                      <h3 className="text-green-300 font-semibold text-lg mb-4 flex items-center gap-2">
                        🎬 Call to Action
                      </h3>
                      <p className="text-[#F9F9F9] text-base leading-relaxed">{content.callToAction}</p>
                    </div>
                  )}

                  {content.platform && (
                    <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border border-orange-700/30 rounded-xl p-4">
                      <h3 className="text-orange-300 font-semibold text-sm mb-2">📊 Recommended Platform</h3>
                      <p className="text-[#F9F9F9] text-sm">{content.platform}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedArtifact.artifactType === 'blog_outline' && content.headline && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-700/30 rounded-xl p-6">
                    <h3 className="text-indigo-300 font-semibold text-lg mb-4 flex items-center gap-2">
                      📰 Blog Title
                    </h3>
                    <h1 className="text-[#F9F9F9] text-2xl font-bold leading-relaxed">{content.headline}</h1>
                  </div>

                  {content.introduction && (
                    <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-700/30 rounded-xl p-6">
                      <h3 className="text-green-300 font-semibold text-lg mb-4 flex items-center gap-2">
                        🚀 Introduction
                      </h3>
                      <p className="text-[#F9F9F9] text-base leading-relaxed">{content.introduction}</p>
                    </div>
                  )}

                  {content.sections && content.sections.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
                      <h3 className="text-blue-300 font-semibold text-lg mb-6 flex items-center gap-2">
                        📋 Sections
                      </h3>
                      <div className="space-y-4">
                        {content.sections.map((section: any, index: number) => (
                          <div key={index} className="bg-black/20 border border-white/10 rounded-lg p-4">
                            <h4 className="text-[#F9F9F9] font-semibold text-lg mb-3">
                              {index + 1}. {section.title}
                            </h4>

                            {section.subsections && section.subsections.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-cyan-300 font-medium text-sm mb-2">Subsections:</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {section.subsections.map((sub: string, subIndex: number) => (
                                    <li key={subIndex} className="text-[#C5C5C5] text-sm">{sub}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {section.keyPoints && section.keyPoints.length > 0 && (
                              <div>
                                <h5 className="text-yellow-300 font-medium text-sm mb-2">Key Points:</h5>
                                <ul className="list-disc list-inside space-y-1">
                                  {section.keyPoints.map((point: string, pointIndex: number) => (
                                    <li key={pointIndex} className="text-[#C5C5C5] text-sm">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.conclusion && (
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-xl p-6">
                      <h3 className="text-purple-300 font-semibold text-lg mb-4 flex items-center gap-2">
                        🎯 Conclusion
                      </h3>
                      <p className="text-[#F9F9F9] text-base leading-relaxed">{content.conclusion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Refine Section */}
          {conversationID && (
            <div className="border-t border-white/10 p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask for refinements..."
                  className="flex-1 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 px-4 py-2 text-[#F9F9F9] placeholder-white/50 focus:outline-none focus:border-purple-500/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleRefineArtifact(selectedArtifact.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Ask for refinements..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      handleRefineArtifact(selectedArtifact.id, input.value);
                      input.value = '';
                    }
                  }}
                  className="bg-gradient-to-r from-[#B339D4] to-[#7B21BA] hover:from-[#9A2FB8] hover:to-[#651A9E] text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Refine
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#B339D4] to-[#7B21BA] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-[#F9F9F9] font-inter text-lg font-semibold">
                Content Assistant
              </h3>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => router.push('/agents/suggestion/chat')}
          className="bg-gradient-to-r from-[#B339D4] to-[#7B21BA] hover:from-[#9A2FB8] hover:to-[#651A9E] text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2 w-full"
        >
          <MessageSquare className="w-4 h-4" />
          New Chat
        </button>

        {/* Conversations List */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[#F9F9F9] font-inter text-base font-medium">
            Recent Conversations
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`bg-black/20 backdrop-blur-sm rounded-lg p-3 border transition-colors cursor-pointer ${
                  conversationID === conv.id
                    ? 'border-purple-500/50 bg-purple-900/20'
                    : 'border-white/10 hover:bg-black/30'
                }`}
                onClick={() => router.push(`/agents/suggestion/chat?conversationID=${conv.id}`)}
              >
                <h5 className="text-[#F9F9F9] text-sm font-medium line-clamp-1">
                  {conv.title}
                </h5>
                <p className="text-[#C5C5C5] text-xs mt-1">
                  {conv.totalMessages} messages • {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
        onDiscard={() => router.push('/agents/suggestion')}
        sidebarComponent={sidebarContent}
        mainComponent={mainContent}
        displayActionButtons={false}
      />

      {/* Artifact Viewer Overlay */}
      {renderArtifactViewer()}
    </div>
  );
};

export default ContentConversationPage;
