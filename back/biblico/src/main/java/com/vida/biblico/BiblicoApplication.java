package com.vida.biblico;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class BiblicoApplication {

	public static void main(String[] args) {
		SpringApplication.run(BiblicoApplication.class, args);
	}

}
