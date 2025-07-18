import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';

const AVATAR_FILENAMES = [
  'adventurerNeutral-1752555705236.svg',
  'adventurerNeutral-1752555844542.svg',
  'adventurerNeutral-1752555885321.svg',
  'adventurerNeutral-1752555632452.svg',
  'adventurerNeutral-1752555620358.svg',
  'adventurerNeutral-1752555576514.svg',
  'adventurerNeutral-1752555569732.svg',
  'adventurerNeutral-1752555539226.svg',
  'adventurerNeutral-1752555517160.svg',
  'adventurerNeutral-1752555502112.svg',
  'adventurerNeutral-1752555494843.svg',
  'adventurerNeutral-1752555486177.svg',
  'adventurerNeutral-1752555479233.svg',
  'adventurerNeutral-1752555471814.svg',
];

interface ProfileAvatarsProps {
  selectedAvatar?: string;
  onSelect: (avatar: string) => void;
  trigger?: React.ReactNode;
}

const ProfileAvatars = ({ selectedAvatar, onSelect, trigger }: ProfileAvatarsProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(
    selectedAvatar ? AVATAR_FILENAMES.indexOf(selectedAvatar) : 0
  );
  const swiperRef = useRef<any>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Choose Avatar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xs flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col items-center">
          <div className="relative flex items-center justify-center w-full" style={{ maxWidth: 260 }}>
            <button
              type="button"
              aria-label="Previous avatar"
              className="absolute left-0 z-10 p-2 rounded-full bg-background shadow hover:bg-accent/30 transition-colors"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeft className="w-6 h-6 text-muted-foreground" />
            </button>
            <Swiper
              modules={[]}
              spaceBetween={24}
              slidesPerView={3}
              centeredSlides
              loop
              initialSlide={activeIndex}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                if (selectedAvatar) {
                  const idx = AVATAR_FILENAMES.indexOf(selectedAvatar);
                  if (idx !== -1) swiper.slideToLoop(idx, 0);
                }
              }}
              className="w-full py-4 select-none"
              style={{ maxWidth: 260 }}
            >
              {AVATAR_FILENAMES.map((filename, idx) => (
                <SwiperSlide key={filename}>
                  <button
                    type="button"
                    className={`rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary mx-auto
                      ${activeIndex === idx ? 'scale-110 shadow-lg ring-4 ring-primary' : 'scale-90 opacity-70 ring-2 ring-muted'}
                    `}
                    style={{ background: '#fff' }}
                    onClick={() => {
                      onSelect(filename);
                      setOpen(false);
                    }}
            >
                    <img
                      src={`/avatars/${filename}`}
                      alt="Avatar"
                      className="w-16 h-16 object-contain rounded-full"
                      draggable={false}
                    />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
            <button
              type="button"
              aria-label="Next avatar"
              className="absolute right-0 z-10 p-2 rounded-full bg-background shadow hover:bg-accent/30 transition-colors"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileAvatars;