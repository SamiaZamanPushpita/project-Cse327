/**
 * Central exporter for all 8 Classic Design Patterns implemented in the system.
 */

const { UserFactory, AssessmentFactory } = require('./factory/UserAndAssessmentFactory');
const dbSingleton = require('../database/db');
const notificationPublisher = require('./observer/NotificationPublisherObserver');
const { GradingContext, StandardPercentageStrategy, WeightedAverageStrategy, AttendanceBonusStrategy } = require('./strategy/GradingStrategy');
const { CommandInvoker, ScheduleSessionCommand, RescheduleSessionCommand, CancelSessionCommand } = require('./command/SessionCommand');
const { TutorDashboardFacade, StudentDashboardFacade, ParentDashboardFacade } = require('./facade/DashboardFacade');
const { StorageService, LocalStorageAdapter, MockCloudStorageAdapter } = require('./adapter/StorageAdapter');
const { SessionStateContext } = require('./state/SessionState');

module.exports = {
    // 1. Factory Method Pattern
    UserFactory,
    AssessmentFactory,

    // 2. Singleton Pattern
    dbSingleton,

    // 3. Observer Pattern
    notificationPublisher,

    // 4. Strategy Pattern
    GradingContext,
    StandardPercentageStrategy,
    WeightedAverageStrategy,
    AttendanceBonusStrategy,

    // 5. Command Pattern
    CommandInvoker,
    ScheduleSessionCommand,
    RescheduleSessionCommand,
    CancelSessionCommand,

    // 6. Facade Pattern
    TutorDashboardFacade,
    StudentDashboardFacade,
    ParentDashboardFacade,

    // 7. Adapter Pattern
    StorageService,
    LocalStorageAdapter,
    MockCloudStorageAdapter,

    // 8. State Pattern
    SessionStateContext
};
