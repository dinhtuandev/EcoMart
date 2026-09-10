import React, { useRef } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

/**
 * Component nhập mã OTP 6 chữ số chuyên nghiệp
 */
export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Tách giá trị chuỗi thành mảng các ký tự
  const digits = Array.from({ length }, (_, index) => value[index] || '');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const char = e.target.value.slice(-1);

    // Chỉ cho phép nhập số
    if (char && !/^\d$/.test(char)) {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('');
    onChange(newValue);

    // Tự động focus ô tiếp theo nếu vừa nhập một số
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Nếu ô hiện tại rỗng -> Xóa ô trước và focus lùi lại
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (disabled) {
      return;
    }

    const pastedData = e.clipboardData.getData('text');
    const numericChars = pastedData.replace(/\D/g, '').slice(0, length);

    if (!numericChars) {
      return;
    }

    onChange(numericChars);

    // Focus vào ô tiếp theo sau chuỗi dán hoặc ô cuối cùng
    const targetFocusIndex = Math.min(numericChars.length, length - 1);
    inputRefs.current[targetFocusIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          aria-label={`Ô thứ ${index + 1} của mã OTP`}
          className="w-10 h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-bold text-slate-800 bg-slate-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:bg-gray-100 transition-all"
        />
      ))}
    </div>
  );
};

export default OtpInput;
