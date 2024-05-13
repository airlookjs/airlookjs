// TODO: use css-var for color and change with dark mode
export const cssBackgroundGuides = (
	duration: number,
	millis = 2000,
	{ lineWidth = 0.5, color = '#9993' } : { lineWidth?: number; color?: string } = {}
) : string => {
	const divisions = duration / millis;
	const divisionsPercent = 100 / divisions;
	return `background-image: 
      	  linear-gradient(90deg, ${color} ${lineWidth}px, transparent ${lineWidth}px, transparent calc(100% - ${lineWidth}px), ${color} calc(100% - ${lineWidth}px));
        background-size: ${divisionsPercent}% 100%;`;
};
