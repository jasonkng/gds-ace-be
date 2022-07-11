--psql -U postgres

CREATE DATABASE football;

--\c into football

CREATE TABLE teams(
    team_id SERIAL PRIMARY KEY,
	team_name VARCHAR(100) NOT NULL,
    group_number INT NOT NULL,
	date_created VARCHAR(5) NOT NULL
);

SELECT * FROM teams;

INSERT INTO teams(team_name, group_number, date_created) VALUES('groupD', 1, '15/07');

CREATE TABLE matches(
  match_id SERIAL PRIMARY KEY,
  team_home VARCHAR(100) NOT NULL,
  team_away VARCHAR(100) NOT NULL,
  team_home_goals INT NOT NULL,
  team_away_goals INT NOT NULL
);