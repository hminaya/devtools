'use client';

import { useRouter } from 'next/navigation';
import Card from '../components/shared/Card';
import { TOOLS } from '../config/tools';

export default function Dashboard() {
  const router = useRouter();

  const handleRandomTool = () => {
    const randomIndex = Math.floor(Math.random() * TOOLS.length);
    const randomTool = TOOLS[randomIndex];
    if (randomTool) {
      router.push(randomTool.route);
    }
  };

  // Separate OSS Data from other tools
  const ossDataTool = TOOLS.find((tool) => tool.id === 'oss-data');
  const otherTools = TOOLS.filter((tool) => tool.id !== 'oss-data');

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Developer Tools</h1>
          <p className="text-slate-600 text-lg">A collection of useful utilities for developers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Random Tool Card */}
          <Card
            icon="🎲"
            title="Random Tool"
            description="Feeling lucky? Click here to discover a random tool from our collection!"
            onClick={handleRandomTool}
          />

          {/* OSS Data Tool - positioned after Random Tool */}
          {ossDataTool && (
            <Card
              key={ossDataTool.id}
              icon={ossDataTool.icon}
              title={ossDataTool.name}
              description={ossDataTool.description}
              onClick={() => {
                if (ossDataTool.external) {
                  window.open(ossDataTool.route, '_blank', 'noopener,noreferrer');
                } else {
                  router.push(ossDataTool.route);
                }
              }}
            />
          )}

          {/* All Other Tools */}
          {otherTools.map((tool) => (
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
