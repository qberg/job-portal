import type { IconProps } from "../icon-props";

// Brand mark, fixed grey badge. Source: src/icons/raw/brand/x-mono.svg
export function XMonoMark({ size = 40, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 36 36"
      width={size}
      {...props}
    >
      <rect fill="#686868" height="36" rx="7.2" width="36" />
      <path
        clipRule="evenodd"
        d="M8.46539 7.58105C8.22179 7.67172 8.01625 7.85206 7.89629 8.09268C7.72002 8.44622 7.75887 8.86906 7.99662 9.18457L15.7956 19.5342L7.57747 28.3469C7.55593 28.3701 7.53565 28.3939 7.5166 28.4183H10.3601L17.069 21.2239L22.2273 28.0694C22.3483 28.2298 22.5111 28.3497 22.6946 28.4183H28.8379C29.0807 28.3275 29.2857 28.1475 29.4053 27.9073C29.5816 27.5537 29.5429 27.1309 29.305 26.8154L21.506 16.4658L29.7911 7.58105H26.9419L20.2326 14.7759L15.0743 7.93054C14.953 7.76963 14.7896 7.64955 14.6054 7.58105H8.46539ZM10.9183 9.59941L23.5789 26.4006H26.3834L13.7227 9.59941H10.9183Z"
        fill="#FEFFFE"
        fillRule="evenodd"
      />
    </svg>
  );
}
