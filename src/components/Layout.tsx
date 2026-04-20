import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Search, LogIn, LogOut, Menu, User, Settings, PenTool, Bookmark, Code2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, isAdmin, authError, login, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full nav-bg border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-text-secondary hover:text-text-primary">
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-accent/10 p-1.5 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Code2 className="w-6 h-6 text-accent" />
            </div>
            <span className="font-mono font-bold text-xl tracking-tight hidden sm:block">
              CodeStacker<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl px-4 lg:px-8">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search blogs, tags, content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-bg border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-secondary/50"
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {isAdmin && (
                <Link to="/admin" className="hidden sm:flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors">
                  <PenTool className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <button type="button" onClick={logout} className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors" title="Logout">
                <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
                <LogOut className="w-4 h-4 hidden sm:block" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
      {authError && (
        <div className="container mx-auto px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-100 text-sm">
          {authError}
        </div>
      )}
    </nav>
  );
};

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, isAdmin } = useAuth();
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      <div className={cn(
        "fixed lg:sticky top-0 lg:top-16 left-0 h-[100dvh] lg:h-[calc(100vh-4rem)] w-64 sidebar-bg border-r border-white/5 z-50 lg:z-0 transform transition-transform duration-300 lg:transform-none flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 lg:hidden border-b border-white/5 flex items-center gap-2">
           <Code2 className="w-6 h-6 text-accent" />
           <span className="font-mono font-bold text-lg">CodeStacker</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 px-2">Navigation</h3>
            <Link to="/" onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
              <Search className="w-4 h-4 text-slate-500" />
              <span>Explore Blogs</span>
            </Link>
            {user && (
              <Link to="/bookmarks" onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                <Bookmark className="w-4 h-4 text-slate-500" />
                <span>Bookmarks</span>
              </Link>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4 px-2">Categories</h3>
            {['Software Engineering', 'Artificial Intelligence', 'Frontend', 'Backend'].map(cat => (
              <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`} onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-text-secondary/50" />
                <span className="truncate">{cat}</span>
              </Link>
            ))}
          </div>

        </div>
        
        {isAdmin && (
          <div className="p-4 border-t border-white/5">
             <Link to="/admin" onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Admin Dashboard</span>
             </Link>
          </div>
        )}
      </div>
    </>
  );
};

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-primary">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full min-w-0 p-4 lg:p-8 main-bg overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
