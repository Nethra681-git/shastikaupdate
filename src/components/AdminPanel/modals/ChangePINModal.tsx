import { useState, useRef, useEffect } from 'react';
import { Lock, X, Check } from 'lucide-react';

interface ChangePINModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPIN: string;
  onPINChanged: (newPIN: string) => void;
}

export default function ChangePINModal({
  isOpen,
  onClose,
  currentPIN,
  onPINChanged,
}: ChangePINModalProps) {
  const [step, setStep] = useState<'verify' | 'new' | 'confirm'>('verify');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
      setSuccess('');
      setStep('verify');
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleInputChange = (
    index: number,
    value: string,
    field: 'current' | 'new' | 'confirm'
  ) => {
    if (value && isNaN(Number(value))) return;

    let currentField = '';
    let setCurrentField;

    if (field === 'current') {
      currentField = pin;
      setCurrentField = setPin;
    } else if (field === 'new') {
      currentField = newPin;
      setCurrentField = setNewPin;
    } else {
      currentField = confirmPin;
      setCurrentField = setConfirmPin;
    }

    const newPinArray = currentField.split('');
    newPinArray[index] = value;
    const pinString = newPinArray.join('');
    setCurrentField(pinString);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (pinString.length === 4) {
      if (field === 'current') {
        handleVerifyCurrentPIN(pinString);
      } else if (field === 'confirm') {
        handleConfirmNewPIN(pinString);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentField = step === 'verify' ? pin : step === 'new' ? newPin : confirmPin;
      if (!currentField[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyCurrentPIN = async (pinCode: string) => {
    setIsLoading(true);
    try {
      const savedPIN = localStorage.getItem('adminPIN') || '1234';
      if (pinCode === savedPIN) {
        setSuccess('Current PIN verified!');
        setTimeout(() => {
          setStep('new');
          setPin('');
          setSuccess('');
          inputRefs.current[0]?.focus();
        }, 500);
      } else {
        setError('Incorrect current PIN.');
        setPin('');
        inputRefs.current[0]?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmNewPIN = async (confirmCode: string) => {
    if (newPin !== confirmCode) {
      setError('PINs do not match.');
      setConfirmPin('');
      inputRefs.current[0]?.focus();
      return;
    }

    setIsLoading(true);
    try {
      // In production, send to backend
      localStorage.setItem('adminPIN', newPin);
      setSuccess('PIN changed successfully!');
      setTimeout(() => {
        onPINChanged(newPin);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (pin.length === 4) {
      handleVerifyCurrentPIN(pin);
    }
  };

  const handleSetNewPIN = async () => {
    if (newPin.length < 4) {
      setError('Please enter a 4-digit PIN.');
      return;
    }
    setStep('confirm');
    inputRefs.current[0]?.focus();
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
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-white">Change Security PIN</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2">
          {['verify', 'new', 'confirm'].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                step === s ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {step === 'verify' && (
            <>
              <p className="text-slate-400 text-sm">
                Enter your current PIN to proceed.
              </p>
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
                    onChange={(e) => handleInputChange(index, e.target.value, 'current')}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </>
          )}

          {step === 'new' && (
            <>
              <p className="text-slate-400 text-sm">
                Enter your new 4-digit PIN.
              </p>
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
                    value={newPin[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value, 'new')}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <p className="text-slate-400 text-sm">
                Confirm your new PIN.
              </p>
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
                    value={confirmPin[index] || ''}
                    onChange={(e) => handleInputChange(index, e.target.value, 'confirm')}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-2xl font-bold bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                  />
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={
              step === 'verify'
                ? handleManualVerify
                : step === 'new'
                  ? handleSetNewPIN
                  : () => handleConfirmNewPIN(confirmPin)
            }
            disabled={
              isLoading ||
              (step === 'verify' && pin.length !== 4) ||
              (step === 'new' && newPin.length !== 4) ||
              (step === 'confirm' && confirmPin.length !== 4)
            }
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {step === 'verify' ? 'Verifying...' : step === 'new' ? 'Processing...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {step === 'verify' ? 'Verify' : step === 'new' ? 'Next' : 'Confirm'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
