import { Building, Heart, HelpCircle, Phone, MapPin, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { ContentModal } from './ContentModal';

interface HubItem {
  id: string;
  icon: React.ReactNode;
  text: string;
  position: string;
}

const hubItems: HubItem[] = [
  {
    id: 'htm',
    icon: <HelpCircle className="w-8 h-8 text-blue-600 stroke-[4]" />,
    text: 'HTM... Apaan tuh?',
    position: 'top-[12%] left-1/2 -translate-x-1/2 -translate-y-1/2'
  },
  {
    id: 'contact',
    icon: <Phone className="w-8 h-8 text-green-600 stroke-[4]" />,
    text: 'Kontak kami!',
    position: 'top-[22%] right-[20%] -translate-y-1/2'
  },
  {
    id: 'location',
    icon: <MapPin className="w-8 h-8 text-red-600 stroke-[4]" />,
    text: 'Lokasi',
    position: 'top-1/2 right-[15%] -translate-y-1/2'
  },
  {
    id: 'brochure',
    icon: <FileText className="w-8 h-8 text-purple-600 stroke-[4]" />,
    text: 'E-Brochure',
    position: 'bottom-[22%] right-[20%] translate-y-1/2'
  },
  {
    id: 'register',
    icon: <ClipboardList className="w-8 h-8 text-orange-600 stroke-[4]" />,
    text: 'Cara Daftarnya?',
    position: 'bottom-[15%] left-1/2 -translate-x-1/2 translate-y-1/2'
  },
  {
    id: 'faq',
    icon: <MessageSquare className="w-8 h-8 text-cyan-600 stroke-[4]" />,
    text: 'FAQ',
    position: 'bottom-[22%] left-[20%] translate-y-1/2'
  },
  {
    id: 'benefits',
    icon: <Heart className="w-8 h-8 text-pink-600 stroke-[4]" />,
    text: 'Benefitnya apa aja nih?',
    position: 'top-1/2 left-[15%] -translate-y-1/2'
  },
  {
    id: 'unit-tour',
    icon: <Building className="w-8 h-8 text-indigo-600 stroke-[4]" />,
    text: 'Unit & Tour',
    position: 'top-[22%] left-[20%] -translate-y-1/2'
  }
];

export const InteractiveHub = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ id: string; title: string } | null>(null);

  const handleItemClick = (id: string, text: string) => {
    setSelectedSection({ id, title: text });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSection(null);
  };
  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-[4/3] bg-background">


      {/* Central Jakhabitat Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center">
          <img
            src={`${import.meta.env.BASE_URL}JAKHABITAT-LOGO-01.png`}
            alt="Jakhabitat Logo"
            className="w-48 h-48 object-contain"
            loading="eager"
            decoding="async"
          />

        </div>
      </div>

      {/* Connecting Lines with Arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 750">
        <defs>
          <marker id="arrowhead" markerWidth="12" markerHeight="8" 
            refX="11" refY="4" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 12 4, 0 8" fill="#3b82f6" />
          </marker>
          <style>
            {`
              .electric-flow {
                stroke-dasharray: 8 4;
                animation: flow 2s linear infinite;
              }
              @keyframes flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: 24; }
              }
            `}
          </style>
        </defs>
        
        {/* Lines from logo edge toward hub items with arrows */}
        <line x1="500" y1="285" x2="500" y2="150" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="564" y1="318" x2="680" y2="210" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="596" y1="375" x2="750" y2="375" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="564" y1="432" x2="680" y2="540" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="465" x2="500" y2="600" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="436" y1="432" x2="320" y2="540" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="404" y1="375" x2="250" y2="375" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
        <line x1="436" y1="318" x2="320" y2="210" stroke="#3b82f6" strokeWidth="2" 
          className="electric-flow" markerEnd="url(#arrowhead)" />
      </svg>

      {/* Hub Items */}
      {hubItems.map((item) => (
        <div
          key={item.id}
          className={`absolute ${item.position} cursor-pointer group hover:scale-110 transition-transform duration-200`}
          onClick={() => handleItemClick(item.id, item.text)}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 flex items-center justify-center transition-transform duration-200">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-center max-w-32 text-foreground leading-tight">
              {item.text}
            </span>
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedSection && (
        <ContentModal
          isOpen={modalOpen}
          onClose={closeModal}
          sectionId={selectedSection.id}
          title={selectedSection.title}
        />
      )}
    </div>
  );
};