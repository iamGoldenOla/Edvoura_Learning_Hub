'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

type ChatChannel = {
  id: string;
  label: string;
  description: string;
};

type ChatMessage = {
  id: string;
  channelId: string;
  senderRole: 'tutor' | 'parent' | 'student';
  senderName: string;
  text: string;
  createdAt: string;
};

export default function RoleChatBox({
  channels,
  senderRole,
  senderName,
  title,
}: {
  channels: ChatChannel[];
  senderRole: 'tutor' | 'parent' | 'student';
  senderName: string;
  title: string;
}) {
  const [activeChannelId, setActiveChannelId] = useState<string>(channels[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeChannel = channels.find((channel) => channel.id === activeChannelId) ?? channels[0];

  const channelMessages = useMemo(
    () => messages.filter((message) => message.channelId === activeChannel?.id),
    [messages, activeChannel?.id],
  );

  useEffect(() => {
    if (!activeChannel?.id) return;

    const fetchMessages = async () => {
      try {
        const next = await apiClient.get<ChatMessage[]>('/communications/messages', {
          params: { channelId: activeChannel.id, limit: '100' },
        });
        setMessages(next);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load messages.');
      }
    };

    void fetchMessages();
    const timer = setInterval(() => {
      void fetchMessages();
    }, 3000);

    return () => clearInterval(timer);
  }, [activeChannel?.id]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeChannel?.id) return;

    setIsSending(true);
    setErrorMessage('');
    try {
      const created = await apiClient.post<ChatMessage>('/communications/messages', {
        channelId: activeChannel.id,
        text,
      });
      setMessages((current) => [...current, created]);
      setDraft('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <MessageCircle className="h-4 w-4 text-slate-600" />
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-600">Student-to-student chat is disabled by design.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => setActiveChannelId(channel.id)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              channel.id === activeChannel?.id
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {channel.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{activeChannel?.description}</p>
      {errorMessage ? <p className="text-xs font-medium text-red-600">{errorMessage}</p> : null}

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        {channelMessages.length > 0 ? (
          channelMessages.map((message) => {
            const mine = message.senderRole === senderRole && message.senderName === senderName;

            return (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  mine ? 'ml-auto bg-blue-600 text-white' : 'bg-white text-slate-800'
                }`}
              >
                <p className={`text-[11px] ${mine ? 'text-blue-100' : 'text-slate-500'}`}>
                  {message.senderName} ({message.senderRole})
                </p>
                <p>{message.text}</p>
                <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">No messages yet in this channel.</p>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type message..."
          rows={3}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        />
        <div className="flex justify-end">
          <Button variant="primary" className="text-xs" onClick={() => void sendMessage()} disabled={isSending}>
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}
