import { useState, useEffect, useRef } from 'react'
import { FaRegHeart, FaTimes, FaPaperPlane } from 'react-icons/fa'
import { IoSendOutline } from 'react-icons/io5'
import { useTheme } from '../context/ThemeContext'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { products } from '../features/products/productData'
import { useAuth } from '../features/auth/auth.hooks'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api'

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5v-7Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  )
}

const SUGGESTIONS = [
  "Recommend a tailored look",
  "Show me new arrivals",
  "What is the price range?"
]

export default function Chatbot() {
  const { isDark } = useTheme()
  const { user, isAuthenticated } = useAuth()
  
  const [isOpen, setIsOpen] = useState(false)
  
  // Use user's name if logged in
  const initialGreeting = isAuthenticated && user?.name
    ? `Welcome back to Atelier, ${user.name}. How can I assist you today?`
    : "Welcome to tingtongShop . what can i help?"

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Update initial message when auth state changes (e.g., after login)
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 1) {
      setMessages([{
        id: 1,
        sender: 'bot',
        text: isAuthenticated && user?.name 
          ? `Welcome back to Atelier, ${user.name}. How can I assist you today?`
          : "Welcome to tingtongShop . what can i help?",
        timestamp: messages[0].timestamp
      }])
    }
  }, [isAuthenticated, user, messages.length])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  const hasApiKey = apiKey && apiKey.trim() !== ''
  // Hugging Face is proxy-handled by the Laravel backend, so it's always active as "AI Assistant (Llama)"
  const hasBackendAi = true

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input.trim()
    if (!text) return

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')

    // Trigger typing state
    setIsTyping(true)

    if (hasApiKey) {
      try {
        const history = messages
          .filter(m => m.id !== 1)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))

        history.push({
          role: 'user',
          parts: [{ text: text }]
        })

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: history,
              systemInstruction: {
                parts: [
                  {
                    text: `You are a professional, high-end digital stylist for 'Atelier', a luxury fashion brand featuring quiet luxury, clean lines, and architectural tailoring. Answer the user politely, in character as an elegant personal stylist. ${isAuthenticated && user?.name ? 'The user you are speaking to is named ' + user.name + '. Address them by their name occasionally.' : ''}

CRITICAL RULES:
1. Keep your answers EXTREMELY short and concise. Do NOT write paragraphs. Limit responses to 1 or 2 sentences maximum.
2. The user might ask things like: 'How much money do you have?' which refers to their budget, so ask them what their investment range is. Ready-to-wear essentials begin from $120, knitwear $250-$450, coats/boots $500-$900.
3. Here is our product catalog:
${products.map(p => `- ${p.name} (Price: ${p.price}, Link: /product/${p.id}, Image: ${p.image})`).join('\n')}
4. When recommending products, ALWAYS provide a Markdown link wrapping the product image, like this: [![Product Name](Image URL)](/product/id). Do not output a separate text link.`
                  }
                ]
              }
            })
          }
        )

        const data = await response.json()
        const botResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am having trouble connecting to my creative database. How else can I assist you?"

        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: botResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      } catch (error) {
        console.error("Gemini API Error:", error)
        setIsTyping(false)
        const botResponseText = getBotResponse(text)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `[Offline Mode] ${botResponseText}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }
    } else {
      // Call Laravel backend proxy to bypass CORS
      try {
        const history = messages
          .filter(m => m.id !== 1)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          }))

        history.push({
          role: 'user',
          content: text
        })

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: history,
            userName: isAuthenticated ? user?.name : null
          })
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        const botResponseText = data.choices?.[0]?.message?.content || "I apologize, I am having trouble connecting to my creative database. How else can I assist you?"

        setIsTyping(false)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: botResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      } catch (error) {
        console.error("Backend Chat API Error:", error)
        setIsTyping(false)
        const botResponseText = getBotResponse(text)
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: botResponseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }
    }
  }

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase()
    if (msg.includes('money do you have') || msg.includes('how much') || msg.includes('budget') || msg.includes('price')) {
      return "Atelier curates high-end fashion with varying investment tiers. Our ready-to-wear essentials begin around $120, tailored suits and premium knitwear range from $250 - $450, while our hand-crafted outerwear and premium leather boots range from $500 to $900. I can help filter collections based on your preferred investment range."
    }
    if (msg.includes('tailored') || msg.includes('look') || msg.includes('recommend') || msg.includes('style')) {
      return "For a sophisticated silhouette, I suggest pairing our Sculptural Wool Overcoat ($890) with tailored trousers ($280) and a merino knitwear layer ($180). This achieves a clean, structured appearance perfect for cool seasons."
    }
    if (msg.includes('arrival') || msg.includes('new') || msg.includes('season')) {
      return "Our Autumn Winter 2026 Collection 'The Architecture of Silhouette' has just arrived, featuring structured wool outerwear and cashmere layers. You can view them in the New Arrivals gallery on the homepage."
    }
    return "I appreciate your interest. As your Atelier stylist, I'm here to refine your wardrobe. Would you like to explore our tailoring, knitwear, or schedule a formal style consultation?"
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`mb-4 w-[340px] sm:w-[380px] h-[480px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform translate-y-0 scale-100 ${
            isDark
              ? 'border-white/10 bg-stone-950 text-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
              : 'border-black/10 bg-white text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.15)]'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'border-white/10 bg-stone-900/50' : 'border-black/10 bg-stone-100/50'
          }`}>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wider uppercase font-serif">Atelier Stylist</p>
                <p className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-amber-200/60' : 'text-amber-600'}`}>
                  {hasApiKey ? 'AI Assistant (Gemini)' : 'Smart Stylist Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1.5 rounded-full hover:bg-stone-500/10 transition cursor-pointer ${
                isDark ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-black'
              }`}
              aria-label="Close chat"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                      : isDark
                        ? 'bg-white/10 text-stone-200 rounded-tl-none border border-white/5'
                        : 'bg-stone-100 text-stone-800 rounded-tl-none border border-black/5'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({node, href, children, ...props}) => {
                          const linkStyle = isDark 
                            ? "underline text-amber-400 hover:text-amber-300 break-words" 
                            : "underline text-amber-700 hover:text-amber-900 break-words";

                          // Check if the link wraps an image
                          const isImageLink = node.children?.length === 1 && node.children[0].tagName === 'img';

                          if (isImageLink) {
                            return (
                              <Link to={href} className="relative block group my-2 w-full max-w-full">
                                {children}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg pointer-events-none">
                                  <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </div>
                              </Link>
                            )
                          }

                          if (href?.startsWith('/')) {
                            return <Link to={href} {...props} className={linkStyle}>{children}</Link>
                          }
                          return <a href={href} {...props} className={linkStyle} target="_blank" rel="noopener noreferrer">{children}</a>
                        },
                        img: ({node, ...props}) => (
                          <img {...props} className="w-full h-48 object-cover rounded-lg border border-black/10 dark:border-white/10 m-0 block" loading="lazy" />
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
                <span className={`text-[9px] mt-1 px-1 tracking-wider ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start max-w-[80%]">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm rounded-tl-none flex items-center gap-1 ${
                    isDark ? 'bg-white/10' : 'bg-stone-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Suggestions */}
          {messages.length === 1 && !isTyping && (
            <div className={`p-3 border-t flex flex-wrap gap-2 ${
              isDark ? 'border-white/10 bg-stone-900/30' : 'border-black/10 bg-stone-50/50'
            }`}>
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border transition cursor-pointer text-left ${
                    isDark
                      ? 'border-white/10 bg-white/5 hover:bg-amber-500 hover:text-black hover:border-amber-500 text-stone-300'
                      : 'border-black/10 bg-white hover:bg-stone-900 hover:text-white hover:border-stone-900 text-stone-700'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className={`p-3 border-t flex items-center gap-2 ${
              isDark ? 'border-white/10 bg-stone-900/40' : 'border-black/10 bg-stone-50/40'
            }`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Atelier..."
              className={`flex-1 text-sm bg-transparent outline-none py-1.5 px-3 rounded-full border transition ${
                isDark
                  ? 'border-white/10 text-white placeholder:text-stone-600 focus:border-amber-500/50 focus:bg-white/5'
                  : 'border-black/10 text-stone-900 placeholder:text-stone-400 focus:border-stone-950 focus:bg-black/5'
              }`}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center ${
                input.trim()
                  ? isDark
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-stone-900 text-white hover:bg-stone-850'
                  : 'text-stone-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <IoSendOutline className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 rounded-full border px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 cursor-pointer ${
          isDark 
            ? "border-white/10 bg-stone-900 text-white hover:bg-stone-850" 
            : "border-black/10 bg-white text-stone-900 hover:bg-stone-50"
        }`}
        aria-label="Open chatbot"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-black">
          <ChatIcon />
        </span>
        <span className="pr-2 text-left">
          <span className={`block text-[0.68rem] uppercase tracking-[0.26em] ${
            isDark ? "text-amber-200/70" : "text-amber-600"
          }`}>
            Live stylist
          </span>
          <span className="block text-sm font-medium">Ask Atelier</span>
        </span>
      </button>
    </div>
  )
}
