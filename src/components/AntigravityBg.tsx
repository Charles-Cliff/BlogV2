import { useRef, useEffect } from 'react';

// ============================================================================
// Simple Canvas Ripple Effect - Click/touch triggered
// ============================================================================

interface Ripple {
    x: number;
    y: number;
    startTime: number;
    duration: number;
    maxRadius: number;
}

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

const WaterRippleEffect = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ripplesRef = useRef<Ripple[]>([]);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const drawFrame = () => {
            const now = Date.now();
            const ripples = ripplesRef.current;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                const elapsed = now - r.startTime;
                const progress = elapsed / r.duration;

                if (progress >= 1) {
                    ripples.splice(i, 1);
                    continue;
                }

                const easedProgress = easeOutQuart(progress);
                const radius = easedProgress * r.maxRadius;

                // Main ripple ring
                ctx.beginPath();
                ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - easedProgress)})`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Secondary rings for depth
                for (let ring = 1; ring <= 2; ring++) {
                    const ringRadius = radius - ring * 25;
                    if (ringRadius > 0) {
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - easedProgress) * (1 - ring * 0.3)})`;
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    }
                }
            }

            rafRef.current = requestAnimationFrame(drawFrame);
        };

        rafRef.current = requestAnimationFrame(drawFrame);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    useEffect(() => {
        const createRipple = (x: number, y: number) => {
            ripplesRef.current.push({
                x, y,
                startTime: Date.now(),
                duration: 2000,
                maxRadius: 300,
            });
        };

        const onClick = (e: MouseEvent) => createRipple(e.clientX, e.clientY);
        const onTouch = (e: TouchEvent) => {
            if (e.touches[0]) createRipple(e.touches[0].clientX, e.touches[0].clientY);
        };

        window.addEventListener('click', onClick);
        window.addEventListener('touchstart', onTouch, { passive: true });

        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('touchstart', onTouch);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-30"
            style={{ mixBlendMode: 'overlay' }}
        />
    );
};

// ============================================================================
// Main Component
// ============================================================================

const Antigravity = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <WaterRippleEffect />
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-20"
                style={{
                    backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')`
                }}
            />
        </div>
    );
};

export default Antigravity;
