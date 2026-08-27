package com.tms.patterns.command;

import java.util.Stack;

/**
 * DESIGN PATTERN IMPLEMENTATION: Command Pattern (Java)
 * 
 * Pattern: Command (Behavioral)
 * Purpose: Encapsulates session scheduling/rescheduling actions into command objects with execute and undo methods.
 */

interface Command {
    void execute();
    void undo();
}

class ScheduleSessionCommand implements Command {
    private String sessionTitle;
    private String startTime;

    public ScheduleSessionCommand(String sessionTitle, String startTime) {
        this.sessionTitle = sessionTitle;
        this.startTime = startTime;
    }

    @Override
    public void execute() {
        System.out.println("⚡ Scheduled session '" + sessionTitle + "' at " + startTime);
    }

    @Override
    public void undo() {
        System.out.println("↩️ Undone session scheduling for '" + sessionTitle + "'");
    }
}

public class SessionCommand {
    private Stack<Command> history = new Stack<>();

    public void executeCommand(Command command) {
        command.execute();
        history.push(command);
    }

    public void undoLastCommand() {
        if (!history.isEmpty()) {
            Command cmd = history.pop();
            cmd.undo();
        }
    }
}
