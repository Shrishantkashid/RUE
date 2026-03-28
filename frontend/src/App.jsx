import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import NodeViewer from './components/NodeViewer';

const API_URL = "http://localhost:8000";

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [simplifiedMode, setSimplifiedMode] = useState(true); // Default to simplified as per PDF guidance

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasStarted(true);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ask`, { query });
      setSessionData({
        session_id: res.data.session_id,
        rootNode: res.data.node
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setHasStarted(false);
    setSessionData(null);
    setQuery('');
  };

  return (
    <div className="min-h-screen selection:bg-primary-500/30 font-inter">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-[-1] bg-bg-base overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/40 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl pt-10 pb-32 min-h-screen flex flex-col items-center">
        {/* Header - animate to top if started */}
        <motion.header 
          initial={false}
          animate={{
            y: hasStarted ? 0 : "25vh",
            scale: hasStarted ? 1 : 1.05,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center mb-10 w-full"
        >
          <div className="flex items-center space-x-3 text-primary-400">
            <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
            <h1 className="text-5xl sm:text-6xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-primary-500 drop-shadow-sm pb-2">
              RUE
            </h1>
          </div>
          
          {hasStarted && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center space-x-6 mt-4"
             >
                <button 
                  onClick={resetSession}
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span className="bg-white/10 p-1 rounded-md">Esc</span>
                  <span>Reset Engine</span>
                </button>
                
                <div className="h-4 w-[1px] bg-white/10"></div>
                
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary-300 transition-colors">
                    Simplify Mode
                  </span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={simplifiedMode}
                      onChange={() => setSimplifiedMode(!simplifiedMode)}
                    />
                    <div className={`block h-5 w-9 rounded-full transition-colors ${simplifiedMode ? 'bg-primary-500' : 'bg-white/10'}`}></div>
                    <div className={`absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform ${simplifiedMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </label>
             </motion.div>
          )}
          <p className={`text-lg sm:text-xl text-gray-400 font-medium tracking-wide mt-2 ${hasStarted ? 'hidden' : 'block'}`}>
            Recursive Understanding Engine
          </p>

          <form onSubmit={handleAsk} className="w-full max-w-3xl mt-12 relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-teal-500 rounded-2xl blur-md opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative flex items-center w-full bg-bg-surface border border-white/10 rounded-2xl shadow-xl overflow-hidden focus-within:border-primary-500/50 transition-colors">
                 <div className="pl-6 text-gray-400">
                   <Search className="w-6 h-6" />
                 </div>
                 <input 
                   type="text" 
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="What complex topic do you want to master?" 
                   className="w-full py-5 px-5 bg-transparent text-white placeholder-gray-500 outline-none text-lg sm:text-xl font-medium"
                 />
                 <button 
                   type="submit"
                   disabled={loading || !query.trim()}
                   className="px-6 py-3 mr-3 bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-400 hover:to-teal-400 text-white rounded-xl font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap shadow-lg shadow-primary-500/25"
                 >
                   <span>Break it down</span>
                   <Sparkles className="w-5 h-5 ml-1" />
                 </button>
             </div>
          </form>
        </motion.header>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading && !sessionData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center mt-20 space-y-6"
            >
               <div className="relative">
                 <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                 <Loader2 className="w-14 h-14 text-primary-400 animate-spin relative z-10" />
               </div>
               <p className="text-primary-300 font-medium text-lg animate-pulse tracking-wide">
                 Generating foundational answer & extracting concepts...
               </p>
            </motion.div>
          )}

          {sessionData && (
             <motion.div 
               initial={{ opacity: 0, y: 50 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
               className="w-full"
             >
               <div className="w-full max-w-4xl mx-auto pb-20">
                 <NodeViewer 
                   node={sessionData.rootNode} 
                   session_id={sessionData.session_id} 
                   API_URL={API_URL} simplifiedMode={simplifiedMode} depth={0} 
                 />
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
