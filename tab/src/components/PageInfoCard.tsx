import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '@/lib/i18n';

interface PageInfoCardProps {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  thumbnails?: string[];
  favicon?: string;
  onThumbnailChange?: (thumbnail: string) => void;
}

export function PageInfoCard({ title, url, description, thumbnail, thumbnails, favicon, onThumbnailChange }: PageInfoCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const availableThumbnails = thumbnails && thumbnails.length > 0 ? thumbnails : (thumbnail ? [thumbnail] : []);
  const currentThumbnail = availableThumbnails[currentIndex];
  const hasMultipleThumbnails = availableThumbnails.length > 1;

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : availableThumbnails.length - 1;
    setCurrentIndex(newIndex);
    setImageError(false);
    if (onThumbnailChange && availableThumbnails[newIndex]) {
      onThumbnailChange(availableThumbnails[newIndex]);
    }
  };

  const handleNext = () => {
    const newIndex = currentIndex < availableThumbnails.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setImageError(false);
    if (onThumbnailChange && availableThumbnails[newIndex]) {
      onThumbnailChange(availableThumbnails[newIndex]);
    }
  };

  return (
    <div className="bg-[color:var(--tab-surface)] border border-[color:var(--tab-border)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Thumbnail section */}
      {currentThumbnail && !imageError && (
        <div className="relative h-32 bg-[color:var(--tab-surface-muted)] group">
          <img
            src={currentThumbnail}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              setImageError(true);
              e.currentTarget.style.display = 'none';
            }}
          />
          
          {/* Navigation buttons */}
          {hasMultipleThumbnails && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--tab-overlay)] text-[var(--tab-message-info-icon-bg)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-90 active:scale-95"
                title={t('newtab_prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--tab-overlay)] text-[var(--tab-message-info-icon-bg)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:opacity-90 active:scale-95"
                title={t('newtab_next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-[color:var(--tab-overlay)] text-[var(--tab-message-info-icon-bg)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentIndex + 1} / {availableThumbnails.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content section */}
      <div className="p-4 space-y-3">
        {/* Title with favicon */}
        <div className="flex items-start gap-2">
          {favicon && (
            <img
              src={favicon}
              alt=""
              className="w-5 h-5 flex-shrink-0 mt-0.5 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <h3 className={`flex-1 text-base font-semibold text-[var(--tab-text)] line-clamp-2 ${thumbnail && !favicon ? 'text-center' : ''}`}>
            {title}
          </h3>
        </div>

        {/* URL */}
        <p className="text-sm text-[var(--tab-text-muted)] truncate" title={url}>
          {url}
        </p>

        {/* Description */}
        {description && (
          <p className="text-sm text-[var(--tab-text-muted)] line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
