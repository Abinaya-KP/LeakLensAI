import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { answerQuestion } from '@/lib/analysisEngine';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED = [
  'Where am I losing the most money?',
  'Why did my revenue decrease?',
  'How much revenue can I recover?',
  'What is causing most payment failures?',
  'Which payment method performs best?',
  'Which customers have failed payments?',
  'What should I fix first?',
  'Show me my top three revenue leaks.',
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const lines = msg.content.split('\n\n');

  function renderLine(line: string, i: number) {
    const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <p key={i} className="text-sm leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: boldParsed }} />
    );
  }

  return (
    <div className={cn('flex gap-3 animate-slide-up', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={14} className="text-black" />
        </div>
      )}
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-cyan-500/20 border border-cyan-500/30 text-foreground'
          : 'bg-card border border-border'
      )}>
        {isUser
          ? <p className="text-sm text-foreground">{msg.content}</p>
          : <div className="space-y-2">{lines.map(renderLine)}</div>
        }
        <p className="text-xs text-muted-foreground/50 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-1">
          <User size={14} className="text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const { store } = useOutletContext<LayoutContext>();
  const { transactions, leaks, metrics } = store;
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    role: 'assistant',
    content: "Hello! I'm your LeakLens AI Assistant. I've analyzed your transaction data and I'm ready to answer questions about your revenue leaks, payment failures, and recovery opportunities.\n\nTry asking me something like \"Where am I losing the most money?\" or \"What should I fix first?\"",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = answerQuestion(text, transactions, leaks, metrics);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, timestamp: new Date() };
      setMessages(m => [...m, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-card/50">
        <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center">
          <Bot size={14} className="text-black" />
        </div>
        <div>
          <div className="text-sm font-semibold">LeakLens AI Assistant</div>
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Analyzing {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full gradient-cyan flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-black" />
            </div>
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center h-5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 md:px-6 py-3 border-t border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-cyan-400" />
          <span className="text-xs text-muted-foreground">Suggested questions</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SUGGESTED.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="flex-shrink-0 text-xs px-3 py-1.5 bg-secondary border border-border rounded-full text-muted-foreground hover:text-foreground hover:border-cyan-500/30 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 md:px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your revenue leaks, payment data, or recovery strategies..."
            rows={1}
            className="flex-1 resize-none bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 leading-relaxed"
            style={{ maxHeight: 100 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 gradient-cyan rounded-xl flex items-center justify-center text-black hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 self-end"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
