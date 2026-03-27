'use client';

import { useEffect, useState, useRef } from 'react';


export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Get a Quote');
  const [activeTab, setActiveTab] = useState('realestate');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const parallaxRootRef = useRef<HTMLElement>(null);
  const heroLanesRef = useRef<HTMLDivElement>(null);

  const handleCallConversion = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: 'AW-17335403082/ul0ECKr5i_QaEMqElcpA',
        value: 200.0,
        currency: 'INR',
        event_callback: () => {
          window.location.href = url;
        }
      });
    } else {
      window.location.href = url;
    }
  };

  const openModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
    setFormStatus('idle');
    document.body.classList.add('overflow-hidden');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormStatus('idle');
    document.body.classList.remove('overflow-hidden');
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/quote', { method: 'POST', body: formData });
      if (res.ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  // Testimonials slide automatic rotation
  useEffect(() => {
    const slideCount = 6; // We have 6 testimonials
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Parallax and Hero Animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Parallax logic
    const parallaxRoot = parallaxRootRef.current;
    if (!prefersReducedMotion && parallaxRoot) {
      const parallaxItems = parallaxRoot.querySelectorAll<HTMLElement>('[data-parallax]');
      const baseTransforms = new Map<HTMLElement, string>();
      
      parallaxItems.forEach((item) => {
        const currentTransform = getComputedStyle(item).transform;
        baseTransforms.set(item, currentTransform === 'none' ? '' : currentTransform);
      });

      let rafRunning = false;
      const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
      
      const updateParallax = () => {
        const rect = parallaxRoot.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const sectionTop = window.scrollY + rect.top;
        const sectionHeight = rect.height;
        const scrollProgress = clamp(
          (window.scrollY - sectionTop + windowHeight * 0.35) / (sectionHeight + windowHeight * 0.35),
          0,
          1
        );
        const centered = (scrollProgress - 0.5) * 2;

        parallaxItems.forEach((item) => {
          const depth = Number(item.dataset.parallax || '0');
          const moveY = centered * depth * 260;
          const moveX = centered * depth * -140;
          const scale = 1 + Math.abs(centered) * depth * 0.08;
          const base = baseTransforms.get(item) || '';
          item.style.transform = `${base} translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})`;
        });

        rafRunning = false;
      };

      const requestParallax = () => {
        if (!rafRunning) {
          rafRunning = true;
          window.requestAnimationFrame(updateParallax);
        }
      };

      window.addEventListener('scroll', requestParallax, { passive: true });
      window.addEventListener('resize', requestParallax);
      requestParallax();

      return () => {
        window.removeEventListener('scroll', requestParallax);
        window.removeEventListener('resize', requestParallax);
      };
    }
  }, []);

  // Hero lanes animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = heroLanesRef.current;
    let animationFrameId: number;
    
    if (!prefersReducedMotion && stage) {
      const heroLanes = stage.querySelectorAll<HTMLElement>('.hero-diagonal-lane');
      
      const laneState: { lane: HTMLElement; cycle: number; speed: number; offset: number }[] = [];
      
      heroLanes.forEach((lane) => {
        const originalItems = Array.from(lane.children);
        originalItems.forEach((item) => {
          lane.appendChild(item.cloneNode(true));
        });
      });

      const startAnimation = () => {
        heroLanes.forEach((lane) => {
          const count = lane.children.length / 2;
          const first = lane.children[0] as HTMLElement;
          const firstClone = lane.children[count] as HTMLElement;
          const cycle = first && firstClone ? (firstClone.offsetTop - first.offsetTop) : 1000;
          laneState.push({
            lane,
            cycle: cycle > 0 ? cycle : 1000,
            speed: Number(lane.dataset.speed || '1'),
            offset: Number(lane.dataset.offset || '0')
          });
        });

        let previousTime = performance.now();
        let elapsed = 0;
        const baseSpeed = 22;

        const animateLanes = (now: number) => {
          const dt = Math.min(0.05, (now - previousTime) / 1000);
          previousTime = now;
          elapsed += dt;

          laneState.forEach((state) => {
            const drift = ((elapsed * baseSpeed * state.speed) + state.offset) % state.cycle;
            state.lane.style.transform = `translate3d(0, ${-drift}px, 0)`;
          });

          animationFrameId = window.requestAnimationFrame(animateLanes);
        };

        animationFrameId = window.requestAnimationFrame(animateLanes);
      };
      
      // Delay slightly to ensure layout is calculated for clone offsets
      setTimeout(() => {
        requestAnimationFrame(startAnimation);
      }, 100);
    }

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <div className="bg-brand-night text-white">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 lg:px-8">
            <a href="#top" className="flex items-center shrink-0">
              <img src="/images/logo-dark.svg" alt="Clevercrow" className="h-8 w-auto md:h-10 lg:h-12" />
            </a>
            <div className="flex items-center justify-end gap-2 md:gap-3">
              <a href="tel:09986389444" onClick={(e) => handleCallConversion(e, 'tel:09986389444')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-amber font-bold text-slate-900 transition hover:brightness-95 px-4 py-2 text-sm max-md:h-10 max-md:w-10 max-md:!p-0 max-md:text-lg">
                <ion-icon name="call"></ion-icon>
                <span className="max-md:hidden">09986389444</span>
              </a>
              <a href="https://wa.me/919986389444" target="_blank" rel="noopener noreferrer" className="max-md:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand-leaf px-4 py-2 text-sm font-bold text-white transition hover:brightness-110">
                <ion-icon name="logo-whatsapp"></ion-icon>WhatsApp
              </a>
            </div>
          </div>
        </header>

        <section id="top" ref={parallaxRootRef} className="hero-parallax-wrap relative overflow-hidden">
          <div className="hero-noise"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,.28),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(45,212,191,.24),transparent_36%),radial-gradient(circle_at_65%_80%,rgba(30,64,175,.34),transparent_42%)]"></div>
          <div className="hero-stars" aria-hidden="true">
            <span className="star s1"></span>
            <span className="star s2"></span>
            <span className="star s3"></span>
            <span className="star s4"></span>
            <span className="star s5"></span>
          </div>
          <div className="hero-scroll-stage" aria-hidden="true" ref={heroLanesRef}>
            <div className="hero-diagonal-lane lane-1" data-speed="1" data-offset="0">
              <div className="hero-shot"><img src="/images/thenortherngroup.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/adcritter.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/alchemistpharmarx.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/b2bind.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/baatu.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/anantahotels.webp" alt="" /></div>
            </div>
            <div className="hero-diagonal-lane lane-2" data-speed="1" data-offset="0">
              <div className="hero-shot"><img src="/images/greencity.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/intergy.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/gatewayfoundation.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/assetclass.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/terranea-2.webp" alt="" /></div>
              <div className="hero-shot"><img src="/images/littlepalmisland.webp" alt="" /></div>
            </div>
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div data-parallax="0.08" className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Website Growth Packages</p>
              <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">Your Website.<br /><span className="text-amber-300">Built to Convert.</span> Designed to Impress.</h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-200">High-performing websites for businesses that need leads, not just pages. Fast load. Mobile first. SEO-ready structure from day one.</p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="glass-card"><ion-icon name="hourglass-outline"></ion-icon>15+ Years Experience</div>
                <div className="glass-card"><ion-icon name="people-outline"></ion-icon>550+ Happy Clients</div>
                <div className="glass-card"><ion-icon name="ribbon-outline"></ion-icon>Certified Team</div>
                <div className="glass-card"><ion-icon name="flash-outline"></ion-icon>Fast Delivery & Support</div>
              </div>
              <div className="mt-7 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-1">
                <a href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"><ion-icon name="pricetag-outline"></ion-icon>View Prices</a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="logo-ticker">
            <div className="logo-track">
              <img src="/images/client1.png" alt="Client 1" /><img src="/images/client2.png" alt="Client 2" /><img src="/images/client3.png" alt="Client 3" /><img src="/images/client4.png" alt="Client 4" /><img src="/images/client5.png" alt="Client 5" /><img src="/images/client6.png" alt="Client 6" /><img src="/images/client7.png" alt="Client 7" /><img src="/images/client8.png" alt="Client 8" /><img src="/images/client9.png" alt="Client 9" /><img src="/images/client10.png" alt="Client 10" /><img src="/images/client11.png" alt="Client 11" /><img src="/images/client12.png" alt="Client 12" /><img src="/images/client13.png" alt="Client 13" /><img src="/images/client14.png" alt="Client 14" /><img src="/images/client1.png" alt="Client 1" /><img src="/images/client2.png" alt="Client 2" /><img src="/images/client3.png" alt="Client 3" /><img src="/images/client4.png" alt="Client 4" />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-gradient-to-b from-amber-50 via-white to-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:flex sm:items-center sm:justify-between sm:p-8 lg:p-12">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand-amber/20 blur-3xl" aria-hidden="true"></div>
              
              <div className="relative p-6 sm:p-0 sm:w-2/3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <ion-icon name="star"></ion-icon> Custom Solutions
                </span>
                <h3 className="mt-4 font-display text-3xl font-extrabold text-brand-night sm:text-4xl">Tailored Website Development</h3>
                <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">Get a high-performing website built specifically for your business goals. Featuring bespoke UI/UX, SEO-ready architecture, and seamless lead integrations.</p>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2"><ion-icon className="text-brand-amber text-xl" name="checkmark-circle"></ion-icon> Conversion Focused</span>
                  <span className="flex items-center gap-2"><ion-icon className="text-brand-amber text-xl" name="checkmark-circle"></ion-icon> Mobile First & Responsive</span>
                  <span className="flex items-center gap-2"><ion-icon className="text-brand-amber text-xl" name="checkmark-circle"></ion-icon> Lightning Fast Speeds</span>
                </div>
              </div>
              
              <div className="relative flex flex-col items-center border-t border-slate-100 bg-slate-50 p-6 sm:w-1/3 sm:shrink-0 sm:border-t-0 sm:border-l sm:bg-transparent sm:p-0 sm:pl-8 sm:text-center mt-0 sm:mt-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Investment</p>
                <p className="mt-1 text-3xl font-black text-brand-night">Custom</p>
                <p className="mt-2 text-xs text-slate-500 text-center">Formulated on your specific scope & requirements</p>
                <button type="button" onClick={() => openModal('Request Custom Quote')} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-night px-6 py-4 text-[15px] font-bold text-white transition-all hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg focus:ring-4 focus:ring-slate-300">
                  <ion-icon name="document-text-outline" className="text-lg"></ion-icon> Get a Custom Quote
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-brand-night py-14 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Get your website live in as little as 3 days.</h2>
          <p className="mt-3 text-slate-200">Talk to our team and launch faster with strategy, design, and development in one workflow.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a href="tel:09986389444" className="inline-flex items-center gap-2 rounded-full bg-brand-amber px-6 py-3 font-bold text-slate-900"><ion-icon name="call"></ion-icon>Call 09986389444</a>
              <a href="https://wa.me/919986389444" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand-leaf px-6 py-3 font-bold text-white"><ion-icon name="logo-whatsapp"></ion-icon>Chat on WhatsApp</a>
          </div>
        </div>
      </section>

      <section id="portfolio" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold text-brand-night sm:text-4xl">Our Website Portfolio</h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-600">Live projects across real estate, education, healthcare, industrial, e-commerce, hospitality, IT, corporate, and wellness segments.</p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2" id="portfolioTabs">
            <button className={`tab-btn ${activeTab === 'realestate' ? 'active' : ''}`} onClick={() => setActiveTab('realestate')}>Real Estate</button>
            <button className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>Education</button>
            <button className={`tab-btn ${activeTab === 'healthcare' ? 'active' : ''}`} onClick={() => setActiveTab('healthcare')}>Healthcare</button>
            <button className={`tab-btn ${activeTab === 'industrial' ? 'active' : ''}`} onClick={() => setActiveTab('industrial')}>Industrial</button>
            <button className={`tab-btn ${activeTab === 'ecommerce' ? 'active' : ''}`} onClick={() => setActiveTab('ecommerce')}>E-commerce</button>
            <button className={`tab-btn ${activeTab === 'hospitality' ? 'active' : ''}`} onClick={() => setActiveTab('hospitality')}>Hospitality</button>
            <button className={`tab-btn ${activeTab === 'it' ? 'active' : ''}`} onClick={() => setActiveTab('it')}>IT</button>
            <button className={`tab-btn ${activeTab === 'corporate' ? 'active' : ''}`} onClick={() => setActiveTab('corporate')}>Corporate</button>
            <button className={`tab-btn ${activeTab === 'wellness' ? 'active' : ''}`} onClick={() => setActiveTab('wellness')}>Wellness</button>
          </div>

          <div className="mt-8" id="portfolioPanels">
            <div className={`tab-panel ${activeTab === 'realestate' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://thenortherngroup.co.nz" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/thenortherngroup.webp" alt="The Northern Group" /><span>The Northern Group</span></a>
                <a href="https://acquirebuyersagency.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/acquirebuyersagency.webp" alt="Acquire Buyers" /><span>Acquire Buyers Agency</span></a>
                <a href="https://www.futurearthgroup.com/green-city" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/greencity.webp" alt="Green City" /><span>Green City</span></a>
                <a href="https://www.nivritifarms.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/nivritifarms.webp" alt="Nivriti Farms" /><span>Nivriti Farms</span></a>
                <a href="https://shbdeveloperss.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/shbdeveloperss.webp" alt="SHB" /><span>SHB Developers</span></a>
                <a href="https://ankurahomes.in/iqonwest/index.html" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/iqonwest.webp" alt="Iqon West" /><span>Iqon West</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'education' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://adcritter.ai/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/adcritter.webp" alt="Ad Critter" /><span>Ad Critter</span></a>
                <a href="https://carveraviation.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/carveraviation.webp" alt="Carver Aviation" /><span>Carver Aviation</span></a>
                <a href="https://www.intryc.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/intryc.webp" alt="Intryc" /><span>Intryc</span></a>
                <a href="https://peoplemanager.co/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/peoplemanager.webp" alt="People Manager" /><span>People Manager</span></a>
                <a href="https://www.rollins.edu" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/rollins.webp" alt="Rollins" /><span>Rollins</span></a>
                <a href="https://www.wgu.edu" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/wgu.webp" alt="WGU" /><span>WGU</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'healthcare' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://alchemistpharmarx.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/alchemistpharmarx.webp" alt="Alchemist" /><span>Alchemist Pharmarx</span></a>
                <a href="https://bettertomorrowtc.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/bettertomorrowtc.webp" alt="Better Tomorrow" /><span>Better Tomorrow</span></a>
                <a href="https://ddcsmiles.in/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/ddcsmiles.webp" alt="DDC Smiles" /><span>DDC Smiles</span></a>
                <a href="https://www.gatewayfoundation.org" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/gatewayfoundation.webp" alt="Gateway" /><span>Gateway Foundation</span></a>
                <a href="https://www.lakeviewhealth.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/lakeviewhealth.webp" alt="Lakeview" /><span>Lakeview Health</span></a>
                <a href="https://slcompounding.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/slcompounding.webp" alt="SL" /><span>SL Compounding</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'industrial' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://www.b2bind.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/b2bind.webp" alt="B2Bind" /><span>B2Bind</span></a>
                <a href="https://interiorbuildouts.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/interiorbuildouts.webp" alt="Interior Buildouts" /><span>Interior Buildouts</span></a>
                <a href="https://www.pcl.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/pcl.webp" alt="PCL" /><span>PCL</span></a>
                <a href="https://www.rud.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/rud.webp" alt="RUD" /><span>RUD</span></a>
                <a href="https://www.stenhouselifting.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/stenhouselifting.webp" alt="Sten House Lifting" /><span>Sten House Lifting</span></a>
                <a href="https://www.trivenigroup.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/trivenigroup.webp" alt="Triveni Group" /><span>Triveni Group</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'ecommerce' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://anatomyfitness.co/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/anatomyfitness.webp" alt="Anatomy Fitness" /><span>Anatomy Fitness</span></a>
                <a href="https://artebella.in/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/artebella.webp" alt="Artebella" /><span>Artebella</span></a>
                <a href="https://www.baatu.in/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/baatu.webp" alt="Baatu" /><span>Baatu</span></a>
                <a href="https://bellalash.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/bellalash.webp" alt="Bella Lash" /><span>Bella Lash</span></a>
                <a href="https://britishdarts.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/britishdarts.webp" alt="British Darts" /><span>British Darts</span></a>
                <a href="https://gatodates.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/gatodates.webp" alt="Gatodates" /><span>Gatodates</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'it' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://www.betterworldtechnology.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/betterworldtechnology.webp" alt="Betterworld" /><span>Betterworld Technology</span></a>
                <a href="https://exotel.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/exotel.webp" alt="Exotel" /><span>Exotel</span></a>
                <a href="https://www.intergy.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/intergy.webp" alt="Intergy" /><span>Intergy</span></a>
                <a href="https://uinno.io/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/lionwood.webp" alt="Uinno" /><span>Uinno</span></a>
                <a href="https://pubmatic.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/pubmatic.webp" alt="Pubmatic" /><span>Pubmatic</span></a>
                <a href="https://xenaidigital.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/xenaidigital.webp" alt="Xenai" /><span>Xenai Digital</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'hospitality' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://ahilyabythesea.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/ahilyabythesea.webp" alt="Ahilya" /><span>Ahilya</span></a>
                <a href="https://www.anantahotels.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/anantahotels.webp" alt="Ananta" /><span>Ananta Hotels</span></a>
                <a href="https://stay-boutique.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/boutique.webp" alt="Stay" /><span>Stay Boutique</span></a>
                <a href="https://www.jumeirah.com/en" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/jumeirah.webp" alt="Jumeirah" /><span>Jumeirah</span></a>
                <a href="https://www.postcardresorts.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/postcardresorts.webp" alt="Postcard" /><span>Postcard Resorts</span></a>
                <a href="https://www.raashotels.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/raashotels.webp" alt="Raas" /><span>Raas Hotels</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'corporate' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://www.assetclass.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/assetclass.webp" alt="Asset Class" /><span>Asset Class</span></a>
                <a href="https://www.corporatewebsite.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/corporateprofessionals.webp" alt="Corporate" /><span>Corporate Professionals</span></a>
                <a href="https://www.grahampartners.net/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/grahampartners.webp" alt="Graham" /><span>Graham Partners</span></a>
                <a href="https://www.jabil.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/jabil.webp" alt="Jabil" /><span>Jabil</span></a>
                <a href="https://kochhar.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/kochhar.webp" alt="Kochhar" /><span>Kochhar</span></a>
                <a href="https://www.lpl.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/lpl.webp" alt="LPL" /><span>LPL</span></a>
              </div>
            </div>

            <div className={`tab-panel ${activeTab === 'wellness' ? 'active' : ''}`}>
              <div className="portfolio-grid">
                <a href="https://www.littlepalmisland.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/littlepalmisland.webp" alt="Little Palm Island" /><span>Little Palm Island</span></a>
                <a href="https://lonretreat.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/lonretreat.webp" alt="Lon Retreat" /><span>Lon Retreat</span></a>
                <a href="https://www.niramaya.com.au/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/niramaya.webp" alt="Niramaya" /><span>Niramaya</span></a>
                <a href="https://www.terranea.com/" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/terranea-2.webp" alt="Terranea" /><span>Terranea</span></a>
                <a href="https://www.thedolphinbay.com" target="_blank" rel="noopener noreferrer" className="portfolio-item"><img src="/images/thedolphinbay.webp" alt="The Dolphin Bay" /><span>The Dolphin Bay</span></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold text-brand-night sm:text-4xl">Join Our Success Stories</h2>
          <div className="mx-auto mt-10 max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <article className={`testimonial-card testimonial-slide ${currentSlide === 0 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;We started getting 8-10 solid leads per day. Within 3 weeks, we sold 4 units directly from ad-generated leads.&quot;</p>
                <h3>Arun R., Director, Riva Builders</h3>
              </article>
              <article className={`testimonial-card testimonial-slide ${currentSlide === 1 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;Clevercrow delivered 300+ leads in under a month for our coaching centre launch. Messaging and creatives were spot on.&quot;</p>
                <h3>Ramesh Shetty, BrightEdge Academy</h3>
              </article>
              <article className={`testimonial-card testimonial-slide ${currentSlide === 2 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;In 2 months we ranked in top 3 for key local terms and now acquire patients every week from search.&quot;</p>
                <h3>Dr. Priya B., DDC Smiles</h3>
              </article>
              <article className={`testimonial-card testimonial-slide ${currentSlide === 3 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;They transformed our outdated website into a modern, client-focused digital storefront with better enquiry flow.&quot;</p>
                <h3>Shyam Patel, ARR Engineering</h3>
              </article>
              <article className={`testimonial-card testimonial-slide ${currentSlide === 4 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;Execution was fast and communication stayed clear across design, development, and campaign launch.&quot;</p>
                <h3>Client Team, Growth Brand</h3>
              </article>
              <article className={`testimonial-card testimonial-slide ${currentSlide === 5 ? 'active' : ''}`}>
                <span className="google-badge" aria-hidden="true">G</span>
                <p className="stars">★★★★★</p>
                <p>&quot;From branding alignment to conversion tracking, the final website was built for business outcomes.&quot;</p>
                <h3>Client Team, Services Company</h3>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold text-brand-night sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-3 text-center text-slate-600">Quick answers about delivery timelines, process, and support.</p>

          <div className="mt-8 space-y-3">
            <details className="faq-item" open>
              <summary>How long does it take to build a website?</summary>
              <p>Landing pages: 3-5 days. Business websites: 7-10 days. E-commerce websites: 12-15 days depending on content and functionality scope.</p>
            </details>
            <details className="faq-item">
              <summary>What do I need to provide to get started?</summary>
              <p>Your logo, service details, and any existing content. If needed, we help with structure, content direction, and design assets.</p>
            </details>
            <details className="faq-item">
              <summary>Will my website be mobile-friendly and SEO-ready?</summary>
              <p>Yes. Every build is responsive and includes clean URL structure, metadata setup, and on-page technical SEO basics.</p>
            </details>
            <details className="faq-item">
              <summary>Can you help with hosting, domain, and business email setup?</summary>
              <p>Yes. We support domain, hosting, SSL, and email setup during project onboarding and launch.</p>
            </details>
            <details className="faq-item">
              <summary>What happens after launch?</summary>
              <p>We run final QA, speed checks, and provide post-launch support for updates and fixes.</p>
            </details>
          </div>
        </div>
      </section>

      <footer className="bg-brand-night py-12 text-center text-white">
        <h2 className="font-display text-2xl font-bold">Ready to build a website that converts?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="tel:09986389444" className="inline-flex items-center gap-2 rounded-full bg-brand-amber px-6 py-3 font-bold text-slate-900"><ion-icon name="call"></ion-icon>Call 09986389444</a>
          <a href="https://wa.me/919986389444" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-brand-leaf px-6 py-3 font-bold text-white"><ion-icon name="logo-whatsapp"></ion-icon>Chat on WhatsApp</a>
        </div>
        <p className="mt-8 text-sm text-slate-300">Clever Crow Strategies LLP. &copy; All rights reserved</p>
        <p className="mt-2 text-sm text-slate-300">
          <a href="https://clevercrow.in/privacy-policy/" className="text-amber-300 hover:text-amber-200">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="https://clevercrow.in/terms-and-conditions/" className="text-amber-300 hover:text-amber-200">Terms &amp; Conditions</a>
        </p>
      </footer>

      <div className="sticky-cta" role="region" aria-label="Quick enquiry actions">
        <div className="sticky-cta-inner">
          <button type="button" onClick={() => openModal('Get a Quote')} className="sticky-cta-btn sticky-cta-primary">
            <ion-icon name="document-text-outline"></ion-icon>
            <span>Request a Quote</span>
          </button>
          <button type="button" onClick={() => openModal('Request a Call Back')} className="sticky-cta-btn sticky-cta-secondary">
            <ion-icon name="call-outline"></ion-icon>
            <span>Request Call Back</span>
          </button>
        </div>
      </div>

      <div className={`modal-overlay ${!isModalOpen ? 'hidden' : ''}`} role="dialog" aria-modal="true" aria-labelledby="quoteTitle" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal-card">
          <div className="modal-topline"></div>
          <div className="modal-header">
            <div>
              <p className="modal-kicker">Quick Response in 15 minutes</p>
              <h3 id="quoteTitle" className="font-display text-2xl font-bold text-brand-night">{modalTitle}</h3>
              <p className="modal-subtext">Share your details and our team will contact you with package options.</p>
            </div>
            <button type="button" onClick={closeModal} className="modal-close-btn" aria-label="Close form">Close</button>
          </div>

          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
            <input type="hidden" name="page" value={typeof window !== 'undefined' ? window.location.href : ''} />
            <input type="hidden" name="intent" value={modalTitle} />
            <div>
              <label htmlFor="quoteName" className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
              <input id="quoteName" name="name" type="text" required placeholder="Enter your name" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-amber focus:bg-white focus:ring-2 focus:ring-amber-200" />
            </div>
            <div>
              <label htmlFor="quotePhone" className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
              <input id="quotePhone" name="phone" type="tel" inputMode="tel" required placeholder="Enter your phone number" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-amber focus:bg-white focus:ring-2 focus:ring-amber-200" />
            </div>
            <div>
              <label htmlFor="quoteEmail" className="mb-1 block text-sm font-semibold text-slate-700">Email (Optional)</label>
              <input id="quoteEmail" name="email" type="email" placeholder="Enter your email" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-brand-amber focus:bg-white focus:ring-2 focus:ring-amber-200" />
            </div>

            {formStatus === 'success' && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✅ Thank you! We will contact you shortly.</p>
            )}
            {formStatus === 'error' && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">❌ Something went wrong. Please call us directly.</p>
            )}

            <button type="submit" disabled={formStatus === 'loading' || formStatus === 'success'} className="modal-submit-btn disabled:opacity-60">
              {formStatus === 'loading' ? 'Sending...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
