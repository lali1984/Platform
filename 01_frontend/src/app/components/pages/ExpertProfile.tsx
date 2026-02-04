import {  Mail, Calendar, Shield, Star, Users, Clock, DollarSign, TrendingUp, Award, CheckCircle, Video, BookOpen, Camera } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface UserData {
  login: string;
  email: string;
}

interface ExpertProfileProps {
  userData: UserData;
}

export default function ExpertProfile({ userData }: ExpertProfileProps) {
  const { t } = useLanguage();

  // Mock data for expert
  const expertData = {
    title: 'Senior Architect',
    specialization: t('technicalMentor'),
    verified: true,
    location: t('saintPetersburg'),
    expertSince: '2 года',
    totalSessions: 248,
    averageRating: 4.8,
    graduates: 37,
    sessionsToday: 2,
    queueSize: 5,
    monthlyTotal: 45,
    balance: '$12,450',
    monthlyEarnings: '$3,200',
  };

  const expertise = [
    { area: t('architecture'), rating: 5 },
    { area: 'Node.js', rating: 5 },
    { area: 'DevOps', rating: 4 },
    { area: 'React', rating: 5 },
  ];

  const upcomingSessions = [
    { time: '14:00', type: t('consultation'), client: 'Иван Петров' },
    { time: '16:00', type: t('webinar'), client: t('groupSession') },
  ];

  const mentees = [
    { id: 1, name: 'Анна Иванова', progress: 85, status: 'active' },
    { id: 2, name: 'Петр Сидоров', progress: 60, status: 'active' },
    { id: 3, name: 'Мария Петрова', progress: 40, status: 'pending' },
  ];

  const reviews = [
    { id: 1, author: 'Иван И.', rating: 5, text: t('expertReview1'), date: '2 дня назад' },
    { id: 2, author: 'Анна К.', rating: 5, text: t('expertReview2'), date: '5 дней назад' },
  ];

  const content = [
    { id: 1, title: t('advancedFeatures'), type: t('course'), views: 1240 },
    { id: 2, title: 'Архитектура микросервисов', type: t('article'), views: 856 },
    { id: 3, title: 'AMA сессия по DevOps', type: t('webinar'), views: 423 },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Expert Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar with Expert Badge */}
            <div className="relative">
              <div className="size-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                {userData.login.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 size-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                <Camera className="size-4" />
              </button>
              <div className="absolute -top-1 -right-1 size-7 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Shield className="size-4" />
              </div>
            </div>

            {/* Expert Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {userData.login}
                </h1>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded flex items-center gap-1">
                  <CheckCircle className="size-3" />
                  {t('verifiedExpert')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {expertData.title} | {expertData.specialization}
              </p>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                <Mail className="size-4" />
                {userData.email}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{expertData.location}</span>
                <span>•</span>
                <span>{t('expertFor')} {expertData.expertSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('sessionsCompleted')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expertData.totalSessions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="size-5 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('averageRating')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expertData.averageRating}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('graduates')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expertData.graduates}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('thisMonth')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{expertData.monthlyTotal}</p>
          </div>
        </div>

        {/* Today's Schedule & Queue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="size-5" />
              {t('todaySchedule')}
            </h2>
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{session.time} - {session.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{session.client}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                    {t('start')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Users className="size-5" />
              {t('mentorshipQueue')}
            </h2>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{expertData.queueSize}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('requestsWaiting')}</p>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
              {t('reviewRequests')}
            </button>
          </div>
        </div>

        {/* Expertise Matrix */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="size-5" />
            {t('areasOfExpertise')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertise.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <span className="text-gray-900 dark:text-gray-100">{item.area}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Mentees */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="size-5" />
            {t('currentMentees')}
          </h2>
          <div className="space-y-3">
            {mentees.map((mentee) => (
              <div key={mentee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{mentee.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-xs">
                      <div
                        className="h-2 bg-green-500 dark:bg-green-400 rounded-full"
                        style={{ width: `${mentee.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{mentee.progress}%</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  mentee.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                }`}>
                  {mentee.status === 'active' ? t('active') : t('pending')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Created Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="size-5" />
            {t('createdContent')}
          </h2>
          <div className="space-y-3">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex items-center gap-3">
                  <Video className="size-5 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.type} • {item.views} {t('views')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews & Ratings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Star className="size-5" />
            {t('reviewsAndRatings')}
          </h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{review.author}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{review.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{review.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <DollarSign className="size-5" />
            {t('earningsStats')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('totalBalance')}</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{expertData.balance}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('thisMonthEarnings')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{expertData.monthlyEarnings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
