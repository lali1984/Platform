import { User, Mail, Calendar, MapPin, Phone, Briefcase, Edit2, Camera, BookOpen, Award, Users, GraduationCap, CheckCircle, Plus, Github } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface UserData {
  login: string;
  email: string;
}

interface UserProfileProps {
  userData: UserData;
}

export default function UserProfile({ userData }: UserProfileProps) {
  const { t } = useLanguage();

  // Mock data for educational progress
  const currentCourses = [
    { id: 1, title: t('platformBasics'), progress: 65, instructor: 'Анна Эксперт' },
    { id: 2, title: 'React для начинающих', progress: 40, instructor: 'Петр Сидоров' },
  ];

  const completedCourses = [
    { id: 1, title: 'Введение в программирование', completedDate: '15 декабря 2025', certificate: true },
    { id: 2, title: 'JavaScript основы', completedDate: '20 ноября 2025', certificate: true },
  ];

  const skills = [
    { name: 'React', verified: true },
    { name: 'JavaScript', verified: true },
    { name: 'TypeScript', verified: false },
    { name: 'Node.js', verified: false },
    { name: 'CSS', verified: true },
  ];

  const community = {
    followers: 12,
    following: 25,
    groups: 3,
  };

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="size-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                {userData.login.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 size-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                <Camera className="size-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {userData.login}
                </h1>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  {t('online')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-3">
                <Mail className="size-4" />
                {userData.email}
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors">
                <Edit2 className="size-4" />
                {t('editProfile')}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <User className="size-5" />
            {t('personalInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <Calendar className="size-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('registrationDate')}</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date().toLocaleDateString(t('language') === 'ru' ? 'ru-RU' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <MapPin className="size-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('location')}</p>
                <p className="text-gray-900 dark:text-gray-100">{t('notSpecified')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <Phone className="size-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('phone')}</p>
                <p className="text-gray-900 dark:text-gray-100">{t('notSpecified')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <Briefcase className="size-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('position')}</p>
                <p className="text-gray-900 dark:text-gray-100">{t('notSpecified')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <GraduationCap className="size-5" />
            {t('educationalProgress')}
          </h2>

          {/* Current Courses */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t('currentCourses')}
            </h3>
            {currentCourses.length > 0 ? (
              <div className="space-y-3">
                {currentCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{course.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-blue-500 dark:bg-blue-400 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">{t('noCourses')}</p>
            )}
          </div>

          {/* Completed Courses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t('completedCourses')} ({completedCourses.length})
            </h3>
            <div className="space-y-2">
              {completedCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="size-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{course.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.completedDate}</p>
                    </div>
                  </div>
                  {course.certificate && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {t('certificates')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="size-5" />
            {t('skills')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  skill.verified
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {skill.name}
                {skill.verified && <CheckCircle className="size-3" />}
              </span>
            ))}
            <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <Plus className="size-3" />
              Добавить навык
            </button>
          </div>
        </div>

        {/* Community */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="size-5" />
            {t('community')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{community.followers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('followers')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{community.following}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('following')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{community.groups}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('groups')}</div>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BookOpen className="size-5" />
            {t('myPortfolio')}
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Github className="size-12 mx-auto mb-3 opacity-50" />
            <p className="mb-4">{t('noPortfolioYet')}</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 mx-auto transition-colors">
              <Plus className="size-4" />
              {t('addProject')}
            </button>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('activityStats')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('myProjects')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('myStartups')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCourses.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('completedCourses')}</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('achievements')}</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('recentActivity')}
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t('noActivityYet')}
          </div>
        </div>
      </div>
    </div>
  );
}
