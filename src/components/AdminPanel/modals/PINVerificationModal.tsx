import { useState, useRef, useEffect } from 'react';
import { Lock, X, Check } from 'lucide-react';

interface PINVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export default function PINVerificationModal({
  isOpen,
  onClose,
  onSuccess,
}: PINVerificationModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    if (value && isNaN(Number(value))) return;

    const newPin = pin.split('');
    newPin[index] = value;
    const pinString = newPin.join('');
    setPin(pinString);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (pinString.length === 4) {
      handleVerifyPIN(pinString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyPIN = async (pinCode: string) => {
    setIsVerifying(true);
    try {
      // In production, verify against backend or stored hash
      const savedPIN = localStorage.getItem('adminPIN') || '1234';
      
      if (pinCode === savedPIN) {
        onSuccess(pinCode);
      } else {
        setError('Invalid PIN. Please try again.');
        setPin('');
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold text-white">Verify PIN</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-slate-400">
          Enter your 4-digit security PIN to perform sensitive actions.
        </p>

        {/* PIN Input */}
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={pin[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isVerifying}
                className="w-12 h-12 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerifyPIN(pin)}
            disabled={pin.length !== 4 || isVerifying}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Verify
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500 text-center">
          Default PIN: 1234 (Change in Settings)
        </p>
      </div>
    </div>
  );
}
