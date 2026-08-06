'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Volume2, Square, X, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: string;
};

export default function StudentAITutorWidget({
  subject = 'General Studies',
  topic = 'Lesson Topic',
  gradeLevel = 'Primary 4',
  lessonText = '',
}: {
  subject?: string;
  topic?: string;
  gradeLevel?: string;
  lessonText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Hello! 👋 I'm Eddie, your Edvoura Personal AI Tutor. Need help understanding ${topic} in ${subject}? Ask me anything or tap a question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function handleSend(customText?: string) {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'student',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/student-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          subject,
          topic,
          gradeLevel,
          lessonText,
        }),
      });

      const data = await res.json();
      const tutorResponse = data.answer || `Here is a clear explanation for ${topic}: ${textToSend}`;

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: tutorResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: Math.random().toString(),
        sender: 'tutor',
        text: `I'm here to help! In ${gradeLevel} ${subject}, ${topic} is an important concept. Try breaking it down step-by-step or ask your tutor in your next class!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSpeak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~`]/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border-[3px] border-dark bg-yellow px-5 py-3 text-xs font-black uppercase tracking-wider text-dark shadow-[4px_4px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-dark bg-white">
            <Bot className="h-4 w-4 text-dark" />
          </div>
          <span>AI Tutor Eddie</span>
        </button>
      )}

      {/* Interactive AI Tutor Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[90vw] max-w-[420px] flex-col rounded-[24px] border-[4px] border-dark bg-white shadow-[8px_8px_0px_#060E1C] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b-[3px] border-dark bg-yellow p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-[2px] border-dark bg-white shadow-[2px_2px_0px_#060E1C]">
                <Bot className="h-5 w-5 text-dark" />
              </div>
              <div>
                <h3 className="text-sm font-black text-dark">Professor Eddie</h3>
                <p className="text-[10px] font-bold text-dark/70">Edvoura Personal AI Tutor ({gradeLevel})</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border-[2px] border-dark bg-white text-dark hover:bg-rose-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5 border-b-[2px] border-dark bg-off-white p-2.5">
            <button
              type="button"
              onClick={() => handleSend(`Explain ${topic} in simple words`)}
              className="rounded-lg border-[1.5px] border-dark bg-white px-2 py-1 text-[9px] font-black uppercase text-dark shadow-[1px_1px_0px_#060E1C] hover:bg-yellow transition-colors"
            >
              💡 Explain Simply
            </button>
            <button
              type="button"
              onClick={() => handleSend(`Give me a real-life Nigerian example for ${topic}`)}
              className="rounded-lg border-[1.5px] border-dark bg-white px-2 py-1 text-[9px] font-black uppercase text-dark shadow-[1px_1px_0px_#060E1C] hover:bg-yellow transition-colors"
            >
              🇳🇬 Nigerian Example
            </button>
            <button
              type="button"
              onClick={() => handleSend(`Quiz me on ${topic} with 2 quick questions`)}
              className="rounded-lg border-[1.5px] border-dark bg-white px-2 py-1 text-[9px] font-black uppercase text-dark shadow-[1px_1px_0px_#060E1C] hover:bg-yellow transition-colors"
            >
              🎯 Quick Quiz
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl border-[2px] border-dark p-3 text-xs font-semibold shadow-[2px_2px_0px_#060E1C] ${
                    msg.sender === 'student' ? 'bg-yellow text-dark' : 'bg-white text-dark'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px] opacity-60 font-bold">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'tutor' && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.text)}
                        className="ml-2 flex items-center gap-1 text-dark hover:underline"
                      >
                        {isSpeaking ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-bold text-dark/60">
                <Sparkles className="h-4 w-4 animate-spin text-yellow" />
                <span>Eddie is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t-[3px] border-dark bg-white p-3 flex items-center gap-2">
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Eddie a question about your lesson..."
              className="flex-1 rounded-xl border-[2px] border-dark bg-off-white px-3 py-2 text-xs font-bold text-dark outline-none focus:border-yellow"
            />
            <Button
              type="button"
              disabled={isLoading || !inputQuery.trim()}
              onClick={() => handleSend()}
              className="h-9 w-9 p-0 bg-yellow border-[2px] border-dark text-dark rounded-xl shadow-[2px_2px_0px_#060E1C]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
