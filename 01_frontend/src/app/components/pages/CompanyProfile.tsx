import { Building2, Mail, MapPin, Users, Briefcase, TrendingUp, Target, Code, ExternalLink, Edit2, Camera, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface UserData {
  login: string;
  email: string;
}

interface CompanyProfileProps {
  userData: UserData;
}

export function CompanyProfile({}: CompanyProfileProps) {
  const { t } = useLanguage();

  // Mock company data
  const companyData = {
    name: 'TechStart Inc',
    slogan: 'IT-разработка | Стартап-акселератор',
    founded: '2022',
    locations: ['Москва', 'Берлин'],
    employeeCount: 24,
    activeProjects: 5,
    description: t('companyDescription'),
  };

  const team = [
    { id: 1, name: 'Иван Петров', role: 'CEO & Founder', avatar: 'И' },
    { id: 2, name: 'Анна Эксперт', role: 'CTO', avatar: 'А' },
    { id: 3, name: 'Петр Сидоров', role: 'Lead Developer', avatar: 'П' },
    { id: 4, name: 'Мария Иванова', role: 'Product Manager', avatar: 'М' },
  ];

  const vacancies = [
    {
      id: 1,
      title: 'Backend Developer',
      salary: '$3000-5000',
      location: 'Москва',
      type: 'Full-time',
      applicants: 12,
    },
    {
      id: 2,
      title: 'Frontend Developer',
      salary: '$2500-4000',
      location: 'Remote',
      type: 'Full-time',
      applicants: 8,
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      salary: '$3500-6000',
      location: 'Берлин',
      type: 'Full-time',
      applicants: 5,
    },
  ];

  const projects = [
    {
      id: 1,
      name: t('educationalPlatform'),
      status: t('inProgress'),
      team: 8,
      progress: 75,
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      status: t('planning'),
      team: 5,
      progress: 25,
    },
    {
      id: 3,
      name: 'AI Analytics Dashboard',
      status: t('inProgress'),
      team: 6,
      progress: 60,
    },
  ];

  const techStack = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Kafka', category: 'Infrastructure' },
    { name: 'Kubernetes', category: 'DevOps' },
    { name: 'PostgreSQL', category: 'Database' },
    { name: 'TypeScript', category: 'Language' },
  ];

  const partners = [
    { id: 1, name: 'Platform Ecosystem', type: t('accelerator') },
    { id: 2, name: 'Tech Ventures', type: t('investor') },
    { id: 3, name: 'Cloud Solutions Ltd', type: t('partner') },
  ];

  const portfolio = [
    {
      id: 1,
      title: 'E-Learning Platform v1.0',
      client: 'Education Corp',
      year: '2024',
      status: t('completed'),
    },
    {
      id: 2,
      title: 'Fintech Mobile App',
      client: 'Banking Solutions',
      year: '2023',
      status: t('completed'),
    },
  ];

  const news = [
    {
      id: 1,
      title: t('companyNewsTitle1'),
      date: '15 января 2026',
      text: t('companyNewsText1'),
    },
    {
      id: 2,
      title: t('companyNewsTitle2'),
      date: '10 января 2026',
      text: t('companyNewsText2'),
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Company Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Company Logo */}
            <div className="relative">
              <div className="size-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white text-3xl font-semibold">
                <Building2 className="size-12" />
              </div>
              <button className="absolute bottom-0 right-0 size-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                <Camera className="size-4" />
              </button>
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {companyData.name}
                </h1>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {t('verified')}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {companyData.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {companyData.locations.join(', ')}
                </span>
                <span>•</span>
                <span>{t('founded')} {companyData.founded}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {companyData.employeeCount} {t('employeesCount')}
                </span>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors">
                <Edit2 className="size-4" />
                {t('editCompanyProfile')}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="size-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('team')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{companyData.employeeCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('activeProjects')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{companyData.activeProjects}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="size-5 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('openVacancies')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{vacancies.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="size-5 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('completedProjects')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{portfolio.length}</p>
          </div>
        </div>

        {/* About Company */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Building2 className="size-5" />
            {t('aboutCompany')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {companyData.description}
          </p>
        </div>

        {/* Team */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Users className="size-5" />
            {t('ourTeam')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="size-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {t('viewAllTeam')}
          </button>
        </div>

        {/* Open Vacancies */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Briefcase className="size-5" />
            {t('openVacancies')}
          </h2>
          <div className="space-y-3">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{vacancy.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{vacancy.type} • {vacancy.location}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{vacancy.salary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{vacancy.applicants} {t('applicants')}</span>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                    {t('apply')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            {t('postNewVacancy')}
          </button>
        </div>

        {/* Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Target className="size-5" />
            {t('activeProjects')}
          </h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{project.status} • {project.team} {t('members')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-green-500 dark:bg-green-400 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Code className="size-5" />
            {t('techStack')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Award className="size-5" />
            {t('portfolio')}
          </h2>
          <div className="space-y-3">
            {portfolio.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.client} • {item.year}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="size-5" />
            {t('partners')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {partners.map((partner) => (
              <div key={partner.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{partner.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{partner.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company News */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ExternalLink className="size-5" />
            {t('companyNews')}
          </h2>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Mail className="size-5" />
            {t('contactInfo')}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <Mail className="size-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('businessInquiries')}</p>
                <p className="text-gray-900 dark:text-gray-100">business@techstart.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <Users className="size-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('recruitment')}</p>
                <p className="text-gray-900 dark:text-gray-100">hr@techstart.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
