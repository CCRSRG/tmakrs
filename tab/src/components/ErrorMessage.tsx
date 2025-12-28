import { t } from '@/lib/i18n';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onDismiss, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-[color:var(--tab-message-danger-bg)] border border-[color:var(--tab-message-danger-border)] rounded-lg p-3 shadow-lg animate-in slide-in-from-top-5 fade-in duration-300 text-[var(--tab-message-danger-icon)]">
      <div className="flex items-start gap-3">
        <div className="bg-[color:var(--tab-message-danger-icon-bg)] rounded-full p-1.5 flex-shrink-0">
          <svg
            className="w-5 h-5 text-[var(--tab-message-danger-icon)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-[var(--tab-message-danger-icon)] hover:opacity-90 text-xs font-medium transition-colors"
            >
              {t('btn_retry')}
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="opacity-80 hover:opacity-100 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
