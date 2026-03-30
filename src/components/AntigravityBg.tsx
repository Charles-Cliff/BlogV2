import { useRef, useEffect } from 'react';

// Pure CSS cursor-following glow with smooth transitions
const GlowFollower = () => {
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mouse tracking with smooth lerp using requestAnimationFrame
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;
        let rafId: number;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        };

        const animate = () => {
            // Smooth lerp factor (lower = smoother/slower)
            const lerp = 0.08;
            currentX += (mouseX - currentX) * lerp;
            currentY += (mouseY - currentY) * lerp;

            if (followerRef.current) {
                followerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
            rafId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchMove, { passive: true });
        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <div
            ref={followerRef}
            className="glow-follower pointer-events-none fixed inset-0"
            style={{
                width: '1px',
                height: '1px',
                willChange: 'transform',
            }}
        >
            {/* Core glow - brightest, smallest */}
            <div
                className="absolute rounded-full animate-pulse"
                style={{
                    width: '200px',
                    height: '200px',
                    left: '-100px',
                    top: '-100px',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    opacity: 0.6,
                    filter: 'blur(20px)',
                    animation: 'glow-breathe 4s ease-in-out infinite',
                }}
            />
            {/* Mid glow */}
            <div
                className="absolute rounded-full"
                style={{
                    width: '350px',
                    height: '350px',
                    left: '-175px',
                    top: '-175px',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 60%)',
                    opacity: 0.35,
                    filter: 'blur(35px)',
                    animation: 'glow-breathe 5s ease-in-out infinite 0.5s',
                }}
            />
            {/* Outer glow - softest */}
            <div
                className="absolute rounded-full"
                style={{
                    width: '500px',
                    height: '500px',
                    left: '-250px',
                    top: '-250px',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 50%)',
                    opacity: 0.15,
                    filter: 'blur(50px)',
                    animation: 'glow-breathe 6s ease-in-out infinite 1s',
                }}
            />
            {/* Ambient glow */}
            <div
                className="absolute rounded-full"
                style={{
                    width: '700px',
                    height: '700px',
                    left: '-350px',
                    top: '-350px',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 40%)',
                    opacity: 0.08,
                    filter: 'blur(70px)',
                    animation: 'glow-breathe 7s ease-in-out infinite 1.5s',
                }}
            />
            <style>{`
                @keyframes glow-breathe {
                    0%, 100% { transform: scale(1); opacity: inherit; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

// Subtle grain overlay
const GrainOverlay = () => (
    <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
            opacity: '0.03',
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')`,
        }}
    />
);

const Antigravity = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <GlowFollower />
            <GrainOverlay />
        </div>
    );
};

export default Antigravity;
