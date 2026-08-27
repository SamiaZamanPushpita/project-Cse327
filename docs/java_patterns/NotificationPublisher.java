package com.tms.patterns.observer;

import java.util.ArrayList;
import java.util.List;

/**
 * DESIGN PATTERN IMPLEMENTATION: Observer Pattern (Java)
 * 
 * Pattern: Observer (Behavioral)
 * Purpose: Defines a 1-to-N dependency between Subject and Observers so that when 
 *          a session/grade event occurs, all registered observers update automatically.
 */

interface Observer {
    void update(String eventType, String message);
}

class StudentNotifierObserver implements Observer {
    @Override
    public void update(String eventType, String message) {
        System.out.println("   └─ [StudentNotifierObserver] Student Alert: " + eventType + " -> " + message);
    }
}

class ParentNotifierObserver implements Observer {
    @Override
    public void update(String eventType, String message) {
        System.out.println("   └─ [ParentNotifierObserver] Parent Alert: " + eventType + " -> " + message);
    }
}

public class NotificationPublisher {
    private List<Observer> observers = new ArrayList<>();

    public void subscribe(Observer observer) {
        observers.add(observer);
    }

    public void unsubscribe(Observer observer) {
        observers.remove(observer);
    }

    public void notifyObservers(String eventType, String message) {
        System.out.println("📡 [Subject] Broadcasting event '" + eventType + "' to " + observers.size() + " observers.");
        for (Observer obs : observers) {
            obs.update(eventType, message);
        }
    }
}
