export default function SkeletonBlock({ className = "" }) {
  return <div className={`bg-[#e5e8ee] ${className}`} aria-hidden="true" />;
}