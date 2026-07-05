'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, User, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ChatPage() {
  // 1. Manage input state manually (AI SDK v5/v6 requirement)
  const [input, setInput] = useState('')
  
  // 2. Destructure sendMessage and status instead of handleSubmit/isLoading
  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
  })
  
  // Derive loading state from status
  const isLoading = status === 'submitted' || status === 'streaming'
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 3. Custom submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    // Send the message using the new v5/v6 API
    sendMessage({ text: input })
    setInput('') // Clear input after sending
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pb-4 px-2">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-sky-400" />
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Hello, I am <span className="font-bold text-white">Acharya</span>. I am here to ensure you crack NEET. What shall we conquer today?
              </p>
            </motion.div>
          )}
          
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[70%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* AI SDK v5/v6 uses a 'parts' array instead of flat 'content' */}
                {m.parts?.map((part, i) => {
                  if (part.type === 'text') {
                    return (
                      <div key={i} className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user' 
                          ? 'bg-sky-500 text-white rounded-br-none' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                      }`}>
                        {part.text}
                      </div>
                    )
                  }
                  
                  if (part.type === 'tool-invocation') {
                    return <ToolInvocationCard key={i} tool={part.toolInvocation} />
                  }
                  
                  return null
                })}
                
                {/* Fallback for older v4 format just in case */}
                {!m.parts && m.content && (
                   <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-sky-500 text-white rounded-br-none' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}>
                    {m.content}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span className="text-sm text-zinc-400">Acharya is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Input Area */}
      <form onSubmit={handleSubmit} className="sticky bottom-0 bg-zinc-950 pt-4 pb-2 border-t border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-lg shadow-black/20">
          <input
            className="flex-1 bg-transparent outline-none px-3 py-2 text-white placeholder:text-zinc-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Acharya to plan your day or explain a concept..."
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg h-10 w-10"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

// Custom UI for Tool Calls
function ToolInvocationCard({ tool }: { tool: any }) {
  if (!tool) return null

  if (tool.toolName === 'schedule_plan') {
    if (tool.state === 'result') {
      return (
        <Card className="p-3 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Study plan successfully added to your dashboard!</span>
        </Card>
      )
    }
    if (tool.state === 'call') {
      return (
        <Card className="p-3 bg-zinc-900 border-zinc-800 text-zinc-400 text-xs flex items-center gap-2 max-w-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Scheduling your study plan...</span>
        </Card>
      )
    }
  }
  
  if (tool.toolName === 'remember' && tool.state === 'result') {
    return (
      <Card className="p-3 bg-purple-500/10 border-purple-500/20 text-purple-400 text-xs flex items-center gap-2 max-w-xs animate-in fade-in slide-in-from-bottom-2">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>Memory stored for future context.</span>
      </Card>
    )
  }

  return null
}