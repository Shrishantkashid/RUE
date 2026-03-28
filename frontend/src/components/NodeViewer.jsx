import React, { useState } from 'react';
import AnswerBlock from './AnswerBlock';
import { Loader2, Tag, X, Send, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function NodeViewer({ node, session_id, API_URL, simplifiedMode = false, magicSelectMode = false, depth = 0, path = [] }) {
  const [children, setChildren] = useState({}); // concept.context_id -> node_data
  const [loading, setLoading] = useState({});
  const [activeConcept, setActiveConcept] = useState(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [userExplanation, setUserExplanation] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [masteryStatus, setMasteryStatus] = useState(node.mastered ? 'MASTERED' : null);
  const [feedback, setFeedback] = useState(null);
  const [selectedTerms, setSelectedTerms] = useState([]);

  const handleTermToggle = (term) => {
    setSelectedTerms(prev => 
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const handleRemoveTag = (term) => {
    setSelectedTerms(prev => prev.filter(t => t !== term));
  };

  const handleStartDeepDive = async () => {
    if (selectedTerms.length === 0) return;
    
    const combinedKey = `custom-${selectedTerms.join('-')}`;
    setActiveConcept(combinedKey);
    
    if (children[combinedKey]) return;

    setLoading({ ...loading, [combinedKey]: true });
    try {
      const res = await axios.post(`${API_URL}/explain`, {
        session_id: session_id,
        terms: selectedTerms,
        parent_node_id: node.id,
        context: node.content,
        simpler: simplifiedMode
      });
      setChildren({ ...children, [combinedKey]: res.data.node });
      setSelectedTerms([]); // Clear after sending
    } catch (err) {
      console.error("Deep Dive error", err);
    } finally {
      setLoading({ ...loading, [combinedKey]: false });
    }
  };

  const handleVerify = async () => {
    if (!userExplanation.trim()) return;
    setVerifying(true);
    setFeedback(null);
    try {
      const res = await axios.post(`${API_URL}/verify`, {
        term: node.term,
        explanation: userExplanation,
        context: node.content
      });
      setMasteryStatus(res.data.status);
      setFeedback(res.data.feedback);
      if (res.data.status === 'MASTERED') {
        // In a real app, we'd sync this to backend DB here too
        setShowChallenge(false);
      }
    } catch (err) {
      console.error("Verification error", err);
      setFeedback("Failed to verify. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`glass-panel p-5 sm:p-7 rounded-2xl border-t border-l shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative group transition-all duration-700 ${
          masteryStatus === 'MASTERED' 
          ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
          : 'border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white font-bold text-lg shadow-inner shadow-white/20">
                    {node.term.charAt(0).toUpperCase()}
                </div>
                <div>
                   <div className="flex items-center space-x-2">
                     <h3 className="text-xl sm:text-2xl font-outfit font-bold text-white tracking-wide">
                       {node.term}
                     </h3>
                     <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold tracking-tighter text-gray-400">
                        {depth === 0 ? 'Foundation' : `Layer ${depth}`}
                     </span>
                     {masteryStatus === 'MASTERED' && (
                       <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-[10px] uppercase font-bold tracking-tighter text-yellow-500 animate-pulse">
                         <span>Golden Mastery</span>
                       </span>
                     )}
                   </div>
                   {path.length > 0 && (
                     <div className="flex items-center space-x-1 text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                        {path.map((p, i) => (
                          <React.Fragment key={p}>
                            <span>{p}</span>
                            <span className="opacity-30">/</span>
                          </React.Fragment>
                        ))}
                     </div>
                   )}
                </div>
            </div>
        </div>
        
        <div className="text-[1.05rem]">
            <AnswerBlock 
              content={node.content} 
              concepts={node.concepts} 
              onTermToggle={handleTermToggle}
              selectedTerms={selectedTerms}
              activeContextId={activeConcept}
              magicSelectMode={magicSelectMode}
            />
        </div>

        {/* Tags and Deep Dive Action Area */}
        <div className="mt-6 flex flex-col space-y-4">
            <AnimatePresence>
              {selectedTerms.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedTerms.map(term => (
                      <motion.span 
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={term}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold"
                      >
                         <Tag className="w-3 h-3" />
                         <span>{term}</span>
                         <button onClick={() => handleRemoveTag(term)} className="hover:text-white transition-colors">
                            <X className="w-3 h-3" />
                         </button>
                      </motion.span>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={handleStartDeepDive}
                      className="group relative flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-teal-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all active:scale-95"
                    >
                       <Send className="w-4 h-4" />
                       <span>Send Deep Dive</span>
                       <Sparkles className="w-3 h-3 ml-1 text-black/50" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>

        {/* Mastery Challenge UI */}
        <div className="mt-8 pt-6 border-t border-white/5">
            {!showChallenge && masteryStatus !== 'MASTERED' && (
               <button 
                 onClick={() => setShowChallenge(true)}
                 className="text-[11px] font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors flex items-center space-x-2 py-2 px-4 rounded-lg bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/20"
               >
                 <span>Prove Understanding to Unlock Mastery</span>
               </button>
            )}

            {showChallenge && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="space-y-4"
               >
                  <p className="text-sm text-gray-400 font-medium">Explain "{node.term}" in your own words based on what you've learned:</p>
                  <textarea 
                    value={userExplanation}
                    onChange={(e) => setUserExplanation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 outline-none focus:border-primary-500/50 transition-colors h-24 text-sm"
                    placeholder="Type your explanation here..."
                  />
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={handleVerify}
                      disabled={verifying || !userExplanation.trim()}
                      className="px-5 py-2 bg-primary-500 hover:bg-primary-400 text-black text-xs font-bold uppercase rounded-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <span>Submit for Mastery Check</span>
                      )}
                    </button>
                    <button 
                      onClick={() => setShowChallenge(false)}
                      className="text-xs font-bold uppercase text-gray-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
               </motion.div>
            )}

            {feedback && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`mt-4 p-4 rounded-xl border ${
                   masteryStatus === 'MASTERED' ? 'bg-yellow-500/10 border-yellow-500/20' : 
                   masteryStatus === 'LEARNING' ? 'bg-blue-500/10 border-blue-500/20' : 
                   'bg-gray-500/10 border-white/10'
                 }`}
               >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      masteryStatus === 'MASTERED' ? 'text-yellow-500' : 
                      masteryStatus === 'LEARNING' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {masteryStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed italic">"{feedback}"</p>
               </motion.div>
            )}
        </div>
        
        {/* Subtle decorative bg blob */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary-400/10 transition-colors duration-700"></div>
      </motion.div>

      {/* Children container with connecting line */}
      <div className="mt-4 sm:mt-6 pl-4 sm:pl-10 space-y-4 sm:space-y-6 border-l-2 border-white/10 relative ml-4 sm:ml-5 flex-1 w-[calc(100%-1rem)]">
        {[
          ...(node.concepts || []),
          ...Object.keys(children)
            .filter(id => id.startsWith('custom-') && !node.concepts?.find(c => (c.context_id || `custom-${c.term}`) === id))
            .map(id => ({ context_id: id, term: id.replace('custom-', '') }))
        ].map(concept => {
           const conceptId = concept.context_id || `custom-${concept.term}`;
           const childNode = children[conceptId];
           const isLoading = loading[conceptId];
           
           if (!childNode && !isLoading) return null;
           
           return (
             <div key={conceptId} className="relative z-10 w-full pr-2">
               {/* Horizontal branch line */}
               <motion.div 
                 initial={{ width: 0, opacity: 0 }}
                 animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 40, opacity: 1 }}
                 transition={{ duration: 0.8, ease: "circOut" }}
                 className="absolute -left-[1.125rem] sm:-left-[2.625rem] top-8 h-[2px] bg-white/10 pointer-events-none"
               ></motion.div>
               
               {isLoading ? (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="glass-panel p-4 rounded-xl flex items-center space-x-3 border border-primary-500/20 bg-primary-900/10 w-fit"
                 >
                    <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                    <span className="text-sm font-medium text-gray-300">
                      Deep diving into <strong className="text-primary-300">{concept.term}</strong>...
                    </span>
                 </motion.div>
               ) : childNode ? (
                 <NodeViewer 
                   node={childNode} 
                   session_id={session_id} 
                   API_URL={API_URL} simplifiedMode={simplifiedMode} magicSelectMode={magicSelectMode} depth={depth + 1} path={[...path, node.term]}
                 />
               ) : null}
             </div>
           );
        })}
      </div>
    </div>
  );
}
