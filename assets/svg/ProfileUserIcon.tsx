import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface ProfileUserIconProps {
    color?: string;
    size?: number;
}

export const ProfileUserIcon: React.FC<ProfileUserIconProps> = ({
    color = '#7F8C8D',
    size = 24
}) => (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
        <Circle 
            cx="11.7967" 
            cy="7.8533" 
            r="3.34207" 
            fill={color}
        />
        <Path 
            opacity="0.5" 
            d="M18.4806 17.2526C18.4806 19.3291 18.4806 21.0124 11.7964 21.0124C5.1123 21.0124 5.1123 19.3291 5.1123 17.2526C5.1123 15.1761 8.10489 13.4928 11.7964 13.4928C15.488 13.4928 18.4806 15.1761 18.4806 17.2526Z" 
            fill={color}
        />
        <Path 
            d="M16.8096 10.9417C16.8096 11.7642 17.7828 12.6333 18.5164 13.1716C18.8671 13.4289 19.0425 13.5576 19.3161 13.5576C19.5898 13.5576 19.7651 13.4289 20.1158 13.1716C20.8494 12.6333 21.8227 11.7642 21.8227 10.9417C21.8227 9.54368 20.444 9.02173 19.3161 10.1017C18.1882 9.02173 16.8096 9.54368 16.8096 10.9417Z" 
            fill={color}
        />
    </Svg>
);