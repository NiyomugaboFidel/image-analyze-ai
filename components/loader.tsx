"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface LoaderProps {
  showProgress?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ showProgress = true }) => {
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + Math.random() * 10 : 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
        <Card className="py-6 px-8 flex flex justify-center items-center gap-4 w-full max-w-sm shadow-lg rounded-2xl">
      <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: "50%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "linear", duration: 0.5 }}
        />
      </div>
    </Card>

  );
};

export default Loader;
