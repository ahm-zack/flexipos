import { FC } from "react";

interface PlaceholderImageProps {
  text: string;
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

export const PlaceholderImage: FC<PlaceholderImageProps> = ({
  text,
  width = 300,
  height = 200,
  bgColor = "#e5e7eb",
  textColor = "#374151",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center border-2 border-dashed border-gray-300 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <span className="text-sm font-medium text-center px-2">{text}</span>
    </div>
  );
};
