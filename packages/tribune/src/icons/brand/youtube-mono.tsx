import type { IconProps } from "../icon-props";

// Brand mark, fixed grey badge. Source: src/icons/raw/brand/youtube-mono.svg
export function YoutubeMonoMark({ size = 40, className, ...props }: IconProps) {
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
      <path
        d="M35.2478 9.27893C34.8338 7.71999 33.614 6.49225 32.0649 6.07559C29.2577 5.31836 18 5.31836 18 5.31836C18 5.31836 6.7425 5.31836 3.93511 6.07559C2.38598 6.49225 1.16591 7.71999 0.752167 9.27893C0 12.1046 0 18.0003 0 18.0003C0 18.0003 0 23.8956 0.752167 26.7216C1.16591 28.2807 2.38598 29.5081 3.93495 29.9252C6.74235 30.6822 17.9998 30.6822 17.9998 30.6822C17.9998 30.6822 29.2575 30.6822 32.0647 29.9252C33.6139 29.5083 34.8336 28.2807 35.2477 26.7218C36 23.8958 36 18.0004 36 18.0004C36 18.0004 36 12.1047 35.2477 9.27909"
        fill="#686868"
      />
      <path
        d="M14.3184 23.353L23.7274 18.0005L14.3184 12.6475V23.353Z"
        fill="white"
      />
    </svg>
  );
}
