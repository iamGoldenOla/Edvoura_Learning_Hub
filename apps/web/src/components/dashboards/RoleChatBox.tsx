'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

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
  const supabase = useMemo(() => createClient(), []);
  const [activeChannelId, setActiveChannelId] = useState<string>(channels[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const activeChannel = channels.find((channel) => channel.id === activeChannelId) ?? channels[0];

  const channelMessages = useMemo(
    () => messages.filter((message) => message.channelId === activeChannel?.id),
    [messages, activeChannel?.id],
  );

  useEffect(() => {
    if (!activeChannel?.id) return;
    shouldStickToBottomRef.current = true;

    const fetchMessages = async () => {
      try {
        const container = messagesContainerRef.current;
        if (container) {
          const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
          shouldStickToBottomRef.current = distanceFromBottom < 48;
        }

        const { data, error } = await supabase
          .from('dashboard_chat_messages')
          .select('id, channel_id, sender_role, sender_name, text, created_at')
          .eq('channel_id', activeChannel.id)
          .order('created_at', { ascending: true })
          .limit(120);

        if (error) throw error;

        const mapped: ChatMessage[] = (data ?? []).map((message) => ({
          id: message.id,
          channelId: message.channel_id,
          senderRole: message.sender_role,
          senderName: message.sender_name,
          text: message.text,
          createdAt: message.created_at,
        }));
        setMessages((current) => {
          const unchanged =
            current.length === mapped.length &&
            current.every(
              (message, index) =>
                message.id === mapped[index]?.id &&
                message.text === mapped[index]?.text &&
                message.createdAt === mapped[index]?.createdAt,
            );

          return unchanged ? current : mapped;
        });
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
  }, [activeChannel?.id, supabase]);

  useEffect(() => {
    if (!shouldStickToBottomRef.current) {
      return;
    }

    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [channelMessages, activeChannel?.id]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeChannel?.id) return;

    setIsSending(true);
    setErrorMessage('');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: created, error } = await supabase
        .from('dashboard_chat_messages')
        .insert({
          channel_id: activeChannel.id,
          sender_user_id: user.id,
          sender_role: senderRole,
          sender_name: senderName,
          text,
        })
        .select('id, channel_id, sender_role, sender_name, text, created_at')
        .single();

      if (error) throw error;

      if (created) {
        shouldStickToBottomRef.current = true;
        setMessages((current) => [
          ...current,
          {
            id: created.id,
            channelId: created.channel_id,
            senderRole: created.sender_role,
            senderName: created.sender_name,
            text: created.text,
            createdAt: created.created_at,
          },
        ]);
      }
      setDraft('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-4 bg-off-white p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-2xl border-[3px] border-dark bg-white shadow-[4px_4px_0px_#060E1C]">
        <div className="border-b-[3px] border-dark bg-yellow/20 px-4 py-4">
          <h2 className="flex items-center gap-2 text-base font-black text-dark">
            <MessageCircle className="h-4 w-4" />
            {title}
          </h2>
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-dark/50">
            Active Channels
          </p>
        </div>

        <div className="space-y-3 p-4">
          {channels.map((channel) => {
            const isActive = channel.id === activeChannel?.id;
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full rounded-xl border-[3px] p-3 text-left shadow-[3px_3px_0px_#060E1C] transition-all ${
                  isActive
                    ? 'border-dark bg-yellow text-dark'
                    : 'border-dark bg-off-white text-dark hover:bg-white'
                }`}
              >
                <p className="text-sm font-black leading-tight">{channel.label}</p>
                <p className="mt-1 text-[11px] font-bold text-dark/60">{channel.description}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col rounded-2xl border-[3px] border-dark bg-white shadow-[6px_6px_0px_#060E1C]">
        <div className="flex items-center justify-between border-b-[3px] border-dark bg-navy px-4 py-3 text-white">
          <div>
            <p className="text-sm font-black tracking-tight">{activeChannel?.label ?? 'Channel'}</p>
            <p className="text-[11px] font-bold text-white/75">{activeChannel?.description}</p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg border-[2px] border-white/20 bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Monitored
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
            shouldStickToBottomRef.current = distanceFromBottom < 48;
          }}
          className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-[#e9edf4] p-4"
        >
          {channelMessages.length > 0 ? (
            channelMessages.map((message) => {
              const mine = message.senderRole === senderRole && message.senderName === senderName;
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl border-[2px] px-3 py-2 shadow-[2px_2px_0px_#060E1C] ${
                      mine
                        ? 'border-dark bg-yellow text-dark'
                        : 'border-dark bg-white text-dark'
                    }`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${mine ? 'text-dark/70' : 'text-dark/60'}`}>
                      {message.senderName} ({message.senderRole})
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed">{message.text}</p>
                    <p className={`mt-2 text-[10px] font-bold ${mine ? 'text-dark/70' : 'text-dark/50'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border-[3px] border-dashed border-dark/20 bg-white p-6 text-center text-sm font-semibold text-dark/60">
              No messages in this channel yet.
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="space-y-3 border-t-[3px] border-dark bg-white p-4">
          {errorMessage ? (
            <div className="rounded-xl border-[2px] border-rose-400 bg-rose-100 px-3 py-2 text-xs font-black text-rose-900">
              {errorMessage}
            </div>
          ) : null}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            rows={2}
            className="w-full resize-none rounded-xl border-[3px] border-dark bg-off-white px-3 py-2 text-sm font-semibold text-dark outline-none focus:border-yellow"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              className="inline-flex items-center gap-2 border-[3px] border-dark bg-dark px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[3px_3px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
              onClick={() => void sendMessage()}
              disabled={isSending || !draft.trim()}
            >
              <Send className="h-3.5 w-3.5" />
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
