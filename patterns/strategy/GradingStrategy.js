/**
 * DESIGN PATTERN IMPLEMENTATION: Strategy Pattern
 * 
 * Pattern: Strategy (Behavioral)
 * Purpose: Defines a family of interchangeable algorithms for student grade and performance 
 *          calculation, encapsulating each logic inside a separate strategy class.
 */

// Strategy Interface
class GradingStrategy {
    calculateOverallScore(data) {
        throw new Error('calculateOverallScore() must be implemented by concrete strategies.');
    }
}

// Concrete Strategy 1: Standard Percentage Strategy
class StandardPercentageStrategy extends GradingStrategy {
    calculateOverallScore({ assignmentScores = [], quizScores = [], attendancePercentage = 100 }) {
        const allScores = [...assignmentScores, ...quizScores];
        if (allScores.length === 0) return 0;
        const total = allScores.reduce((acc, curr) => acc + curr, 0);
        return Number((total / allScores.length).toFixed(2));
    }
}

// Concrete Strategy 2: Weighted Average Strategy (50% Assignments, 30% Quizzes, 20% Attendance)
class WeightedAverageStrategy extends GradingStrategy {
    calculateOverallScore({ assignmentScores = [], quizScores = [], attendancePercentage = 100 }) {
        const avgAssign = assignmentScores.length > 0 ? (assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length) : 0;
        const avgQuiz = quizScores.length > 0 ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0;
        
        const weightedScore = (avgAssign * 0.50) + (avgQuiz * 0.30) + (attendancePercentage * 0.20);
        return Number(weightedScore.toFixed(2));
    }
}

// Concrete Strategy 3: Attendance Bonus Strategy (Standard Average + 5% bonus for >90% attendance)
class AttendanceBonusStrategy extends GradingStrategy {
    calculateOverallScore({ assignmentScores = [], quizScores = [], attendancePercentage = 100 }) {
        const allScores = [...assignmentScores, ...quizScores];
        const baseAvg = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
        
        let bonus = 0;
        if (attendancePercentage >= 95) bonus = 5;
        else if (attendancePercentage >= 90) bonus = 3;

        const finalScore = Math.min(100, baseAvg + bonus);
        return Number(finalScore.toFixed(2));
    }
}

// Strategy Context Manager
class GradingContext {
    constructor(strategy = new WeightedAverageStrategy()) {
        this.strategy = strategy;
    }

    setStrategy(strategy) {
        console.log(`🔀 [Strategy Pattern] Switching grading strategy to: ${strategy.constructor.name}`);
        this.strategy = strategy;
    }

    evaluateStudentProgress(data) {
        return {
            strategyUsed: this.strategy.constructor.name,
            overallScore: this.strategy.calculateOverallScore(data),
            breakdown: {
                assignmentAvg: data.assignmentScores.length > 0 ? (data.assignmentScores.reduce((a,b)=>a+b,0)/data.assignmentScores.length).toFixed(2) : 'N/A',
                quizAvg: data.quizScores.length > 0 ? (data.quizScores.reduce((a,b)=>a+b,0)/data.quizScores.length).toFixed(2) : 'N/A',
                attendancePercentage: `${data.attendancePercentage}%`
            }
        };
    }
}

module.exports = {
    GradingContext,
    StandardPercentageStrategy,
    WeightedAverageStrategy,
    AttendanceBonusStrategy
};
