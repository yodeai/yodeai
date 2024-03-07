import { IconType } from '@react-icons/all-files/lib';

export const SharedSubspace: IconType = ({ color, ...props }) => {
    return <svg width={props.size} height={props.size} viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M2 12V35.5L3.33333 36L20.6667 42.5L22 43V19.5L2 12Z" fill={color || ""} />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M21.2978 0.127342C21.7505 -0.0424472 22.2495 -0.0424472 22.7022 0.127342L42.7022 7.62734C43.4829 7.92007 44 8.66631 44 9.5V35.5C44 36.3337 43.4829 37.0799 42.7022 37.3727L22.7022 44.8727C22.2495 45.0424 21.7505 45.0424 21.2978 44.8727L1.29775 37.3727C0.517146 37.0799 0 36.3337 0 35.5V9.5C0 8.66631 0.517146 7.92007 1.29775 7.62734L21.2978 0.127342ZM4 14.886V34.114L20 40.114V20.886L4 14.886ZM24 20.886V40.114L40 34.114V14.886L24 20.886ZM39.6373 10.75L22 4.136L4.36267 10.75L22 17.364L39.6373 10.75Z" fill={color} />
        <path d="M22 4.136L39.6373 10.75L22 17.364L4.36267 10.75L22 4.136Z" fill="white" />
        <path d="M24 40.114V20.886L40 14.886V34.114L24 40.114Z" fill="white" />
        <path d="M3.83755 35.0368L19.0538 40.7429C19.0538 35.7723 17.666 30.7278 11.9033 28.999C7.90333 27.799 3.83755 30.0662 3.83755 35.0368Z" fill="white" />
        <path d="M15.9033 23.6786C15.9033 25.8877 14.1125 27.6786 11.9033 27.6786C9.69419 27.6786 7.90333 25.8877 7.90333 23.6786C7.90333 21.4694 9.69419 19.6786 11.9033 19.6786C14.1125 19.6786 15.9033 21.4694 15.9033 23.6786Z" fill="white" />
        <path d="M39.9353 34.8734L23.8226 40.9156C23.8226 35.9451 25.6709 30.7278 31.4336 28.999C35.4336 27.799 39.9353 29.9028 39.9353 34.8734Z" fill={color || ""} />
        <path d="M28.1923 24.2856C28.1923 26.4948 29.9832 28.2856 32.1923 28.2856C34.4015 28.2856 36.1923 26.4948 36.1923 24.2856C36.1923 22.0765 34.4015 20.2856 32.1923 20.2856C29.9832 20.2856 28.1923 22.0765 28.1923 24.2856Z" fill={color} />
    </svg>
}