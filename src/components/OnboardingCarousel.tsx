import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Search, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    icon: Search,
    title: "Discover Amazing Teams",
    subtitle: "Find hackathon teams, project collaborators, and research partners tailored to your interests and skills."
  },
  {
    icon: Users,
    title: "Build Your Dream Team",
    subtitle: "Create teams for your next big project and attract talented individuals who share your vision."
  },
  {
    icon: MessageCircle,
    title: "Collaborate Seamlessly",
    subtitle: "Chat with your team members in real-time and turn ideas into reality together."
  }
];

const OnboardingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Skip button */}
      <div className="p-4 flex justify-end">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/auth')}
          className="text-muted-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Carousel content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-md mx-auto w-full">
          {/* Icon */}
          <motion.div 
            className="flex justify-center mb-12"
            key={`icon-${currentSlide}`}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 10, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-24 h-24 flex items-center justify-center"
              >
                {currentSlide === 0 && (
                  <img
                    src="https://res.cloudinary.com/dmz1x7at4/image/upload/cropped_circle_image-min_xiyyo5.png"
                    alt="TeamFinder Logo"
                    className="w-full h-full object-cover"
                  />
                )}
                {currentSlide === 1 && <Users className="w-full h-full text-white" />}
                {currentSlide === 2 && <MessageCircle className="w-full h-full text-white" />}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`content-${currentSlide}`}
              className="text-center space-y-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.h1 
                className="text-3xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <motion.div 
            className="flex justify-center space-x-2 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30 w-3'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                layout
              />
            ))}
          </motion.div>

          {/* Navigation */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="rounded-full w-12 h-12 p-0 transition-all duration-200 hover:shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </motion.div>

            {currentSlide === slides.length - 1 ? (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="btn-gradient px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                layout
              >
                <Button
                  size="lg"
                  onClick={nextSlide}
                  className="btn-gradient px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Next
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="rounded-full w-12 h-12 p-0 transition-all duration-200 hover:shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;