package az.edu.itbrains.devinsight2.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-interview")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:5173",
                        "http://localhost:8080"
                )
                .withSockJS();

        registry.addEndpoint("/ws-interview-native")
                .setAllowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:3001",
                        "http://localhost:5173",
                        "http://localhost:8080"
                );
    }
}
