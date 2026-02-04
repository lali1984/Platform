// Добавить импорты
import { useState, useEffect } from 'react'; // Добавляем useEffect
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const { t } = useLanguage();
  const { register } = useAuth();
  
  // Состояния для всех полей
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Состояние для подсказок о пароле
  const [passwordSuggestions, setPasswordSuggestions] = useState<{
    length: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  }>({
    length: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Состояние для проверки имени пользователя
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);

  // Эффект для предотвращения скролла body при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Функция для проверки пароля на лету (только подсказки)
  const checkPasswordSuggestions = (pwd: string) => {
    setPasswordSuggestions({
      length: pwd.length >= 8,
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    });
  };

  // Функция проверки валидности пароля
  const isPasswordValid = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      hasLowercase: /[a-z]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
    return Object.values(checks).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordSuggestions(newPassword);
  };

  // Проверка имени пользователя на корректность
  const checkUsername = (value: string) => {
    const isValid = value.length === 0 || /^[a-zA-Z0-9_]{3,30}$/.test(value);
    setUsernameValid(isValid);
    return isValid;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Базовая валидация на фронте
    if (password !== confirmPassword) {
      const errorMsg = t('passwordMismatch') || 'Passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Проверка имени пользователя
    if (username && !checkUsername(username)) {
      const errorMsg = t('usernameInvalid') || 'Username can only contain letters, numbers and underscores (3-30 characters)';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Проверка пароля по требованиям backend
    if (!isPasswordValid(password)) {
      const errorMsg = t('passwordInvalid') || 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      await register({ 
        username: username || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email, 
        password
      });
      toast.success(t('registerSuccess') || 'Registration successful!');
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || t('registerError') || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Подсчет выполненных рекомендаций пароля
  const completedSuggestions = Object.values(passwordSuggestions).filter(Boolean).length;
  const totalSuggestions = Object.keys(passwordSuggestions).length;
  const passwordStrength = (completedSuggestions / totalSuggestions) * 100;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
      aria-labelledby="modal-title"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-8" // Увеличено max-w-lg, добавлен my-8
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-250 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-6"> 
            <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t('register')}
      </h2>
            
          </div>

          <div className="max-h-[calc(120vh-300px)] overflow-y-auto"> {/* Контейнер с ограниченной высотой */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Username Field (необязательное) */}
                <div>
                  <label
                    htmlFor="register-username"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('usernameLabel') || 'Username'} <span className="text-gray-500 dark:text-gray-400">{t('optional') || '(optional)'}</span>
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                      usernameValid === false 
                        ? 'border-red-500 dark:border-red-500' 
                        : usernameValid === true && username.length > 0
                          ? 'border-green-500 dark:border-green-500'
                          : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={t('usernamePlaceholder') || 'johndoe (optional)'}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('usernameRequirements') || '3-30 characters, letters, numbers, underscores'}
                    </p>
                    {usernameValid !== null && username.length > 0 && (
                      <span className={`text-xs ${usernameValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {usernameValid ? '✓ Valid' : '✗ Invalid'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Имя и Фамилия в одной строке */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Добавлена адаптивность */}
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="register-firstname"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('firstNameLabel') || 'First Name'} <span className="text-gray-500 dark:text-gray-400">{t('optional') || '(optional)'}</span>
                    </label>
                    <input
                      id="register-firstname"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder={t('firstNamePlaceholder') || 'John (optional)'}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="register-lastname"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {t('lastNameLabel') || 'Last Name'} <span className="text-gray-500 dark:text-gray-400">{t('optional') || '(optional)'}</span>
                    </label>
                    <input
                      id="register-lastname"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder={t('lastNamePlaceholder') || 'Doe (optional)'}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('emailLabel') || 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('emailPlaceholder') || 'your@email.com'}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password Field с подсказками */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('passwordLabel') || 'Password'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('passwordPlaceholder') || 'Enter password'}
                    required
                    disabled={isLoading}
                  />
                  
                  {/* Индикатор надежности пароля */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            completedSuggestions <= 1 ? 'bg-red-500' :
                            completedSuggestions <= 2 ? 'bg-orange-500' :
                            completedSuggestions <= 3 ? 'bg-yellow-500' :
                            completedSuggestions === 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {t('passwordRecommendations') || 'Password requirements:'}
                        </p>
                        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <li className={`flex items-center ${passwordSuggestions.length ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {passwordSuggestions.length ? '✓' : '○'} 
                            <span className="ml-2">At least 8 characters</span>
                          </li>
                          <li className={`flex items-center ${passwordSuggestions.hasLowercase ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {passwordSuggestions.hasLowercase ? '✓' : '○'} 
                            <span className="ml-2">One lowercase letter</span>
                          </li>
                          <li className={`flex items-center ${passwordSuggestions.hasUppercase ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {passwordSuggestions.hasUppercase ? '✓' : '○'} 
                            <span className="ml-2">One uppercase letter</span>
                          </li>
                          <li className={`flex items-center ${passwordSuggestions.hasNumber ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {passwordSuggestions.hasNumber ? '✓' : '○'} 
                            <span className="ml-2">One number</span>
                          </li>
                          <li className={`flex items-center ${passwordSuggestions.hasSpecial ? 'text-green-600 dark:text-green-400' : ''}`}>
                            {passwordSuggestions.hasSpecial ? '✓' : '○'} 
                            <span className="ml-2">One special character (!@#$% etc.)</span>
                          </li>
                        </ul>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                          {t('passwordManagerSuggestion') || 'Consider using a password manager for strong, unique passwords.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t('confirmPasswordLabel') || 'Confirm Password'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('confirmPasswordPlaceholder') || 'Confirm your password'}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Отображение ошибки */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      required
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      disabled={isLoading}
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                    {t('agreeToTerms') || 'I agree to the Terms and Conditions'}
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('loading') || 'Loading...'}
                    </>
                  ) : (
                    t('registerButton') || 'Register'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}