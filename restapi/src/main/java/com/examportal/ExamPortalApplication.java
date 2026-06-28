package com.examportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class ExamPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamPortalApplication.class, args);

            Dotenv dotenv = Dotenv.load();

            System.setProperty("SUPABASE_DB_URL", dotenv.get("SUPABASE_DB_URL"));
            System.setProperty("SUPABASE_DB_USERNAME", dotenv.get("SUPABASE_DB_USERNAME"));
            System.setProperty("SUPABASE_DB_PASSWORD", dotenv.get("SUPABASE_DB_PASSWORD"));

    }
}
