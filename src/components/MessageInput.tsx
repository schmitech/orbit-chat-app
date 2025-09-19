import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, Square } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Ask me anything..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    error: voiceError
  } = useVoice((text) => {
    setMessage(prev => (prev + text).slice(0, 1000));
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Auto-focus when not disabled (when AI response is complete)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isComposing) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="px-8 py-6 relative z-10">
      {voiceError && (
        <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-gradient-to-r from-red-50/80 to-rose-50/80 dark:from-red-900/40 dark:to-rose-900/40 p-3 rounded-xl shadow-sm backdrop-blur-sm">
          {voiceError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
        <div className={`relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 backdrop-blur-xl ${
          isFocused 
            ? 'bg-white/40 dark:bg-slate-800/40 shadow-2xl ring-2 ring-blue-500/40 dark:ring-blue-400/50 transform scale-[1.02] border border-white/40 dark:border-slate-600/50' 
            : 'bg-white/30 dark:bg-slate-800/30 shadow-lg hover:shadow-xl hover:transform hover:scale-[1.01] border border-white/30 dark:border-slate-600/40 hover:bg-white/35 dark:hover:bg-slate-800/35'
        }`}>
          {/* Attachment button */}
          <button
            type="button"
            disabled
            className="flex-shrink-0 p-2 text-slate-300 dark:text-slate-600 transition-all duration-200 rounded-lg cursor-not-allowed opacity-50"
            title="Attach file (Coming soon)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            maxLength={1000}
            className="flex-1 bg-transparent border-none outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 max-h-32 leading-relaxed font-medium focus:outline-none focus:ring-0 focus:border-none appearance-none"
            style={{ 
              minHeight: '24px', 
              border: 'none !important', 
              outline: 'none !important',
              boxShadow: 'none !important',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          />

          {/* Character count */}
          {message.length > 0 && (
            <div className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500 font-medium">
              <span className={message.length >= 1000 ? 'text-red-500 font-bold' : ''}>
                {message.length}/1000
              </span>
            </div>
          )}

          {/* Voice input button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex-shrink-0 p-2 transition-all duration-200 rounded-lg ${
                isListening
                  ? 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-900/20 shadow-sm transform scale-110'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled || isComposing}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
              message.trim() && !disabled && !isComposing
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Hints */}
        <div className="h-4 mt-3 px-1">
          {isListening && (
            <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>Listening...</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}