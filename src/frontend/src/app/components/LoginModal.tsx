// Добавить импорты
import { X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // ← ДОБАВИТЬ
import { toast } from 'sonner'; // ← ДОБАВИТЬ (если нет sonner, можно использовать alert)

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useLanguage();
  const { login } = useAuth(); // ← ДОБАВИТЬ
  const [email, setEmail] = useState(''); // ← ИЗМЕНИТЬ login на email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ← ДОБАВИТЬ
  const [error, setError] = useState(''); // ← ДОБАВИТЬ

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => { // ← СДЕЛАТЬ async
    e.preventDefault();
    setError(''); // ← ДОБАВИТЬ
    setIsLoading(true); // ← ДОБАВИТЬ

    try {
      await login(email, password); // ← ДОБАВИТЬ вызов auth API
      toast.success(t('loginSuccess') || 'Login successful!'); // ← ДОБАВИТЬ уведомление
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || t('loginError') || 'Login failed';
      setError(errorMessage); // ← ДОБАВИТЬ отображение ошибки
      toast.error(errorMessage); // ← ДОБАВИТЬ уведомление об ошибке
    } finally {
      setIsLoading(false); // ← ДОБАВИТЬ
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('login')}
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading} // ← ДОБАВИТЬ disabled при загрузке
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              <X className="size-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Поле Email (бывшее Login) */}
              <div>
                <label
                  htmlFor="email" // ← ИЗМЕНИТЬ id
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('emailLabel') || 'Email'} {/* ← ИЗМЕНИТЬ текст */}
                </label>
                <input
                  id="email" // ← ИЗМЕНИТЬ id
                  type="email" // ← ИЗМЕНИТЬ type
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('emailPlaceholder') || 'your@email.com'} // ← ИЗМЕНИТЬ
                  required
                  disabled={isLoading} // ← ДОБАВИТЬ disabled
                />
              </div>

              {/* Поле Password (оставить как есть) */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {t('passwordLabel')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={isLoading} // ← ДОБАВИТЬ disabled
                />
              </div>

              {/* Отображение ошибки - ДОБАВИТЬ БЛОК */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  disabled={isLoading} // ← ДОБАВИТЬ disabled
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading} // ← ДОБАВИТЬ disabled
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading} // ← ДОБАВИТЬ disabled
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? ( // ← ДОБАВИТЬ индикатор загрузки
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loading') || 'Loading...'}
                  </>
                ) : (
                  t('loginButton')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}