import React, { useState, useEffect } from 'react';
// FIX: Imported LocalizedText type to resolve 'Cannot find name' error.
import { HomePageContent, ValueItem, AlliancePartner, Project, UIText, OurNumbersSection as OurNumbersSectionType, LocalizedText, Statistic } from '../types';
import Hero from '../components/Hero';
import ParallaxSection from '../components/ParallaxSection';
import LatestProjects from '../components/LatestProjects';
import { useI18n } from '../i18n';
import Editable from '../components/Editable';
import ActionLineCard from '../components/ActionLineCard';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';

interface HomePageProps {
  content: HomePageContent;
  uiText: UIText;
  projects: Project[];
}

interface OurNumbersSectionProps {
  content: OurNumbersSectionType;
  basePath: string;
}

const StatCard: React.FC<{stat: Statistic, basePath: string}> = ({ stat, basePath }) => {
  const { language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!stat.backgroundImages || stat.backgroundImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (stat.backgroundImages?.length || 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [stat.backgroundImages]);

  const hasBackground = stat.backgroundImages && stat.backgroundImages.length > 0;

  if (hasBackground) {
    return (
      <div className="relative p-8 rounded-lg shadow-lg text-center border-t-4 border-brand-accent overflow-hidden text-white min-h-[280px] flex flex-col justify-center">
        {stat.backgroundImages?.map((image, imgIndex) => (
          <img
            key={image}
            src={image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${imgIndex === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 bg-brand-green-dark opacity-70"></div>
        
        <div className="relative z-10">
          {stat.iconUrl && <img src={stat.iconUrl} alt="" className="h-12 w-12 mx-auto mb-4 filter brightness-0 invert" />}
          <div className="text-6xl font-bold">{stat.value}</div>
          <Editable localizedText={stat.label} basePath={`${basePath}.label`}>
            <div className="text-xl mt-2">{stat.label[language]}</div>
          </Editable>
        </div>
      </div>
    );
  }

  // Fallback for stats without background images
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center border-t-4 border-brand-accent min-h-[280px] flex flex-col justify-center">
      {stat.iconUrl && <img src={stat.iconUrl} alt="" className="h-12 w-12 text-brand-accent mx-auto mb-4" />}
      <div className="text-6xl font-bold text-brand-green-dark">{stat.value}</div>
      <Editable localizedText={stat.label} basePath={`${basePath}.label`}>
        <div className="text-xl text-brand-gray mt-2">{stat.label[language]}</div>
      </Editable>
    </div>
  );
};

const OurNumbersSection: React.FC<OurNumbersSectionProps> = ({ content, basePath }) => {
  const { language } = useI18n();
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0);
  
  if (!content.stats || content.stats.length === 0) return null;

  const handlePrev = () => {
    setMobileCurrentIndex(prev => (prev === 0 ? content.stats.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setMobileCurrentIndex(prev => (prev === content.stats.length - 1 ? 0 : prev + 1));
  };


  return (
    <div className="bg-brand-green-light py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Editable localizedText={content.title} basePath={`${basePath}.title`}>
            <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{content.title[language]}</h2>
          </Editable>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {content.stats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} basePath={`${basePath}.stats.${index}`} />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${mobileCurrentIndex * 100}%)` }}>
              {content.stats.map((stat, index) => (
                <div key={stat.id} className="w-full flex-shrink-0 px-2">
                  <StatCard stat={stat} basePath={`${basePath}.stats.${index}`} />
                </div>
              ))}
            </div>
          </div>

          {content.stats.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 -left-2 transform -translate-y-1/2 z-10 p-2 bg-white/50 rounded-full text-brand-green-dark shadow-md hover:bg-white"
                aria-label="Previous stat"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 p-2 bg-white/50 rounded-full text-brand-green-dark shadow-md hover:bg-white"
                aria-label="Next stat"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const AlliancesSection: React.FC<{title: LocalizedText; description: LocalizedText; partners: AlliancePartner[], basePath: string}> = ({ title, description, partners, basePath }) => {
  const { language } = useI18n();

  return (
    <div className="bg-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <Editable localizedText={title} basePath={`${basePath}.title`}>
                  <h2 className="text-4xl font-extrabold text-brand-green-dark mb-4">{title[language]}</h2>
                </Editable>
                <Editable localizedText={description} basePath={`${basePath}.description`} multiline>
                  <p className="text-lg text-brand-gray">{description[language]}</p>
                </Editable>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12 items-center">
                {partners.map(partner => (
                    <div key={partner.id} className="flex justify-center items-center h-28">
                        <img className="h-24 max-w-full object-contain" src={partner.logoUrl} alt={partner.name} />
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ content, uiText, projects }) => {
  const { language } = useI18n();
  const latestProjects = projects.slice(0, 4);

  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsWelcomeVisible(true);
      } else {
        setIsWelcomeVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Hero 
        slides={content.heroSlides}
        uiText={uiText}
      />
      
      {content.welcome && (
        <div className={`relative z-10 -mt-[1px] transition-all duration-700 ease-in-out ${isWelcomeVisible ? 'opacity-100' : 'opacity-0 translate-y-12'}`} style={{ transform: `translateY(-${isWelcomeVisible ? '2rem' : '0'})` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 lg:p-12">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                <div className="relative">
                  <img
                    className="rounded-lg shadow-2xl w-full object-cover"
                    src={content.welcome.imageUrl}
                    alt={content.welcome.imageAlt}
                  />
                </div>
                
                <div className="mt-8 lg:mt-0 lg:-ml-16 relative">
                  <div className="bg-brand-green-light p-6 md:p-8 rounded-lg shadow-xl border border-gray-200">
                      <h2 className="text-3xl md:text-4xl text-brand-green-dark mb-4">
                        <Editable localizedText={content.welcome.titlePart1} basePath="homePage.welcome.titlePart1">
                          <span className="font-normal">{content.welcome.titlePart1[language]}</span>
                        </Editable>
                          <br />
                        <Editable localizedText={content.welcome.titlePart2} basePath="homePage.welcome.titlePart2">
                          <span className="font-extrabold">{content.welcome.titlePart2[language]}</span>
                        </Editable>
                      </h2>
                      <Editable localizedText={content.welcome.slogan} basePath="homePage.welcome.slogan">
                        <p className="text-lg text-brand-green-dark italic mt-2 mb-4">{content.welcome.slogan[language]}</p>
                      </Editable>
                      <Editable localizedText={content.welcome.text} basePath="homePage.welcome.text" multiline>
                        <p className="text-lg text-brand-gray leading-relaxed whitespace-pre-line">
                            {content.welcome.text[language].trim()}
                        </p>
                      </Editable>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-brand-green-light py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <Editable localizedText={content.actionLines.title} basePath="homePage.actionLines.title">
                  <h2 className="text-4xl font-extrabold text-brand-green-dark mb-12">{content.actionLines.title[language]}</h2>
                </Editable>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-28 sm:gap-y-32 pt-24">
                    {content.actionLines.items.map((item, index) => (
                        <ActionLineCard item={item} key={item.id} basePath={`homePage.actionLines.items.${index}`} />
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {latestProjects.length > 0 && (
        <LatestProjects 
          title={content.latestProjects.title}
          slogan={content.latestProjects.slogan}
          subtitle={content.latestProjects.subtitle}
          projects={latestProjects}
          uiText={uiText} 
        />
      )}
      
      <ParallaxSection 
        title={content.parallax1.title}
        text={content.parallax1.text}
        imageUrl={content.parallax1.imageUrl}
        uiText={uiText}
        basePath="homePage.parallax1"
      />

      <OurNumbersSection content={content.ourNumbers} basePath="homePage.ourNumbers" />

      <AlliancesSection 
        title={content.alliances.title}
        description={content.alliances.description}
        partners={content.alliances.partners}
        basePath="homePage.alliances"
      />
      
      <ParallaxSection 
        title={content.parallax2.title}
        text={content.parallax2.text}
        imageUrl={content.parallax2.imageUrl}
        uiText={uiText}
        basePath="homePage.parallax2"
      />
    </>
  );
};

export default HomePage;