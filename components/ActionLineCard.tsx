
import React from 'react';
import { ValueItem } from '../types';
import { useI18n } from '../i18n';
import Editable from './Editable';
import EditableImage from './EditableImage';

import SustainabilityIcon from './icons/SustainabilityIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import LeafIcon from './icons/LeafIcon';
import MegaphoneIcon from './icons/MegaphoneIcon';

const iconComponents: { [key: string]: React.FC<{ className?: string }> } = {
    BookOpenIcon,
    LeafIcon,
    SustainabilityIcon,
    MegaphoneIcon,
};

interface ActionLineCardProps {
  item: ValueItem;
  basePath: string;
}

const ActionLineCard: React.FC<ActionLineCardProps> = ({ item, basePath }) => {
  const { language } = useI18n();
  const IconComponent = item.icon ? iconComponents[item.icon] : null;

  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Image positioned above the card */}
      <div className="absolute -top-24 w-48 h-48">
        <EditableImage
          src={item.imageUrl || ''}
          alt={item.title[language]}
          basePath={`${basePath}.imageUrl`}
          className="rounded-full shadow-lg w-full h-full object-cover border-8 border-brand-green-light"
        />
      </div>

      {/* Card content */}
      <div className="bg-white rounded-lg shadow-xl p-6 pt-28 w-full h-full flex flex-col">
        <Editable localizedText={item.title} basePath={`${basePath}.title`}>
            <h3 className="text-xl font-bold text-brand-green-dark mb-2">{item.title[language]}</h3>
        </Editable>
        <Editable localizedText={item.slogan || {en: '', es: ''}} basePath={`${basePath}.slogan`}>
            <p className="text-brand-gray italic text-sm mb-3 font-semibold">"{item.slogan?.[language]}"</p>
        </Editable>
        <Editable localizedText={item.text} basePath={`${basePath}.text`} multiline>
            <p className="text-brand-gray text-sm flex-grow">{item.text[language]}</p>
        </Editable>
      </div>
    </div>
  );
};

export default ActionLineCard;
