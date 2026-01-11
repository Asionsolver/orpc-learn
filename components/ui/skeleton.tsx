import React from "react";

const Skeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div
        key={i}
        className="border rounded-lg p-3 bg-surface-primary animate-pulse"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-5 h-5 bg-border-primary rounded" />
            <div className="h-4 bg-border-primary rounded w-1/2" />
          </div>
          <div className="w-8 h-8 bg-border-primary rounded" />
        </div>
        <div className="flex justify-between border-t pt-2">
          <div className="h-2 bg-border-primary rounded w-20" />
          <div className="h-2 bg-border-primary rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
