import { UserProfileAggregate } from './user-profile.aggregate';

export interface DashboardMetric {
  id: string;
  name: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalPosts: number;
  engagementRate: number;
}

export class DashboardAggregate {
  constructor(
    public readonly user: UserProfileAggregate,
    public readonly metrics: DashboardMetric[],
    public readonly activities: DashboardActivity[],
    public readonly stats: DashboardStats,
    public readonly recommendations: any[],
    public readonly lastUpdated: Date = new Date()
  ) {}

  get summary() {
    return {
      user: this.user.displayName,
      totalMetrics: this.metrics.length,
      recentActivities: this.activities.length,
      lastUpdated: this.lastUpdated,
    };
  }

  toJSON() {
    return {
      user: this.user.toJSON(),
      metrics: this.metrics,
      activities: this.activities.map(activity => ({
        ...activity,
        timestamp: activity.timestamp.toISOString(),
      })),
      stats: this.stats,
      recommendations: this.recommendations,
      summary: this.summary,
      lastUpdated: this.lastUpdated.toISOString(),
    };
  }

  static create(
    user: UserProfileAggregate,
    metrics: DashboardMetric[],
    activities: DashboardActivity[],
    stats: DashboardStats,
    recommendations: any[]
  ): DashboardAggregate {
    return new DashboardAggregate(user, metrics, activities, stats, recommendations);
  }
}