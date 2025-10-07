import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
    color?: string;
    size?: number;
}

export const HomeIcon: React.FC<HomeIconProps> = ({
    color = '#7F8C8D',
    size = 24
}) => (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
        <Path 
            opacity="0.5" 
            d="M4.61426 13.0368C4.61426 11.1248 4.61426 10.1687 5.04806 9.37623C5.48186 8.58371 6.27438 8.09185 7.85943 7.10812L9.53046 6.07103C11.206 5.03116 12.0437 4.51123 12.9694 4.51123C13.8951 4.51123 14.7329 5.03116 16.4084 6.07103L18.0794 7.10812C19.6645 8.09185 20.457 8.58371 20.8908 9.37623C21.3246 10.1687 21.3246 11.1248 21.3246 13.0368V14.3076C21.3246 17.5669 21.3246 19.1965 20.3457 20.209C19.3669 21.2216 17.7914 21.2216 14.6405 21.2216H11.2984C8.14746 21.2216 6.572 21.2216 5.59313 20.209C4.61426 19.1965 4.61426 17.5669 4.61426 14.3076V13.0368Z" 
            stroke={color} 
            strokeWidth="1.22271"
        />
        <Path 
            d="M15.4755 17.8793H10.4624" 
            stroke={color} 
            strokeWidth="1.22271" 
            strokeLinecap="round"
        />
    </Svg>
);