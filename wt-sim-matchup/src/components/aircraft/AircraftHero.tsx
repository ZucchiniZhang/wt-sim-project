/**
 * AircraftHero - Large hero banner showing aircraft image with overlay info
 * Full-width cinematic display with gradient overlay, name, nation, and BR badge
 */

import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  cn,
  getAircraftDisplayName,
  getAircraftImageUrl,
  formatBR,
  getNationFlag,
  getNationName,
  getAircraftTypeIcon,
} from '../../lib/utils';
import { Badge } from '../ui/Badge';
import type { Aircraft } from '../../types/aircraft';

interface AircraftHeroProps {
  aircraft: Aircraft;
  className?: string;
}

export const AircraftHero = memo(function AircraftHero({
  aircraft,
  className,
}: AircraftHeroProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const displayName = getAircraftDisplayName(aircraft);
  const imageUrl = getAircraftImageUrl(aircraft.identifier);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'relative w-full aspect-[21/9] rounded-lg overflow-hidden',
        'bg-aviation-charcoal border border-aviation-border',
        className
      )}
    >
      {/* Loading skeleton */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-aviation-slate to-aviation-charcoal animate-pulse" />
      )}

      {/* Aircraft image */}
      {!imageError ? (
        <motion.img
          src={imageUrl}
          alt={displayName}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-aviation-charcoal/90">
          <div className="text-center text-aviation-text-muted">
            <div className="text-6xl mb-3 opacity-30">
              {getAircraftTypeIcon(aircraft.vehicle_type)}
            </div>
            <div className="text-sm font-mono uppercase tracking-widest opacity-40">
              Image Unavailable
            </div>
          </div>
        </div>
      )}

      {/* Bottom overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-aviation-charcoal via-aviation-charcoal/40 to-transparent" />

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="flex items-end justify-between gap-4"
        >
          {/* Left: Name and nation */}
          <div className="min-w-0 flex-1">
            <h1 className="font-header font-bold text-aviation-amber text-xl sm:text-2xl lg:text-3xl uppercase tracking-wider truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-lg sm:text-xl" aria-hidden="true">
                {getNationFlag(aircraft.country)}
              </span>
              <span className="text-sm sm:text-base text-aviation-text uppercase tracking-widest font-header">
                {getNationName(aircraft.country)}
              </span>
              {aircraft.is_premium && (
                <Badge variant="premium" className="ml-1">
                  Premium
                </Badge>
              )}
            </div>
          </div>

          {/* Right: BR badge */}
          <div className="flex-shrink-0">
            <Badge
              variant="br"
              className="text-sm sm:text-base px-3 py-1 font-mono"
            >
              BR {formatBR(aircraft.simulator_br)}
            </Badge>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});
