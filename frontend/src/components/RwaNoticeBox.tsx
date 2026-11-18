import React, { useState } from 'react';

/**
 * Props for RwaNoticeBox component.
 */
interface RwaNoticeBoxProps {
  /** Formatted WhatsApp text content */
  noticeText: string;
}

/**
 * RwaNoticeBox provides a pre-formatted community notice with one-click
 * clipboard copy functionality and live accessible feedback.
 */
export const RwaNoticeBox: React.FC<RwaNoticeBoxProps> = ({ noticeText }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(noticeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err: unknown) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <section aria-label="RWA Community WhatsApp Notice" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <span>RWA / Apartment Community Notice Box</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              WhatsApp Ready
            </span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Copy-paste formatted clean-air notices into apartment tower and society WhatsApp groups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyWhatsApp}
          aria-pressed={copied}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
            copied
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
          }`}
          aria-label="Copy for WhatsApp"
        >
          {copied ? (
            <>
              <span aria-hidden="true">✓</span>
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">📋</span>
              <span>Copy for WhatsApp</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4">
        <label htmlFor="whatsapp-notice-preview" className="sr-only">
          WhatsApp Formatted Community Notice
        </label>
        <textarea
          id="whatsapp-notice-preview"
          readOnly
          value={noticeText}
          rows={8}
          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed focus-visible:outline-none resize-none shadow-inner"
          aria-label="Pre-formatted WhatsApp Notice Content"
        />
      </div>
    </section>
  );
};
