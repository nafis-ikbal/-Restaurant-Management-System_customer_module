"use client";
/* eslint-disable @next/next/no-img-element -- menu image URLs are stored in the database and may be external. */
import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

export default function MenuImage({ src, alt = "", className = "" }) {
  const imageRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (image && image.complete && image.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-[#e5e8ee] ${className}`}>
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-[#e5e8ee]" aria-hidden="true" />
      )}
      {!failed && (
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-out ${loaded ? "opacity-100 duration-500" : "opacity-0"}`}
        />
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center text-[#cfc7c2]" aria-hidden="true">
          <ImageOff size={28} strokeWidth={1.6} />
        </div>
      )}
    </div>
  );
}