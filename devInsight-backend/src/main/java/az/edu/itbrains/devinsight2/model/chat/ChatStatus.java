package az.edu.itbrains.devinsight2.model.chat;

/**
 * Status of a chat conversation
 */
public enum ChatStatus {
    ACTIVE,     // Chat is ongoing
    COMPLETED,  // Chat has been completed by user
    EXPIRED     // Chat session has expired
}