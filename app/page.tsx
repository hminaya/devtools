'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../components/shared/Card';
import { TOOLS, type Tool } from '../config/tools';

function shuffle(arr: Tool[]): Tool[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

export default function Dashboard() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    setTools(shuffle(TOOLS));
  }, []);

  const handleRandomTool = () => {
    const internalTools = TOOLS.filter((t) => !t.external);
    const randomTool = internalTools[Math.floor(Math.random() * internalTools.length)];
    if (randomTool) router.push(randomTool.route);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Developer Tools</h1>
          <p className="text-slate-600 text-lg">A collection of useful utilities for developers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Random Tool Card — always first */}
          <Card
            icon="🎲"
            title="Random Tool"
            description="Feeling lucky? Click here to discover a random tool from our collection!"
            onClick={handleRandomTool}
          />

          {tools.map((tool) => (
            <Card
              key={tool.id}
              icon={tool.icon}
              title={tool.name}
              description={tool.description}
              onClick={() => {
                if (tool.external) {
                  window.open(tool.route, '_blank', 'noopener,noreferrer');
                } else {
                  router.push(tool.route);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
