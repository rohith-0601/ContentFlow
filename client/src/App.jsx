import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ChatWidget from './components/chat/ChatWidget';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import ContentEditor from './pages/ContentEditor';
import SprintBoard from './pages/SprintBoard';
import StandupView from './pages/StandupView';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <main style={{ paddingTop: '96px', paddingLeft: '40px', paddingRight: '40px', paddingBottom: '40px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/content" element={<ContentList />} />
            <Route path="/content/:id" element={<ContentEditor />} />
            <Route path="/sprint" element={<SprintBoard />} />
            <Route path="/standup" element={<StandupView />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
    </BrowserRouter>
  );
}
