'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/hooks/useAppContext';
import {
  Sparkles,
  Bot,
  X,
  Send,
  RotateCcw,
  Languages,
  ChevronDown,
  Compass,
  ArrowRight,
  Copy,
  Check,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';

interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

const UI_TEXT: Record<
  LanguageCode,
  {
    title: string;
    subtitle: string;
    placeholder: string;
    greeting: string;
    quickPromptsLabel: string;
    clearChat: string;
  }
> = {
  en: {
    title: 'Sahayak AI',
    subtitle: 'Online',
    placeholder: 'Ask anything...',
    greeting: 'Namaste! How can I help you today?',
    quickPromptsLabel: 'Suggested:',
    clearChat: 'Clear',
  },
  hi: {
    title: 'सहायक AI',
    subtitle: 'ऑनलाइन',
    placeholder: 'कुछ भी पूछें...',
    greeting: 'नमस्ते! मैं आज आपकी क्या सहायता करूँ?',
    quickPromptsLabel: 'सुझाव:',
    clearChat: 'साफ़ करें',
  },
  bn: {
    title: 'সহায়ক AI',
    subtitle: 'অনলাইন',
    placeholder: 'কিছু জিজ্ঞাসা করুন...',
    greeting: 'নমস্কার! আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
    quickPromptsLabel: 'পরামর্শ:',
    clearChat: 'মুছুন',
  },
  mr: {
    title: 'सहायक AI',
    subtitle: 'ऑनलाइन',
    placeholder: 'काहीही विचारा...',
    greeting: 'नमस्ते! मी तुम्हाला कशी मदत करू?',
    quickPromptsLabel: 'सूचना:',
    clearChat: 'साफ करा',
  },
  ta: {
    title: 'சஹாயக் AI',
    subtitle: 'ஆன்லைன்',
    placeholder: 'எதுவும் கேளுங்கள்...',
    greeting: 'வணக்கம்! இன்று உங்களுக்கு எவ்வாறு உதவட்டும்?',
    quickPromptsLabel: 'பரிந்துரைகள்:',
    clearChat: 'அழி',
  },
  te: {
    title: 'సహాయక్ AI',
    subtitle: 'ఆన్‌లైన్',
    placeholder: 'ఏదైనా అడగండి...',
    greeting: 'నమస్కారం! నేను మీకు ఎలా సహాయపడాలి?',
    quickPromptsLabel: 'సూచనలు:',
    clearChat: 'తొలగించు',
  },
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFallback?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  { label: '🛠️ Services', query: 'Browse all available services' },
  { label: '🔑 Worker OTP', query: 'How does 4-digit OTP verification work?' },
  { label: '💰 85/10/5 Split', query: 'Explain the 85% worker payout model' },
  { label: '🚨 Emergency SOS', query: 'I need urgent emergency help' },
];

export function FloatingAIAssistant() {
  const router = useRouter();
  const context = useAppContext();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize greeting on load or language change if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: UI_TEXT[selectedLang].greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [selectedLang, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Setup optional speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          if (transcript) {
            setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, [selectedLang]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            pathname: context.pathname,
            role: context.role,
            userName: context.userName,
            userEmail: context.userEmail,
            language: selectedLang,
            pageTitle: context.pageTitle,
            pageSummary: context.pageSummary,
            activeBookingsCount: context.activeBookingsCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am here to guide you through ShramNexus.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to query AI Assistant:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content:
          'I had a temporary connection issue. You can navigate directly using these links:\n\n- [Browse Services](/services)\n- [Emergency SOS](/emergency)\n- [Worker Dashboard](/worker-dashboard)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: UI_TEXT[selectedLang].greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  /**
   * Helper to parse markdown links [Title](/path) into 1-click interactive navigation buttons
   */
  const renderMessageContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(renderTextWithFormatting(content.substring(lastIndex, matchIndex), `text-${lastIndex}`));
      }

      const linkText = match[1];
      const linkUrl = match[2];

      parts.push(
        <button
          key={`btn-${matchIndex}`}
          onClick={() => {
            if (linkUrl.startsWith('/')) {
              router.push(linkUrl);
            } else {
              window.open(linkUrl, '_blank');
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-0.5 rounded-lg bg-[#24172f] text-[#f5dfad] hover:text-white border border-[#e6aa3b]/40 text-xs font-medium shadow-sm hover:border-[#e6aa3b] transition-all cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#e6aa3b]" />
          <span>{linkText}</span>
          <ArrowRight className="w-3 h-3 text-[#e6aa3b]" />
        </button>
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextWithFormatting(content.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  };

  /**
   * Helper to render bold text, bullet points, headers, and code spans safely
   */
  const renderTextWithFormatting = (rawText: string, keyPrefix: string) => {
    const lines = rawText.split('\n');

    return (
      <div key={keyPrefix} className="space-y-1">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={`empty-${lineIdx}`} className="h-1.5" />;
          }

          const isBullet = /^([*\-•]|\d+\.)\s+/.test(trimmed);
          const isHeader = /^#{1,3}\s+/.test(trimmed);

          let displayLine = trimmed;
          if (isBullet) {
            displayLine = trimmed.replace(/^([*\-•]|\d+\.)\s+/, '');
          } else if (isHeader) {
            displayLine = trimmed.replace(/^#{1,3}\s+/, '');
          }

          // Match ***bold-italic***, **bold**, *italic*, and `code`
          const formattedFragments: React.ReactNode[] = [];
          const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
          let idx = 0;
          let match;

          while ((match = regex.exec(displayLine)) !== null) {
            if (match.index > idx) {
              const textBefore = displayLine.substring(idx, match.index).replace(/\*\*/g, '');
              if (textBefore) formattedFragments.push(textBefore);
            }

            if (match[2]) {
              // Bold Italic
              formattedFragments.push(
                <strong key={`bi-${match.index}`} className="font-semibold italic text-foreground">
                  {match[2]}
                </strong>
              );
            } else if (match[3]) {
              // Bold
              formattedFragments.push(
                <strong key={`b-${match.index}`} className="font-semibold text-foreground">
                  {match[3]}
                </strong>
              );
            } else if (match[4]) {
              // Italic
              formattedFragments.push(
                <em key={`i-${match.index}`} className="italic text-foreground">
                  {match[4]}
                </em>
              );
            } else if (match[5]) {
              // Code span
              formattedFragments.push(
                <code
                  key={`c-${match.index}`}
                  className="px-1.5 py-0.5 rounded bg-amber-100/60 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono text-[11px]"
                >
                  {match[5]}
                </code>
              );
            }
            idx = match.index + match[0].length;
          }

          if (idx < displayLine.length) {
            const textAfter = displayLine.substring(idx).replace(/\*\*/g, '');
            if (textAfter) formattedFragments.push(textAfter);
          }

          if (isHeader) {
            return (
              <div key={`h-${lineIdx}`} className="font-bold text-foreground text-xs mt-2 mb-1">
                {formattedFragments}
              </div>
            );
          }

          if (isBullet) {
            return (
              <div key={`b-${lineIdx}`} className="flex items-start gap-2 my-1 text-foreground leading-relaxed">
                <span className="text-[#e6aa3b] font-bold select-none text-xs leading-snug mt-0.5">•</span>
                <span className="flex-1">{formattedFragments}</span>
              </div>
            );
          }

          return (
            <div key={`p-${lineIdx}`} className="text-foreground leading-relaxed my-0.5">
              {formattedFragments}
            </div>
          );
        })}
      </div>
    );
  };

  const ui = UI_TEXT[selectedLang];

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="w-13 h-13 rounded-full bg-[#24172f] hover:bg-[#342144] border-2 border-[#e6aa3b] shadow-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
          >
            <Bot className="w-6 h-6 text-[#e6aa3b] transition-transform group-hover:scale-110" />
            <span className="absolute bottom-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-[#24172f]" />
            </span>
          </button>
        )}
      </div>

      {/* CHATBOT WINDOW: Clean, simple, uncrowded */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Assistant"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[82vh] flex flex-col rounded-2xl bg-white dark:bg-[#1a1222] border border-[#e6aa3b]/40 shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 cursor-default select-text"
        >
          {/* HEADER: Clean, spacious, minimal */}
          <div className="bg-[#24172f] px-4 py-3 text-white border-b border-[#e6aa3b]/25 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-[#352345] border border-[#e6aa3b]/50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-[#e6aa3b]" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-[#24172f]" />
              </div>

              <div>
                <h3
                  style={{ color: '#ffffff', fontFamily: 'var(--font-inter), system-ui, sans-serif' }}
                  className="text-sm font-semibold tracking-tight text-white leading-tight"
                >
                  {ui.title}
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 leading-none mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{ui.subtitle}</span>
                </p>
              </div>
            </div>

            {/* Controls: Language, Clear, Close */}
            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs text-stone-200 border border-white/15 transition-colors cursor-pointer"
                  title="Language"
                >
                  <Languages className="w-3 h-3 text-[#e6aa3b]" />
                  <span className="text-[11px] font-medium">
                    {LANGUAGES.find((l) => l.code === selectedLang)?.nativeLabel}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                </button>

                {/* Dropdown Menu */}
                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-[#24172f] border border-[#e6aa3b]/30 shadow-xl py-1 z-50">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer',
                          selectedLang === lang.code
                            ? 'text-[#e6aa3b] font-bold bg-white/5'
                            : 'text-stone-200'
                        )}
                      >
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[10px] text-stone-400 uppercase">{lang.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Chat */}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-md hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title={ui.clearChat}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MESSAGES CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'group/msg flex gap-2.5 max-w-[88%]',
                    isAssistant ? 'self-start mr-auto' : 'self-end ml-auto flex-row-reverse'
                  )}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-full bg-[#24172f] border border-[#e6aa3b]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3 text-[#e6aa3b]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed',
                        isAssistant
                          ? 'bg-stone-100 dark:bg-[#251b2e] text-foreground border border-stone-200/80 dark:border-stone-800 rounded-tl-sm'
                          : 'bg-[#24172f] text-white border border-[#e6aa3b]/30 rounded-tr-sm'
                      )}
                    >
                      {isAssistant ? (
                        renderMessageContent(msg.content)
                      ) : (
                        <div
                          style={{ color: '#ffffff' }}
                          className="text-white whitespace-pre-wrap break-words leading-relaxed font-normal"
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>

                    <div
                      className={cn(
                        'text-[9px] text-stone-400 mt-0.5 px-1 flex items-center gap-1.5',
                        isAssistant ? 'justify-start' : 'justify-end'
                      )}
                    >
                      <span>{msg.timestamp}</span>
                      {isAssistant && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-0.5 hover:text-foreground cursor-pointer"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] self-start mr-auto items-center">
                <div className="w-6 h-6 rounded-full bg-[#24172f] border border-[#e6aa3b]/40 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-[#e6aa3b]" />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-3 py-2 bg-stone-100 dark:bg-[#251b2e] border border-stone-200 dark:border-stone-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e6aa3b] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e6aa3b] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e6aa3b] animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* QUICK CHIPS */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-[#1a1222] border-t border-stone-200/80 dark:border-stone-800 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {DEFAULT_SUGGESTIONS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-[#251b2e] hover:bg-stone-100 dark:hover:bg-[#342144] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-[#e6aa3b] transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT BAR */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-[#1a1222] border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Listening...' : ui.placeholder}
                disabled={isLoading}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-[#251b2e] border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1.5 focus:ring-[#e6aa3b] text-foreground placeholder:text-stone-400 transition-all disabled:opacity-50 pr-8 cursor-text"
              />

              {typeof window !== 'undefined' && (window as any).webkitSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleMic}
                  className={cn(
                    'absolute right-2 p-1 rounded-md transition-colors cursor-pointer',
                    isListening ? 'text-rose-500 animate-pulse' : 'text-stone-400 hover:text-stone-600'
                  )}
                  title="Voice input"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="w-8 h-8 p-0 rounded-xl bg-[#24172f] hover:bg-[#352345] text-[#e6aa3b] border border-[#e6aa3b]/40 shadow-sm shrink-0 flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
