import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { Footer } from './components/Footer';
import { ContentArea } from './components/ContentArea';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  const [activeSection, setActiveSection] = useState('news');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isChatOnLeft, setIsChatOnLeft] = useState(false);
  const { themeMode } = useTheme();

  return (
    <div className={`h-screen flex flex-col bg-white dark:bg-gray-900 ${themeMode === 'dark' ? 'dark' : ''}`}>
      <Header onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-0 h-full transition-transform duration-300`}>
          <Sidebar 
            activeItem={activeSection} 
            setActiveItem={(item) => {
              setActiveSection(item);
              setIsMobileSidebarOpen(false);
            }}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden border-l dark:border-gray-800">
          {/* Chat and Content - swap positions and sizes based on isChatOnLeft */}
          {isChatOnLeft ? (
            <>
              {/* Chat on Left - takes main space */}
              <div className={`hidden lg:block overflow-hidden border-r dark:border-gray-800 transition-all duration-300 ${isChatCollapsed ? 'w-12' : 'flex-1'}`}>
                <Chat 
                  isCollapsed={isChatCollapsed}
                  setIsCollapsed={setIsChatCollapsed}
                  isOnLeft={isChatOnLeft}
                  setIsOnLeft={setIsChatOnLeft}
                />
              </div>
              
              {/* Content Area on Right - fixed width */}
              <div className={`bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ${isChatCollapsed ? 'flex-1' : 'w-80'}`}>
                <ContentArea activeSection={activeSection} />
              </div>
            </>
          ) : (
            <>
              {/* Content Area on Left - main space */}
              <div className={`bg-white dark:bg-gray-900 overflow-hidden transition-all duration-300 ${isChatCollapsed ? 'flex-1' : 'flex-1'}`}>
                <ContentArea activeSection={activeSection} />
              </div>
              
              {/* Chat on Right - fixed width */}
              <div className={`hidden lg:block overflow-hidden border-l dark:border-gray-800 transition-all duration-300 ${isChatCollapsed ? 'w-12' : 'w-80'}`}>
                <Chat 
                  isCollapsed={isChatCollapsed}
                  setIsCollapsed={setIsChatCollapsed}
                  isOnLeft={isChatOnLeft}
                  setIsOnLeft={setIsChatOnLeft}
                />
              </div>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
