import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState, useRef } from 'react';

export default function TiltEffectCard() {
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: '50%', y: '50%', opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    );
    setGlare({
      x: `${(x / rect.width) * 100}%`,
      y: `${(y / rect.height) * 100}%`,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    setTransform(
      'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    setGlare({ x: '50%', y: '50%', opacity: 0 });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div
        ref={cardRef}
        className="relative transition-transform duration-200 ease-out"
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Your new project will be created with the latest version of our
              framework, complete with authentication, database, and API routes.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Deploy</Button>
          </CardFooter>
        </Card>

        {/* Glare effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${glare.x} ${glare.y}, rgba(255, 255, 255, ${glare.opacity}), transparent 50%)`,
            opacity: glare.opacity,
          }}
        />
      </div>
    </div>
  );
}
