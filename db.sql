CREATE TABLE IF NOT EXISTS todo (
	task_id serial PRIMARY KEY,
	title TEXT NOT NULL,
	created_on DATE NOT NULL,
    due_date DATE
);
