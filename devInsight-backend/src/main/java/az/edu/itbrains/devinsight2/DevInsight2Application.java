package az.edu.itbrains.devinsight2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DevInsight2Application {

    public static void main(String[] args) {
        SpringApplication.run(DevInsight2Application.class, args);
        System.out.println("🚀 DevInsight Application Started Successfully!");
        System.out.println("📖 API Docs: http://localhost:8080/api/swagger-ui.html");
        System.out.println("🏥 Health: http://localhost:8080/api/actuator/health");
    }
}