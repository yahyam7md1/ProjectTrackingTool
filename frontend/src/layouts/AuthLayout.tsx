import React from "react";
import Silk from "../components/backgrounds/Silk";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Silk background with fixed positioning */}
      <div className="fixed inset-0 -z-10">
        <Silk color="#543870" speed={3} noiseIntensity={1.2} />
      </div>
      
      {/* Content centered with flex */}
      <div className="flex min-h-screen w-full items-center justify-center p-10">
          <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
