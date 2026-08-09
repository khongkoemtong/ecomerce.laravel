import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'

function ScrollReveal({ children, className = "", delay = "delay-0" }) {
  const [isVisible, setIsVisible] = useState(false)
  const domRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })
    
    if (domRef.current) {
      observer.observe(domRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div 
      ref={domRef} 
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${delay} ${className}`}
    >
      {children}
    </div>
  )
}

export default function AboutPage() {
  const { isDark } = useTheme()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDark 
        ? "bg-stone-950 text-stone-100" 
        : "bg-stone-50 text-stone-900"
    }`}>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80" 
              alt="Atelier Storefront" 
              className="w-full h-full object-cover opacity-80 scale-105"
            />
            <div className={`absolute inset-0 ${isDark ? 'bg-stone-950/60' : 'bg-stone-950/40'}`}></div>
          </div>
          
          <div className="relative z-10 text-center px-6 mt-16 max-w-4xl mx-auto">
            <ScrollReveal>
              <h1 className="font-serif text-6xl md:text-8xl mb-6 text-white tracking-tight">
                Our Story
              </h1>
            </ScrollReveal>
            <ScrollReveal delay="delay-200">
              <p className="text-sm md:text-base uppercase tracking-[0.3em] font-semibold text-stone-200">
                Redefining Modern Luxury Since 2018
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-32 px-6 md:px-12 max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="font-serif text-2xl md:text-4xl leading-relaxed mb-8">
              "Atelier was born from a simple belief: clothing should not just be worn, but experienced. We set out to create a wardrobe that balances architectural precision with effortless fluidity."
            </p>
            <div className={`w-16 h-px mx-auto ${isDark ? 'bg-amber-500' : 'bg-amber-700'}`}></div>
          </ScrollReveal>
        </section>

        {/* Parallax Image 1 */}
        <section 
          className="h-[60vh] md:h-[80vh] w-full bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1fac084092?auto=format&fit=crop&w=2000&q=80')" }}
        >
        </section>

        {/* The Craft Section */}
        <section className="py-32 px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center">
            <div className="w-full md:w-1/2">
              <ScrollReveal>
                <img 
                  src="https://i.pinimg.com/736x/d0/06/06/d00606023b3ea21f65551684d4df0a9a.jpg" 
                  alt="Craftsmanship" 
                  className="w-full h-auto aspect-[3/4] object-cover shadow-2xl"
                />
              </ScrollReveal>
            </div>
            <div className="w-full md:w-1/2">
              <ScrollReveal delay="delay-200">
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block ${
                  isDark ? 'text-amber-500' : 'text-amber-700'
                }`}>
                  The Craft
                </span>
                <h2 className="font-serif text-4xl md:text-5xl mb-8">
                  Mastering the Art of Restraint
                </h2>
                <div className={`space-y-6 text-sm md:text-base leading-relaxed ${
                  isDark ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  <p>
                    Every piece in our collection is a testament to meticulous craftsmanship. We believe that true luxury whispers rather than shouts. It relies on the tactile quality of the fabric, the precision of the cut, and the subtle details that reveal themselves over time.
                  </p>
                  <p>
                    We source our materials from some of the most respected mills in the world, prioritizing sustainable practices and ethical production. From virgin wool to bias-cut silks, our fabrics are chosen for their ability to hold shape while offering unparalleled comfort.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Parallax Image 2 */}
        <section 
          className="h-[60vh] md:h-[80vh] w-full bg-fixed bg-center bg-cover relative"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80')" }}
        >
          <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-stone-950/40' : 'bg-stone-900/30'}`}>
            <ScrollReveal>
              <h2 className="font-serif text-5xl md:text-7xl text-white tracking-wide px-6 text-center">
                Elevating the Everyday
              </h2>
            </ScrollReveal>
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="py-32 px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-16 md:gap-24 items-center">
            <div className="w-full md:w-1/2">
              <ScrollReveal>
                <img 
                  src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80" 
                  alt="Studio space" 
                  className="w-full h-auto aspect-[3/4] object-cover shadow-2xl"
                />
              </ScrollReveal>
            </div>
            <div className="w-full md:w-1/2">
              <ScrollReveal delay="delay-200">
                <span className={`text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block ${
                  isDark ? 'text-amber-500' : 'text-amber-700'
                }`}>
                  Our Space
                </span>
                <h2 className="font-serif text-4xl md:text-5xl mb-8">
                  Designed with Intention
                </h2>
                <div className={`space-y-6 text-sm md:text-base leading-relaxed ${
                  isDark ? 'text-stone-400' : 'text-stone-600'
                }`}>
                  <p>
                    Our flagship store and studio are designed to reflect the very essence of our clothing: minimalist, warm, and inviting. We want every visit to feel like a discovery.
                  </p>
                  <p>
                    By controlling every step of the process—from the initial sketch to the final stitch—we ensure that our vision remains uncompromised. It is this dedication to intentionality that allows us to create garments that outlast fleeting trends.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className={`border-t py-32 px-6 text-center overflow-hidden ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <ScrollReveal>
            <h3 className="font-serif text-3xl md:text-4xl mb-8">Experience the Collection</h3>
            <Link 
              to="/shop" 
              className={`inline-block px-12 py-5 text-xs uppercase tracking-[0.25em] font-bold transition ${
                isDark 
                  ? 'bg-amber-500 text-black hover:bg-amber-400' 
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              Shop Now
            </Link>
          </ScrollReveal>
        </section>
      </main>
    </div>
  )
}
