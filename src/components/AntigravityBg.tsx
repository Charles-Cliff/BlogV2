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

const createRippleTexture = (time: number = 0): HTMLCanvasElement => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;
    const maxRadius = center;
    
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(0, 0, size, size);
    
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - center;
            const dy = y - center;
            const r = Math.sqrt(dx * dx + dy * dy);
            
            let height = 0;
            
            const wave1 = Math.sin(r * 0.04 * Math.PI * 2 - time * 6) * Math.exp(-r * 0.008);
            const wave2 = Math.sin(r * 0.06 * Math.PI * 2 - time * 9) * Math.exp(-r * 0.012) * 0.6;
            // const wave3 = Math.sin(r * 0.16 * Math.PI * 2 - time * 16) * Math.exp(-r * 0.016) * 0.3;
            
            height = wave1 + wave2;
            
            const noiseX = x * 0.01 + time * 0.5;
            const noiseY = y * 0.01 + time * 0.5;
            const noise = (Math.sin(noiseX) * Math.cos(noiseY) + Math.sin(noiseY * 1.3) * Math.cos(noiseX * 0.7)) * 0.1;
            height += noise;
            
            const decay = 1.0 / (1.0 + r * 0.002);
            height *= decay;
            
            const value = Math.round(128 + height * 40);
            const clampedValue = Math.max(0, Math.min(255, value));
            
            const idx = (y * size + x) * 4;
            data[idx] = clampedValue;
            data[idx + 1] = clampedValue;
            data[idx + 2] = clampedValue;
            data[idx + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const fadeGradient = ctx.createRadialGradient(
        center, center, maxRadius * 0.7,
        center, center, maxRadius
    );
    fadeGradient.addColorStop(0, 'rgba(128, 128, 128, 0)');
    fadeGradient.addColorStop(1, 'rgba(128, 128, 128, 1)');
    
    ctx.fillStyle = fadeGradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas;
};

interface Ripple {
    x: number;
    y: number;
    startTime: number;
    duration: number;
    maxRadius: number;
}

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

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

                // Maintain aspect ratio while covering the screen (like background-size: cover)
                const texAspect = bgTexture.width / bgTexture.height;
                const screenAspect = app.screen.width / app.screen.height;

                if (texAspect > screenAspect) {
                    // Texture is wider - fit by height
                    bgSprite.height = app.screen.height;
                    bgSprite.width = app.screen.height * texAspect;
                } else {
                    // Texture is taller - fit by width
                    bgSprite.width = app.screen.width;
                    bgSprite.height = app.screen.width / texAspect;
                }
                // Center the sprite
                bgSprite.x = (app.screen.width - bgSprite.width) / 2;
                bgSprite.y = (app.screen.height - bgSprite.height) / 2;

                app.stage.addChild(bgSprite);
                bgSpriteRef.current = bgSprite;

                const rippleCanvas = createRippleTexture(0);
                const dispSprite = new Sprite(Texture.from(rippleCanvas));
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
                    
                    let totalScale = 0;
                    let count = 0;
                    let latestRipple: Ripple | null = null;

                    for (let i = ripples.length - 1; i >= 0; i--) {
                        const r = ripples[i];
                        const elapsed = now - r.startTime;
                        const progress = elapsed / r.duration;

                        if (progress >= 1) {
                            ripples.splice(i, 1);
                        } else {
                            const easedProgress = easeOutQuart(progress);
                            const strength = 60 * (1 - easedProgress);
                            
                            totalScale += strength;
                            count++;
                            latestRipple = r;
                        }
                    }

                    if (count > 0 && latestRipple && dispSpriteRef.current && bgSpriteRef.current) {
                        const elapsed = now - latestRipple.startTime;
                        const progress = elapsed / latestRipple.duration;
                        const easedProgress = easeOutQuart(progress);
                        const radius = easedProgress * latestRipple.maxRadius;
                        
                        const time = elapsed / 1000;
                        const newCanvas = createRippleTexture(time);
                        const newTexture = Texture.from(newCanvas);
                        
                        dispSpriteRef.current.texture = newTexture;
                        dispSpriteRef.current.position.set(latestRipple.x, latestRipple.y);
                        dispSpriteRef.current.scale.set(radius / 256);
                        dispSpriteRef.current.visible = true;
                        
                        const filter = bgSpriteRef.current.filters?.[0] as DisplacementFilter;
                        if (filter) {
                            filter.scale.set(totalScale / count);
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
                { radius: 800, duration: 2500 },
                { radius: 1100, duration: 3500 },
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
