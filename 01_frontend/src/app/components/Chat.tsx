import React, { useState } from 'react';
import { Send, Paperclip, Smile, ChevronDown, MessageCircle, Users, Bell, Bot, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { useLanguage, TranslationKeys } from '../context/LanguageContext';

interface Message {
  id: number;
  textKey?: TranslationKeys;
  text?: string;
  sender: 'user' | 'other';
  time: string;
  userNameKey?: TranslationKeys;
  avatar?: string;
}

interface Contact {
  id: number;
  nameKey: TranslationKeys;
  status: 'online' | 'offline';
  avatar: string;
}

interface Notification {
  id: number;
  titleKey: TranslationKeys;
  messageKey: TranslationKeys;
  timeKey: TranslationKeys;
  read: boolean;
}

interface ChatProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOnLeft: boolean;
  setIsOnLeft: (onLeft: boolean) => void;
}

const initialMessages: Message[] = [
  {
    id: 1,
    textKey: 'chatMessage1',
    sender: 'other',
    time: '10:30',
    userNameKey: 'contactAnna',
    avatar: 'AI',
  },
  {
    id: 2,
    textKey: 'chatMessage2',
    sender: 'user',
    time: '10:32',
    text: 'Отлично, спасибо!',
  },
];

const contacts: Contact[] = [
  { id: 1, nameKey: 'contactAnna', status: 'online', avatar: 'AI' },
  { id: 2, nameKey: 'contactPeter', status: 'online', avatar: 'ПС' },
  { id: 3, nameKey: 'contactMaria', status: 'offline', avatar: 'МП' },
  { id: 4, nameKey: 'contactIvan', status: 'offline', avatar: 'ИИ' },
];

const notifications: Notification[] = [
  { id: 1, titleKey: 'notifTitle1', messageKey: 'notifMessage1', timeKey: 'notifTime1', read: false },
  { id: 2, titleKey: 'notifTitle2', messageKey: 'notifMessage2', timeKey: 'notifTime2', read: false },
  { id: 3, titleKey: 'notifTitle3', messageKey: 'notifMessage3', timeKey: 'notifTime3', read: true },
];

type SectionType = 'messenger' | 'contacts' | 'notifications' | 'ai';

export function Chat({ isCollapsed, setIsCollapsed, isOnLeft, setIsOnLeft }: ChatProps) {
  const [message, setMessage] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [expandedSection, setExpandedSection] = useState<SectionType | null>(null);
  const { t } = useLanguage();

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAiSubmit = () => {
    if (aiInput.trim()) {
      console.log('AI Query:', aiInput);
      // Здесь можно добавить логику обработки AI запроса
      setAiInput('');
    }
  };

  const toggleSection = (section: SectionType) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="relative flex h-full bg-white dark:bg-gray-900">
      {/* Hover Zone for Collapse Button - Top */}
      <div 
        className={`absolute top-0 ${isOnLeft ? 'right-0' : 'left-0'} w-12 h-40 z-[100] group`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-8 ${isOnLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100`}
          title={isCollapsed ? t('expand') : t('collapse')}
        >
          {isCollapsed ? (
            isOnLeft ? <ChevronRight className="size-4 text-gray-600 dark:text-gray-400" /> : <ChevronLeft className="size-4 text-gray-600 dark:text-gray-400" />
          ) : (
            isOnLeft ? <ChevronLeft className="size-4 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="size-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Hover Zone for Swap Button - Bottom */}
      <div 
        className={`absolute bottom-0 ${isOnLeft ? 'right-0' : 'left-0'} w-12 h-40 z-[100] group`}
      >
        <button
          onClick={() => setIsOnLeft(!isOnLeft)}
          className={`absolute bottom-8 ${isOnLeft ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100`}
          title={t('swapPosition')}
        >
          <ArrowLeftRight className="size-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex flex-col items-center justify-center py-8 gap-4 w-full">
          <MessageCircle className="size-5 text-blue-600 dark:text-blue-400" />
          <Users className="size-5 text-green-600 dark:text-green-400" />
          <Bell className="size-5 text-orange-600 dark:text-orange-400" />
          <Bot className="size-5 text-purple-600 dark:text-purple-400" />
        </div>
      )}
      
      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {/* Messenger Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleSection('messenger')}
              className="w-full h-12 px-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{t('messenger')}</span>
              </div>
              <ChevronDown
                className={`size-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  expandedSection === 'messenger' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Separator line with padding */}
            <div className="px-4">
              <div className="border-b border-gray-200 dark:border-gray-800" />
            </div>

            {expandedSection === 'messenger' && (
              <div className="flex flex-col bg-gray-50 dark:bg-gray-950">
                {/* Messages Area */}
                <div className="h-64 overflow-y-auto p-3 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex gap-2 max-w-[85%] ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {msg.sender === 'other' && (
                          <div className="size-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {msg.avatar}
                          </div>
                        )}
                        <div>
                          {msg.sender === 'other' && msg.userNameKey && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-2">{t(msg.userNameKey)}</p>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              msg.sender === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <p className="text-sm">
                              {msg.sender === 'user' 
                                ? msg.text || '' 
                                : msg.textKey ? t(msg.textKey) : ''
                              }
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 px-2">{msg.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0">
                      <Paperclip className="size-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('typeMessage')}
                        rows={1}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm"
                      />
                      <button className="absolute right-2 bottom-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <Smile className="size-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSend}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex-shrink-0"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contacts Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleSection('contacts')}
              className="w-full h-12 px-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="size-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{t('contacts')}</span>
              </div>
              <ChevronDown
                className={`size-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  expandedSection === 'contacts' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Separator line with padding */}
            <div className="px-4">
              <div className="border-b border-gray-200 dark:border-gray-800" />
            </div>

            {expandedSection === 'contacts' && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white dark:hover:bg-gray-900 transition-colors border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="size-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(contact.nameKey)}</p>
                      <p className={`text-xs flex items-center gap-1 ${
                        contact.status === 'online' 
                          ? 'text-green-600 dark:text-green-500' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          contact.status === 'online' 
                            ? 'bg-green-600 dark:bg-green-500' 
                            : 'bg-gray-400 dark:bg-gray-600'
                        }`} />
                        {contact.status === 'online' ? t('online') : t('offline')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Business Notifications Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleSection('notifications')}
              className="w-full h-12 px-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bell className="size-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{t('businessNotifications')}</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-600 text-white text-xs rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`size-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  expandedSection === 'notifications' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Separator line with padding */}
            <div className="px-4">
              <div className="border-b border-gray-200 dark:border-gray-800" />
            </div>

            {expandedSection === 'notifications' && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-950">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-200 dark:border-gray-800 last:border-b-0 hover:bg-white dark:hover:bg-gray-900 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t(notification.titleKey)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t(notification.messageKey)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{t(notification.timeKey)}</p>
                      </div>
                      {!notification.read && (
                        <span className="size-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Assistant Section */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleSection('ai')}
              className="w-full h-12 px-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{t('aiAssistant')}</span>
              </div>
              <ChevronDown
                className={`size-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  expandedSection === 'ai' ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Separator line with padding */}
            <div className="px-4">
              <div className="border-b border-gray-200 dark:border-gray-800" />
            </div>

            {expandedSection === 'ai' && (
              <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('aiAssistantDescription')}</p>
                  
                  <div className="space-y-2">
                    <button className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('aiSuggest1')}</p>
                    </button>
                    <button className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('aiSuggest2')}</p>
                    </button>
                    <button className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:border-purple-500 dark:hover:border-purple-500 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('aiSuggest3')}</p>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder={t('aiInputPlaceholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 text-sm"
                    />
                    <button
                      onClick={handleAiSubmit}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm flex-shrink-0"
                    >
                      {t('ask')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}