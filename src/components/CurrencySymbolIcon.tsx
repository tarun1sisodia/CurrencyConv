import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import Dollar01Icon from '@hugeicons/core-free-icons/Dollar01Icon';
import EuroIcon from '@hugeicons/core-free-icons/EuroIcon';
import PoundIcon from '@hugeicons/core-free-icons/PoundIcon';
import YenIcon from '@hugeicons/core-free-icons/YenIcon';
import RupeeIcon from '@hugeicons/core-free-icons/RupeeIcon';
import BitcoinIcon from '@hugeicons/core-free-icons/BitcoinIcon';
import Coins01Icon from '@hugeicons/core-free-icons/Coins01Icon';
import Money03Icon from '@hugeicons/core-free-icons/Money03Icon';

interface CurrencyIconProps {
  code: string;
  className?: string;
  size?: number;
}

export const CurrencySymbolIcon: React.FC<CurrencyIconProps> = ({
  code,
  className = 'h-4 w-4',
  size = 18,
}) => {
  const upper = code.toUpperCase();

  const getIcon = () => {
    switch (upper) {
      case 'USD':
      case 'CAD':
      case 'AUD':
      case 'NZD':
      case 'SGD':
      case 'HKD':
      case 'MXN':
      case 'ARS':
      case 'CLP':
      case 'COP':
        return Dollar01Icon;
      case 'EUR':
        return EuroIcon;
      case 'GBP':
      case 'EGP':
      case 'GIP':
      case 'FKP':
        return PoundIcon;
      case 'JPY':
      case 'CNY':
        return YenIcon;
      case 'INR':
      case 'PKR':
      case 'LKR':
      case 'NPR':
        return RupeeIcon;
      case 'BTC':
        return BitcoinIcon;
      case 'CHF':
      case 'SEK':
      case 'NOK':
      case 'DKK':
      case 'PLN':
      case 'CZK':
      case 'HUF':
      case 'TRY':
      case 'BRL':
      case 'ZAR':
      case 'AED':
      case 'SAR':
      case 'KRW':
      case 'THB':
      case 'IDR':
      case 'MYR':
      case 'PHP':
      case 'VND':
        return Coins01Icon;
      default:
        return Money03Icon;
    }
  };

  return <HugeiconsIcon icon={getIcon()} className={className} size={size} />;
};
