import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface OrderIconProps {
    color?: string;
    size?: number;
}

export const OrderIcon: React.FC<OrderIconProps> = ({
    color = '#7F8C8D',
    size = 24
}) => (
    <Svg width={size} height={size} viewBox="0 0 21 22" fill="none">
        <Path
            d="M1.74828 2.41486H3.26938C4.21351 2.41486 4.95657 3.22786 4.87789 4.16324L4.15231 12.8702C4.02992 14.2951 5.15762 15.519 6.5913 15.519H15.9015C17.1603 15.519 18.2618 14.4875 18.358 13.2374L18.83 6.68092C18.9349 5.22976 17.8334 4.0496 16.3735 4.0496H5.0877"
            stroke={color}
            strokeWidth="1.31129"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M14.2055 19.8987C14.8091 19.8987 15.2983 19.4095 15.2983 18.806C15.2983 18.2025 14.8091 17.7133 14.2055 17.7133C13.602 17.7133 13.1128 18.2025 13.1128 18.806C13.1128 19.4095 13.602 19.8987 14.2055 19.8987Z"
            stroke={color}
            strokeWidth="1.31129"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M7.21199 19.8987C7.8155 19.8987 8.30473 19.4095 8.30473 18.806C8.30473 18.2025 7.8155 17.7133 7.21199 17.7133C6.60848 17.7133 6.11925 18.2025 6.11925 18.806C6.11925 19.4095 6.60848 19.8987 7.21199 19.8987Z"
            stroke={color}
            strokeWidth="1.31129"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M7.86765 7.66003H18.358"
            stroke={color}
            strokeWidth="1.31129"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);
