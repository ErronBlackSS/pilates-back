CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '9bd2b9fc-446b-44ad-bbcd-d97c71004f5d',
    user_photo BYTEA,
    is_activated BOOLEAN NOT NULL DEFAULT FALSE,
    activation_link VARCHAR(255) DEFAULT NULL,
    lastname VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    refreshToken VARCHAR(512) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    resetToken VARCHAR(512) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE lesson_types (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(999) DEFAULT NULL,
    duration SMALLINT NOT NULL,
    global_lesson_type VARCHAR(64),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_photo (
    image_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    image_name VARCHAR(511) NOT NULL,
    image_server_path VARCHAR(511) NOT NULL,
    image_url VARCHAR(511) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE lesson_type_image (
    image_id SERIAL PRIMARY KEY,
    lesson_type_id INT NOT NULL,
    image_name VARCHAR(511) NOT NULL,
    image_server_path VARCHAR(511) NOT NULL,
    image_url VARCHAR(511) NOT NULL,
    FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    coach_id INT NOT NULL,
    lesson_type_id INT NOT NULL,
    capacity INT NOT NULL,
    occupied INT NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users_lessons_rel (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE trainer_info (
	trainer_id int PRIMARY KEY,
	education VARCHAR(999),
	certificates VARCHAR(999),
	personal_achievements VARCHAR(999),
	work_experience VARCHAR(999),
	directions VARCHAR(999),
	
	FOREIGN KEY (trainer_id) REFERENCES users(id)
);