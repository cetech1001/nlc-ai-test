'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, Loader2, FileText, Trash2, Sparkles } from 'lucide-react';
import {sdkClient} from "@/lib";
import {useAuth} from "@nlc-ai/web-auth";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  openaiFileID?: string;
  status: 'uploading' | 'success' | 'error';
}

const OpenAIChatbotDemo = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI coaching assistant. Upload some documents about your coaching style, and I'll learn from them to answer questions in your voice.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [vectorStoreID, setVectorStoreID] = useState<string | null>(null);
  const [threadID, setThreadID] = useState<string | null>(null);
  const [assistantID, setAssistantID] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize: Create Vector Store and Assistant
  useEffect(() => {
    if (user) {
      initializeOpenAI();
    }
  }, [user]);

  const initializeOpenAI = async () => {
    try {
      // In a real app, this would call your backend API
      // Backend would create vector store and assistant

      // Simulated API call
      const response = await sdkClient.agents.coachReplica.initialize(`${user?.firstName}'s Assistant`);

      // const data = await response.json();
      setVectorStoreID(response.vectorStoreID);
      setAssistantID(response.assistantID);

      // Create a thread for this chat session
      /*const threadResponse = await fetch('/api/openai/thread/create', {
        method: 'POST'
      });
      const threadData = await threadResponse.json();*/
      const threadResponse = await sdkClient.agents.coachReplica.createThread();
      setThreadID(threadResponse.threadID);

    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
      // For demo purposes, use mock IDs
      setVectorStoreID('vs_demo_' + Date.now());
      setAssistantID('asst_demo_' + Date.now());
      setThreadID('thread_demo_' + Date.now());
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !vectorStoreID) return;

    for (const file of Array.from(files)) {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 11),
        name: file.name,
        size: file.size,
        status: 'uploading'
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        // Upload file to OpenAI
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', 'assistants');

        /*const uploadResponse = await fetch('/api/openai/files/upload', {
          method: 'POST',
          body: formData
        });

        const uploadData = await uploadResponse.json();*/
        const uploadResponse = await sdkClient.agents.coachReplica.uploadFile(file, file.name);

          // Add file to vector store
        /*await fetch('/api/openai/vector-store/add-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vectorStoreID: vectorStoreID,
            fileID: uploadData.fileID
          })
        });*/
        await sdkClient.agents.coachReplica.addFileToVectorStore(uploadResponse.fileID);

        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === newFile.id
              ? { ...f, status: 'success', openaiFileID: uploadResponse.fileID }
              : f
          )
        );

        // Add success message
        const successMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great! I've processed "${file.name}". I can now reference this document when answering your questions.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMsg]);

      } catch (error) {
        console.error('File upload failed:', error);
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === newFile.id ? { ...f, status: 'error' } : f
          )
        );
      }
    }
  };

  const handleRemoveFile = async (fileID: string, openaiFileID?: string) => {
    try {
      if (openaiFileID && vectorStoreID) {
        /*await fetch('/api/openai/vector-store/remove-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vectorStoreID: vectorStoreID,
            fileID: openaiFileID
          })
        });*/
        await sdkClient.agents.coachReplica.removeFileFromVectorStore(openaiFileID);
      }

      setUploadedFiles(prev => prev.filter(f => f.id !== fileID));
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !threadID || !assistantID) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Add message to thread
      /*await fetch('/api/openai/thread/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadID: threadID,
          message: inputValue
        })
      });*/
      await sdkClient.agents.coachReplica.addMessageToThread(threadID, inputValue);

      // Run assistant
      /*const runResponse = await fetch('/api/openai/thread/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadID: threadID,
          assistantID: assistantID
        })
      });

      const runData = await runResponse.json();*/
      const runResponse = await sdkClient.agents.coachReplica.runAssistant(threadID);

        // Poll for completion (in real app, use streaming or webhooks)
      let completed = false;
      let attempts = 0;
      while (!completed && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        /*const statusResponse = await fetch(`/api/openai/thread/run/${runResponse.runID}/status`);
        const statusData = await statusResponse.json();*/
        const statusResponse = await sdkClient.agents.coachReplica.getRunStatus(threadID, runResponse.runID);

        if (statusResponse.status === 'completed') {
          completed = true;

          // Get assistant's response
          /*const messagesResponse = await fetch(`/api/openai/thread/${threadID}/messages`);
          const messagesData = await messagesResponse.json();*/
          const messagesResponse = await sdkClient.agents.coachReplica.getThreadMessages(threadID);

          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: messagesResponse.messages[0].content[0].text.value,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
        } else if (statusResponse.status === 'failed') {
          throw new Error('Assistant run failed');
        }

        attempts++;
      }

    } catch (error) {
      console.error('Failed to send message:', error);

      // Demo fallback response
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. In a real implementation, I would search through your uploaded documents and respond in your coaching style.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute w-96 h-96 -left-20 top-40 opacity-20 bg-gradient-to-r from-purple-600 via-fuchsia-400 to-purple-800 rounded-full blur-[120px]" />
      <div className="absolute w-96 h-96 -right-20 bottom-40 opacity-20 bg-gradient-to-l from-purple-600 via-fuchsia-400 to-violet-600 rounded-full blur-[120px]" />

      <div className="relative z-10 container mx-auto px-6 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Coach Assistant Demo</h1>
              <p className="text-stone-400 text-sm">Powered by OpenAI GPT-4o + File Search</p>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-white font-medium text-sm">Training Documents</span>
                <span className="text-stone-500 text-xs">({uploadedFiles.length})</span>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-neutral-900/50 rounded-lg border border-neutral-700"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-white text-sm truncate">{file.name}</span>
                      <span className="text-stone-500 text-xs">({formatFileSize(file.size)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'uploading' && (
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      )}
                      {file.status === 'success' && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                      {file.status === 'error' && (
                        <span className="text-red-400 text-xs">✗</span>
                      )}
                      <button
                        onClick={() => handleRemoveFile(file.id, file.openaiFileID)}
                        className="p-1 hover:bg-neutral-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-stone-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {uploadedFiles.length === 0 && (
              <p className="text-stone-500 text-xs text-center py-2">
                Upload documents to train your AI assistant
              </p>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-6 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                    : 'bg-gradient-to-br from-purple-600 to-fuchsia-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30'
                      : 'bg-neutral-800/50 border border-neutral-700'
                  } rounded-lg p-3`}>
                    <p className="text-white text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-stone-500 text-xs mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-2xl border border-neutral-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about coaching..."
              className="flex-1 bg-black/30 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:border-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>

          <p className="text-stone-500 text-xs mt-2 text-center">
            💡 Try: "How do you handle clients who miss deadlines?" or "What's your coaching methodology?"
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpenAIChatbotDemo;
