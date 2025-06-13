
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, X } from 'lucide-react';
import { chatWithAi, ChatInput, ChatOutput } from '@/ai/flows/chat-flow';
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function ChatAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([{ id: 'welcome-ai', sender: 'ai', text: 'Halo! Ada yang bisa saya bantu terkait LogicLab atau rangkaian digital?'}]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [isOpen]);


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const aiInput: ChatInput = { message: currentInput.trim() };
      const aiResponse: ChatOutput = await chatWithAi(aiInput);
      setIsLoading(false);

      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = { id: aiMessageId, sender: 'ai', text: '' };
      setMessages(prev => [...prev, initialAiMessage]);
      
      let currentIndex = 0;
      const fullReply = aiResponse.reply;
      const typingSpeed = 30; // Kecepatan ketik dalam milidetik

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < fullReply.length) {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: fullReply.substring(0, currentIndex + 1) }
                : msg
            )
          );
          currentIndex++;
          scrollToBottom(); // Panggil scroll setiap karakter ditambahkan
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
        }
      }, typingSpeed);

    } catch (error) {
      console.error("Chat AI Error:", error);
      setIsLoading(false);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: "Maaf, terjadi kesalahan saat menghubungi AI. Coba lagi nanti." };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Tidak dapat menghubungi AI.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-40"
        size="icon"
        aria-label="Buka Chat AI"
      >
        <Bot className="h-8 w-8" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] md:max-w-[550px] lg:max-w-[600px] flex flex-col h-[70vh] max-h-[600px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center text-xl">
              <Bot className="mr-2 h-6 w-6 text-primary" /> Chat dengan Asisten AI LogicLab
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 text-base ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {msg.sender === 'ai' && msg.text.startsWith("Maaf, terjadi kesalahan") && <X className="inline h-4 w-4 mr-1 text-destructive" />}
                    {msg.text.split('\\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            {index < msg.text.split('\\n').length - 1 && <br />}
                        </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-3 inline-flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>AI sedang memproses...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t">
            <div className="flex w-full items-center space-x-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ketik pesan Anda..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && !typingIntervalRef.current && handleSendMessage()}
                disabled={isLoading || !!typingIntervalRef.current}
                className="h-12 text-base"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !!typingIntervalRef.current || !inputValue.trim()} className="h-12 px-5">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Kirim</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

