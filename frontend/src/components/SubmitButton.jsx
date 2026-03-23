import React from 'react';

export default function SubmitButton({ submitStatus }) {
    return (
        <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm py-4 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex justify-center items-center mt-2"
        >
            {submitStatus === 'submitting' ? (
                <span className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Bekleyiniz...</span>
                </span>
            ) : (
                <span>GÖNDER / SEND</span>
            )}
        </button>
    );
}
