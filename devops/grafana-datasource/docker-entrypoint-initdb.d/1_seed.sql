CREATE TABLE metrics (
  metric_name CHAR(20),
  metric_value numeric,
  report_date timestamp
);

CREATE TABLE okr (
  okr_name CHAR(20),
  okr_value numeric,
  report_date timestamp
);

CREATE TABLE users (
  users_name CHAR(20),
  users_value numeric,
  report_date timestamp
);

CREATE TABLE code_commits (
  commit_name CHAR(20),
  commit_value numeric,
  report_date timestamp
);

CREATE TABLE deployments (
  deployment_name CHAR(20),
  deployment_value numeric,
  report_date timestamp
);

CREATE TABLE failed_deployments (
  deployment_name CHAR(20),
  deployment_value numeric,
  report_date timestamp
);

CREATE TABLE ram (
  ram_name CHAR(20),
  ram_value numeric,
  report_date timestamp
);

INSERT INTO metrics VALUES ('instances', 1, now());
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '1 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '2 hour'));
INSERT INTO metrics VALUES ('instances', 3, (now() - interval '3 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '4 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '5 hour'));
INSERT INTO metrics VALUES ('instances', 3, (now() - interval '6 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '7 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '8 hour'));
INSERT INTO metrics VALUES ('instances', 3, (now() - interval '9 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '10 hour'));
INSERT INTO metrics VALUES ('instances', 1, (now() - interval '11 hour'));
INSERT INTO metrics VALUES ('instances', 2, (now() - interval '12 hour'));

INSERT INTO okr VALUES ('sales_improvement', 55, now());
INSERT INTO okr VALUES ('sales_improvement', 52, (now() - interval '1 week'));
INSERT INTO okr VALUES ('sales_improvement', 54, (now() - interval '2 week'));
INSERT INTO okr VALUES ('sales_improvement', 50, (now() - interval '3 week'));
INSERT INTO okr VALUES ('sales_improvement', 48, (now() - interval '4 week'));
INSERT INTO okr VALUES ('sales_improvement', 43, (now() - interval '5 week'));
INSERT INTO okr VALUES ('sales_improvement', 42, (now() - interval '6 week'));
INSERT INTO okr VALUES ('sales_improvement', 46, (now() - interval '7 week'));
INSERT INTO okr VALUES ('sales_improvement', 40, (now() - interval '8 week'));
INSERT INTO okr VALUES ('sales_improvement', 38, (now() - interval '9 week'));
INSERT INTO okr VALUES ('sales_improvement', 36, (now() - interval '10 week'));
INSERT INTO okr VALUES ('sales_improvement', 37, (now() - interval '11 week'));
INSERT INTO okr VALUES ('sales_improvement', 38, (now() - interval '12 week'));

INSERT INTO users VALUES ('user_count', 60, now());
INSERT INTO users VALUES ('user_count', 52, (now() - interval '1 week'));
INSERT INTO users VALUES ('user_count', 54, (now() - interval '2 week'));
INSERT INTO users VALUES ('user_count', 50, (now() - interval '3 week'));
INSERT INTO users VALUES ('user_count', 48, (now() - interval '4 week'));
INSERT INTO users VALUES ('user_count', 43, (now() - interval '5 week'));
INSERT INTO users VALUES ('user_count', 42, (now() - interval '6 week'));
INSERT INTO users VALUES ('user_count', 46, (now() - interval '7 week'));
INSERT INTO users VALUES ('user_count', 40, (now() - interval '8 week'));
INSERT INTO users VALUES ('user_count', 38, (now() - interval '9 week'));
INSERT INTO users VALUES ('user_count', 36, (now() - interval '10 week'));
INSERT INTO users VALUES ('user_count', 41, (now() - interval '11 week'));
INSERT INTO users VALUES ('user_count', 39, (now() - interval '12 week'));

INSERT INTO code_commits VALUES ('commits', 1, now());
INSERT INTO code_commits VALUES ('commits', 3, (now() - interval '1 week'));
INSERT INTO code_commits VALUES ('commits', 4, (now() - interval '2 week'));
INSERT INTO code_commits VALUES ('commits', 1, (now() - interval '3 week'));
INSERT INTO code_commits VALUES ('commits', 6, (now() - interval '4 week'));
INSERT INTO code_commits VALUES ('commits', 9, (now() - interval '5 week'));
INSERT INTO code_commits VALUES ('commits', 1, (now() - interval '6 week'));
INSERT INTO code_commits VALUES ('commits', 1, (now() - interval '7 week'));
INSERT INTO code_commits VALUES ('commits', 4, (now() - interval '8 week'));
INSERT INTO code_commits VALUES ('commits', 2, (now() - interval '9 week'));
INSERT INTO code_commits VALUES ('commits', 9, (now() - interval '10 week'));
INSERT INTO code_commits VALUES ('commits', 8, (now() - interval '11 week'));
INSERT INTO code_commits VALUES ('commits', 1, (now() - interval '12 week'));

INSERT INTO deployments VALUES ('deployments', 1, now());
INSERT INTO deployments VALUES ('deployments', 3, (now() - interval '1 week'));
INSERT INTO deployments VALUES ('deployments', 4, (now() - interval '2 week'));
INSERT INTO deployments VALUES ('deployments', 1, (now() - interval '3 week'));
INSERT INTO deployments VALUES ('deployments', 4, (now() - interval '4 week'));
INSERT INTO deployments VALUES ('deployments', 5, (now() - interval '5 week'));
INSERT INTO deployments VALUES ('deployments', 5, (now() - interval '6 week'));
INSERT INTO deployments VALUES ('deployments', 1, (now() - interval '7 week'));
INSERT INTO deployments VALUES ('deployments', 1, (now() - interval '8 week'));
INSERT INTO deployments VALUES ('deployments', 3, (now() - interval '9 week'));
INSERT INTO deployments VALUES ('deployments', 2, (now() - interval '10 week'));
INSERT INTO deployments VALUES ('deployments', 1, (now() - interval '11 week'));
INSERT INTO deployments VALUES ('deployments', 5, (now() - interval '12 week'));

INSERT INTO failed_deployments VALUES ('failed_deployments', 1, now());
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '1 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '2 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '3 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 1, (now() - interval '4 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 2, (now() - interval '5 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '6 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 1, (now() - interval '7 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '8 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '9 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 2, (now() - interval '10 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 1, (now() - interval '11 week'));
INSERT INTO failed_deployments VALUES ('failed_deployments', 0, (now() - interval '12 week'));

INSERT INTO ram VALUES ('ram_usage', .4, now());
INSERT INTO ram VALUES ('ram_usage', .3, (now() - interval '1 week'));
INSERT INTO ram VALUES ('ram_usage', .3, (now() - interval '2 week'));
INSERT INTO ram VALUES ('ram_usage', .25, (now() - interval '3 week'));
INSERT INTO ram VALUES ('ram_usage', .25, (now() - interval '4 week'));
INSERT INTO ram VALUES ('ram_usage', .2, (now() - interval '5 week'));
INSERT INTO ram VALUES ('ram_usage', .2, (now() - interval '6 week'));
INSERT INTO ram VALUES ('ram_usage', .3, (now() - interval '7 week'));
INSERT INTO ram VALUES ('ram_usage', .2, (now() - interval '8 week'));
INSERT INTO ram VALUES ('ram_usage', .1, (now() - interval '9 week'));
INSERT INTO ram VALUES ('ram_usage', .1, (now() - interval '10 week'));
INSERT INTO ram VALUES ('ram_usage', .1, (now() - interval '11 week'));
INSERT INTO ram VALUES ('ram_usage', .1, (now() - interval '12 week'));