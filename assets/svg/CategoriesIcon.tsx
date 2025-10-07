import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CategoriesIconProps {
    color?: string;
    size?: number;
}

export const CategoriesIcon: React.FC<CategoriesIconProps> = ({
    color = '#7F8C8D',
    size = 24
}) => (
    <Svg width={size} height={size} viewBox="0 0 19 19" fill="none">
        <Path 
            opacity="0.4" 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12.5106 2.14111H15.0069C16.0397 2.14111 16.8776 2.98623 16.8776 4.02881V6.546C16.8776 7.58778 16.0397 8.43369 15.0069 8.43369H12.5106C11.477 8.43369 10.6392 7.58778 10.6392 6.546V4.02881C10.6392 2.98623 11.477 2.14111 12.5106 2.14111Z" 
            stroke={color} 
            strokeWidth="0.917031" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M3.4652 2.14111H5.96072C6.99432 2.14111 7.83217 2.98623 7.83217 4.02881V6.546C7.83217 7.58778 6.99432 8.43369 5.96072 8.43369H3.4652C2.43159 8.43369 1.59375 7.58778 1.59375 6.546V4.02881C1.59375 2.98623 2.43159 2.14111 3.4652 2.14111Z" 
            stroke={color} 
            strokeWidth="0.917031" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M3.4652 11.1323H5.96072C6.99432 11.1323 7.83217 11.9774 7.83217 13.0208V15.5372C7.83217 16.5798 6.99432 17.4249 5.96072 17.4249H3.4652C2.43159 17.4249 1.59375 16.5798 1.59375 15.5372V13.0208C1.59375 11.9774 2.43159 11.1323 3.4652 11.1323Z" 
            stroke={color} 
            strokeWidth="0.917031" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
        <Path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M12.5106 11.1323H15.0069C16.0397 11.1323 16.8776 11.9774 16.8776 13.0208V15.5372C16.8776 16.5798 16.0397 17.4249 15.0069 17.4249H12.5106C11.477 17.4249 10.6392 16.5798 10.6392 15.5372V13.0208C10.6392 11.9774 11.477 11.1323 12.5106 11.1323Z" 
            stroke={color} 
            strokeWidth="0.917031" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        />
    </Svg>
);