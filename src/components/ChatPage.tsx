import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Paperclip, Image as ImageIcon, ChevronDown } from "lucide-react";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [selectedTone, setSelectedTone] = useState("Elegant");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "ai",
      message: "Hello there! I am Arm, your emotionally intelligent AI. How can I assist you today?",
      timestamp: "2:30 PM"
    },
    {
      id: 2,
      sender: "user",
      message: "I'm looking for some inspiration for a new hobby. Any suggestions?",
      timestamp: "2:31 PM"
    },
    {
      id: 3,
      sender: "ai",
      message: "Absolutely! For a calming yet engaging experience, consider learning watercolor painting. It's wonderfully expressive and allows for beautiful personal discovery.",
      timestamp: "2:31 PM"
    },
    {
      id: 4,
      sender: "user",
      message: "That sounds lovely! What about something more active?",
      timestamp: "2:32 PM"
    },
    {
      id: 5,
      sender: "ai",
      message: "For something active and intellectually stimulating, perhaps consider competitive chess or even a dance class. Both offer mental engagement and physical activity!",
      timestamp: "2:32 PM"
    },
    {
      id: 6,
      sender: "user",
      message: "I need to draft a formal apology for a missed deadline, but I want it to sound sincere and professional. Can you help me with that?",
      timestamp: "2:33 PM"
    },
    {
      id: 7,
      sender: "ai",
      message: "Certainly. To convey utmost sincerity, begin with a clear admission of the oversight. Then, briefly explain any contributing factors without making excuses, and most importantly, outline the steps you've taken or will take to prevent recurrence. A polite closing is also key.",
      timestamp: "2:33 PM"
    }
  ]);

  const suggestedPrompts = [
    "Suggest a relaxing evening routine.",
    "Explain AI ethics simply.",
    "Tell me a fun fact about space.",
    "Help me write a professional email.",
    "Brainstorm creative ideas for a party.",
    "What's the meaning of life?"
  ];

  const quickLinks = [
    "Account Settings",
    "Help & Support", 
    "Privacy Policy"
  ];

  // AI response generator based on tone
  const generateAIResponse = (userMessage: string, tone: string) => {
    const responses = {
      Elegant: [
        "I appreciate your inquiry. Allow me to provide you with a thoughtful response that addresses your question with grace and sophistication.",
        "Your question demonstrates excellent insight. Let me offer you a refined perspective on this matter.",
        "I'm delighted to assist you with such an elegant inquiry. Here's my considered response."
      ],
      Sassy: [
        "Oh honey, let me spill the tea on that one! Here's what you need to know...",
        "Well well well, look who's asking the right questions! Let me give you the real deal.",
        "Girl, I've got you covered! Here's the scoop you're looking for."
      ],
      Fun: [
        "Ooh, that's a fun question! Let me share something awesome with you! 🎉",
        "Yay! I love this question! Here's something super cool for you! ✨",
        "This is going to be fun! Let me tell you something amazing! 🚀"
      ]
    };

    const toneResponses = responses[tone as keyof typeof responses] || responses.Elegant;
    const randomResponse = toneResponses[Math.floor(Math.random() * toneResponses.length)];
    
    return `${randomResponse} ${userMessage.toLowerCase().includes('hobby') ? 'I think you\'d love trying something creative like painting or photography!' : 
           userMessage.toLowerCase().includes('email') ? 'Here\'s a professional template you can use!' :
           userMessage.toLowerCase().includes('party') ? 'How about a themed costume party or a wine tasting evening?' :
           'I hope this helps with your question!'}`;
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = {
        id: chatHistory.length + 1,
        sender: "user",
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);

      // Simulate AI typing delay
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          sender: "ai",
          message: generateAIResponse(message, selectedTone),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left Sidebar - AI Profile */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="text-center">
            {/* AI Profile Picture */}
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">A</span>
              </div>
            </div>
            
            {/* AI Name */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Anuschka Matchmaker</h2>
            
            {/* AI Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Your personal guide to clarity and insight, designed to understand and respond with emotional intelligence.
            </p>
            
            {/* Tone Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Set Tone:</p>
              <div className="flex space-x-2">
                {["Elegant", "Sassy", "Fun"].map((tone) => (
                  <Button
                    key={tone}
                    variant={selectedTone === tone ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTone(tone)}
                    className={`text-xs ${
                      selectedTone === tone 
                        ? "bg-purple-600 text-white" 
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tone}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Area - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-800">Anuschka Matchmaker</h1>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                <span className="text-sm text-gray-700">English</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {selectedTone} mode
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${chat.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Profile Picture */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 ${
                    chat.sender === "ai" 
                      ? "bg-gradient-to-br from-purple-400 to-pink-400" 
                      : "bg-red-600 border-2 border-black"
                  } flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {chat.sender === "ai" ? "A" : "U"}
                    </span>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`rounded-lg px-4 py-3 ${
                    chat.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}>
                    <p className="text-sm leading-relaxed">{chat.message}</p>
                    <p className={`text-xs mt-2 ${
                      chat.sender === "user" ? "text-purple-200" : "text-gray-500"
                    }`}>
                      {chat.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
                disabled={!message.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - User Profile & Quick Links */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          {/* User Profile */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-red-600 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">U</span>
            </div>
            <h3 className="font-semibold text-gray-800">User1</h3>
            <p className="text-sm text-green-600">Active now</p>
          </div>

          {/* Suggested Prompts */}
          <div className="mb-8">
            <h4 className="font-medium text-gray-800 mb-4">Suggested Prompts</h4>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4">Quick Links</h4>
            <div className="space-y-2">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 