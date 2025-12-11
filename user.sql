CREATE USER gym_reception IDENTIFIED BY reception123;
CREATE USER gym_manager IDENTIFIED BY manager123;
CREATE USER admin IDENTIFIED BY admin123;

CREATE ROLE gym_reception_role;
CREATE ROLE gym_manager_role;
CREATE ROLE gym_admin_role;


GRANT CREATE SESSION TO admin, gym_reception, gym_manager;
GRANT UNLIMITED TABLESPACE TO admin;

GRANT SELECT, INSERT, UPDATE ON member TO gym_reception_role;
GRANT SELECT, INSERT ON payments TO gym_reception_role;
GRANT SELECT ON membership TO gym_reception_role;
GRANT SELECT ON v_active_members TO gym_reception_role;
 GRANT gym_reception_role to gym_reception;