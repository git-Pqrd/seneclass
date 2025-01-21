import React from "react";

interface LoaderBarProps {
  loading: boolean;
}

const LoaderBar: React.FC<LoaderBarProps> = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="relative rounded-md h-2 overflow-hidden w-full">
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 z-50">
        <div className="h-full bg-blue-500 animate-loading" />
      </div>
    </div>
  );
};
export default LoaderBar;
