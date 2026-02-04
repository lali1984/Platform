"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardAggregate = void 0;
class DashboardAggregate {
    constructor(user, metrics, activities, stats, recommendations, lastUpdated = new Date()) {
        this.user = user;
        this.metrics = metrics;
        this.activities = activities;
        this.stats = stats;
        this.recommendations = recommendations;
        this.lastUpdated = lastUpdated;
    }
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
    static create(user, metrics, activities, stats, recommendations) {
        return new DashboardAggregate(user, metrics, activities, stats, recommendations);
    }
}
exports.DashboardAggregate = DashboardAggregate;
