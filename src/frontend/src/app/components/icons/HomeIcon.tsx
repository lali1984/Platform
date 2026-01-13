interface HomeIconProps {
  className?: string;
}

export function HomeIcon({ className = "size-5" }: HomeIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon 
        points="17 11 17 21 14 21 14 15 10 15 10 21 5 21 5 9 10 4 17 11" 
        fill="currentColor"
        opacity="0.3"
      />
      <path 
        d="M9.7,21H5.83A.77.77,0,0,1,5,20.3V10m9.3,11h3.87a.77.77,0,0,0,.83-.7V10M12,3,3,12m9-9,9,9m-6.7,9V14.1H9.7V21" 
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
