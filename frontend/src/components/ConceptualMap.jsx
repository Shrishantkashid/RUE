import React, { useEffect, useState } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

export default function ConceptualMap({ session_id, API_URL }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const fetchTree = async () => {
    try {
      const res = await axios.get(`${API_URL}/tree/${session_id}`);
      
      // Simple layout logic: Root at top, children below
      // For a real app, use @dagrejs/dagre
      const processedNodes = res.data.nodes.map((node, index) => ({
        ...node,
        style: { 
          background: 'rgba(23, 23, 23, 0.8)', 
          color: '#fff', 
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          width: 150,
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        },
        // Very basic layout: increment y for each node
        position: { x: (index % 3) * 200, y: Math.floor(index / 3) * 100 }
      }));

      const processedEdges = res.data.edges.map(edge => ({
        ...edge,
        animated: true,
        style: { stroke: '#2dd4bf' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#2dd4bf',
        },
      }));

      setNodes(processedNodes);
      setEdges(processedEdges);
    } catch (err) {
      console.error("Tree fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
    // Poll for updates every 5 seconds to show new nodes
    const interval = setInterval(fetchTree, 5000);
    return () => clearInterval(interval);
  }, [session_id]);

  return (
    <div className="w-full h-[500px] rounded-3xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-xl relative group">
      <div className="absolute top-6 left-6 z-10">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary-400 opacity-60">Conceptual Atlas</h4>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
      >
        <Background color="#333" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
