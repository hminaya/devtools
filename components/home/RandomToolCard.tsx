'use client';

import { useRouter } from 'next/navigation';
import Card from '../shared/Card';
import { TOOLS } from '../../config/tools';

function RandomToolCard() {
  const router = useRouter();

  const handleRandomTool = () => {
    const internalTools = TOOLS.filter((tool) => !tool.external);
    const randomTool = internalTools[Math.floor(Math.random() * internalTools.length)];

    if (randomTool) {
      router.push(randomTool.route);
    }
  };

  return (
    <Card
      icon="🎲"
      title="Random Tool"
      description="Feeling lucky? Click here to discover a random tool from our collection!"
      onClick={handleRandomTool}
    />
  );
}

export default RandomToolCard;
