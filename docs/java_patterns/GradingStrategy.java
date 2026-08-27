package com.tms.patterns.strategy;

import java.util.List;

/**
 * DESIGN PATTERN IMPLEMENTATION: Strategy Pattern (Java)
 * 
 * Pattern: Strategy (Behavioral)
 * Purpose: Encapsulates dynamic algorithms for calculating student overall progress.
 */

interface IGradingStrategy {
    double calculateOverallScore(List<Double> assignmentScores, List<Double> quizScores, double attendancePercentage);
}

class StandardPercentageStrategy implements IGradingStrategy {
    @Override
    public double calculateOverallScore(List<Double> assignmentScores, List<Double> quizScores, double attendancePercentage) {
        double sum = 0;
        int count = assignmentScores.size() + quizScores.size();
        for (double s : assignmentScores) sum += s;
        for (double s : quizScores) sum += s;
        return count == 0 ? 0 : sum / count;
    }
}

class WeightedAverageStrategy implements IGradingStrategy {
    @Override
    public double calculateOverallScore(List<Double> assignmentScores, List<Double> quizScores, double attendancePercentage) {
        double avgAssign = assignmentScores.isEmpty() ? 0 : assignmentScores.stream().mapToDouble(a -> a).average().getAsDouble();
        double avgQuiz = quizScores.isEmpty() ? 0 : quizScores.stream().mapToDouble(q -> q).average().getAsDouble();
        return (avgAssign * 0.50) + (avgQuiz * 0.30) + (attendancePercentage * 0.20);
    }
}

public class GradingStrategy {
    private IGradingStrategy strategy;

    public GradingStrategy(IGradingStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(IGradingStrategy strategy) {
        this.strategy = strategy;
    }

    public double evaluate(List<Double> assignments, List<Double> quizzes, double attendance) {
        return strategy.calculateOverallScore(assignments, quizzes, attendance);
    }
}
