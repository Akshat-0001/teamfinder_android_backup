import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, Search, MessageCircle } from 'lucide-react';

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
          <div className="flex justify-center mb-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 shadow-lg">
              {currentSlide === 0 && <Search className="w-full h-full text-white" />}
              {currentSlide === 1 && <Users className="w-full h-full text-white" />}
              {currentSlide === 2 && <MessageCircle className="w-full h-full text-white" />}
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-3xl font-bold text-foreground">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="rounded-full w-12 h-12 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {currentSlide === slides.length - 1 ? (
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="btn-gradient px-8 py-3 rounded-full"
              >
                Get Started
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={nextSlide}
                className="btn-gradient px-8 py-3 rounded-full"
              >
                Next
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="rounded-full w-12 h-12 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingCarousel;