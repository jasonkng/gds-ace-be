import express, { json } from "express";
import cors from "cors";
import morgan from "morgan";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = { origin: "*" };

app.use(cors(corsOptions));
app.use(json());
app.use(morgan("dev"));

let returnValue = {
  data: {},
  success: true,
  statusCode: 200
}

function clearData() {
  returnValue.data = {};
}

app.get("/teams", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(`SELECT * FROM teams`);
      returnValue.data = resp.rows.length > 0 ? resp.rows : {};
      res.status(200).send(returnValue);
      clearData();
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/addTeams", (req, res) => {
  try {
    pool.connect((error, client, release) => {
      console.log(req.body.body)
      req.body.teams.forEach(async (data) => {
        await client.query(`
          INSERT INTO teams(group_number, team_name, date_created)
          VALUES (${data.groupNumber}, '${data.teamName}', '${data.dateCreated}')`);
      });
      res.status(200).send(returnValue);
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});

app.post("/matches", (req, res) => {
  try {
    pool.connect((error, client, release) => {
      req.body.matches.forEach(async (data) => {
        await client.query(`
            INSERT INTO matches(team_home, team_away, team_home_goals, team_away_goals)
            VALUES ('${data.teamHome}', '${data.teamAway}', ${data.teamHomeGoals}, ${data.teamAwayGoals})`);
      });
      res.status(200).send(returnValue);
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/getMatches", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(`SELECT * FROM matches`);
      returnValue.data = resp.rows.length ? resp.rows : {};
      res.status(200).send(returnValue);
      clearData();
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/points/:groupNumber", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(`
      SELECT team_name, 
      SUM(points)/2 AS points, 
      SUM(mm.team_home_goals)/2 AS goals_scored,
      SUM(special_points)/2 AS special_points,
      date_created, group_number
      FROM teams T
      LEFT JOIN
      (SELECT team_home AS team, team_home_goals, team_away_goals,
          CASE WHEN team_home_goals > team_away_goals THEN 3
          WHEN team_home_goals = team_away_goals THEN 1
          ELSE 0
          END AS points
      FROM matches UNION ALL
      SELECT team_away AS team, team_away_goals, team_home_goals,
          CASE WHEN team_away_goals > team_home_goals THEN 3
          WHEN team_away_goals = team_home_goals THEN 1
          ELSE 0
          END AS points 
      FROM matches) mm
      ON T.team_name = mm.team
      LEFT JOIN
      (SELECT team_home AS team, team_home_goals, team_away_goals,
          CASE WHEN team_home_goals > team_away_goals THEN 5
          WHEN team_home_goals = team_away_goals THEN 3
          ELSE 1
          END AS special_points
      FROM matches UNION ALL
      SELECT team_away AS team, team_away_goals, team_home_goals,
          CASE WHEN team_away_goals > team_home_goals THEN 5
          WHEN team_away_goals = team_home_goals THEN 3
          ELSE 1
          END AS special_points 
      FROM matches) nn
      ON mm.team = nn.team
      WHERE group_number = ${req.params.groupNumber}
      GROUP BY T.team_name, date_created, group_number
      ORDER BY points DESC nulls LAST, goals_scored DESC nulls LAST, special_points DESC nulls LAST, to_date(date_created, 'DD/MM') ASC
        `);
      returnValue.data = resp.rows.length > 0 ? resp.rows : {};
      res.status(200).send(returnValue);
      clearData();
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});
//DELETE FROM matches WHERE match_id = 61
app.delete("/match/:matchId", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(`DELETE FROM matches WHERE match_id = ${req.params.matchId}`);
      res.send(returnValue);
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
})

app.delete("/deleteAll", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(`TRUNCATE teams, matches`);
      res.send(returnValue);
      client.release();
    });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
