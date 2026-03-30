import { useRef, useEffect } from 'react';
import { Application, Sprite, Texture, DisplacementFilter, Assets } from 'pixi.js';

const BlurFollower = () => {
    const followerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (followerRef.current) {
                const x = e.clientX - 300;
                const y = e.clientY - 300;
                followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (followerRef.current && e.touches[0]) {
                const touch = e.touches[0];
                const x = touch.clientX - 300;
                const y = touch.clientY - 300;
                followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchstart', handleTouchMove, { passive: true });
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchstart', handleTouchMove);
        };
    }, []);

    return (
        <div
            ref={followerRef}
            className="blur-follower absolute top-0 left-0 w-[600px] h-[600px] rounded-full z-0 pointer-events-none"
            style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                maskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'radial-gradient(closest-side, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
                willChange: 'transform',
            }}
        />
    );
};

const createRippleTexture = (): HTMLCanvasElement => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const maxRadius = center;
    
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, size, size);
    
    const rings = 10;
    const ringWidth = maxRadius * 0.85 / rings;
    const fadeStart = maxRadius * 0.8;
    
    for (let ring = 0; ring < rings; ring++) {
        const innerR = ring * ringWidth;
        const outerR = (ring + 1) * ringWidth;
        
        if (outerR > fadeStart) continue;
        
        const gradient = ctx.createRadialGradient(center, center, innerR, center, center, outerR);
        
        const waveIntensity = 1 - (ring / rings) * 0.4;
        
        if (ring % 2 === 0) {
            const val = Math.round(128 + 40 * waveIntensity);
            gradient.addColorStop(0, `rgb(${val}, ${val}, ${val})`);
            gradient.addColorStop(0.5, `rgb(${val + 20}, ${val + 20}, ${val + 20})`);
            gradient.addColorStop(1, `rgb(${val}, ${val}, ${val})`);
        } else {
            const val = Math.round(128 - 40 * waveIntensity);
            gradient.addColorStop(0, `rgb(${val}, ${val}, ${val})`);
            gradient.addColorStop(0.5, `rgb(${val - 20}, ${val - 20}, ${val - 20})`);
            gradient.addColorStop(1, `rgb(${val}, ${val}, ${val})`);
        }
        
        ctx.beginPath();
        ctx.arc(center, center, outerR, 0, Math.PI * 2);
        ctx.arc(center, center, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    const fadeGradient = ctx.createRadialGradient(
        center, center, fadeStart,
        center, center, maxRadius
    );
    fadeGradient.addColorStop(0, 'rgba(128, 128, 128, 0)');
    fadeGradient.addColorStop(0.6, 'rgba(128, 128, 128, 0.8)');
    fadeGradient.addColorStop(1, 'rgba(128, 128, 128, 1)');
    
    ctx.beginPath();
    ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
    ctx.arc(center, center, fadeStart, 0, Math.PI * 2, true);
    ctx.fillStyle = fadeGradient;
    ctx.fill();
    
    return canvas;
};

interface Ripple {
    x: number;
    y: number;
    startTime: number;
    duration: number;
    maxRadius: number;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const WaterRippleEffect = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const bgSpriteRef = useRef<Sprite | null>(null);
    const dispSpriteRef = useRef<Sprite | null>(null);
    const ripplesRef = useRef<Ripple[]>([]);
    const initRef = useRef(false);

    useEffect(() => {
        if (!containerRef.current || initRef.current) return;

        const init = async () => {
            try {
                const bgStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-url');
                const match = bgStyle.match(/url\(['"]?([^'")\s]+)['"]?\)/);
                const bgUrl = match?.[1];
                
                if (!bgUrl) return;

                const app = new Application();
                
                await app.init({
                    width: window.innerWidth,
                    height: window.innerHeight,
                    backgroundAlpha: 0,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true,
                });

                if (!containerRef.current) {
                    app.destroy(true);
                    return;
                }

                containerRef.current.appendChild(app.canvas);
                appRef.current = app;
                initRef.current = true;

                const bgTexture = await Assets.load(bgUrl);
                const bgSprite = new Sprite(bgTexture);
                bgSprite.width = app.screen.width;
                bgSprite.height = app.screen.height;
                app.stage.addChild(bgSprite);
                bgSpriteRef.current = bgSprite;

                const rippleCanvas = createRippleTexture();
                const rippleTexture = Texture.from(rippleCanvas);
                
                const dispSprite = new Sprite(rippleTexture);
                dispSprite.anchor.set(0.5);
                dispSprite.visible = false;
                app.stage.addChild(dispSprite);
                dispSpriteRef.current = dispSprite;

                const filter = new DisplacementFilter(dispSprite);
                filter.scale.set(0);
                bgSprite.filters = [filter];

                window.addEventListener('resize', () => {
                    if (appRef.current && bgSpriteRef.current) {
                        appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
                        bgSpriteRef.current.width = appRef.current.screen.width;
                        bgSpriteRef.current.height = appRef.current.screen.height;
                    }
                });

                app.ticker.add(() => {
                    const now = Date.now();
                    const ripples = ripplesRef.current;
                    
                    let totalScaleX = 0;
                    let totalScaleY = 0;
                    let count = 0;
                    let latestRipple: Ripple | null = null;

                    for (let i = ripples.length - 1; i >= 0; i--) {
                        const r = ripples[i];
                        const elapsed = now - r.startTime;
                        const progress = elapsed / r.duration;

                        if (progress >= 1) {
                            ripples.splice(i, 1);
                        } else {
                            const easedProgress = easeOutCubic(progress);
                            const strength = 45 * (1 - easedProgress);
                            
                            totalScaleX += strength;
                            totalScaleY += strength;
                            count++;
                            latestRipple = r;
                        }
                    }

                    if (count > 0 && latestRipple && dispSpriteRef.current && bgSpriteRef.current) {
                        const elapsed = now - latestRipple.startTime;
                        const progress = elapsed / latestRipple.duration;
                        const easedProgress = easeOutCubic(progress);
                        const radius = easedProgress * latestRipple.maxRadius;
                        
                        dispSpriteRef.current.position.set(latestRipple.x, latestRipple.y);
                        dispSpriteRef.current.scale.set(radius / 256);
                        dispSpriteRef.current.visible = true;
                        
                        const filter = bgSpriteRef.current.filters?.[0] as DisplacementFilter;
                        if (filter) {
                            filter.scale.set(totalScaleX / count);
                        }
                    } else if (dispSpriteRef.current && bgSpriteRef.current) {
                        dispSpriteRef.current.visible = false;
                        const filter = bgSpriteRef.current.filters?.[0] as DisplacementFilter;
                        if (filter) filter.scale.set(0);
                    }
                });
            } catch (err) {
                console.error('[Ripple] Init error:', err);
            }
        };

        const checkBg = () => {
            if (document.body.classList.contains('bg-loaded')) {
                setTimeout(init, 200);
            } else {
                setTimeout(checkBg, 100);
            }
        };
        
        checkBg();

        return () => {
            ripplesRef.current = [];
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
            initRef.current = false;
        };
    }, []);

    useEffect(() => {
        const createRipple = (x: number, y: number) => {
            if (!appRef.current) return;

            ripplesRef.current = [];

            [
                { delay: 0, radius: 300, duration: 2200 },
                { delay: 0, radius: 380, duration: 2800 },
                { delay: 0, radius: 460, duration: 3400 },
            ].forEach(wave => {
                ripplesRef.current.push({
                    x, y,
                    startTime: Date.now(),
                    duration: wave.duration,
                    maxRadius: wave.radius,
                });
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

    return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30" />;
};

const Antigravity = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <BlurFollower />
            <WaterRippleEffect />
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-20"
                style={{
                    backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3Rpb25hbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')`
                }}
            />
        </div>
    );
};

export default Antigravity;
